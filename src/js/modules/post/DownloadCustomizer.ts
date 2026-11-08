import { Danbooru } from "../../components/api/Danbooru";
import { E621 } from "../../components/api/E621";
import { APIPost } from "../../components/api/responses/APIPost";
import { XM } from "../../components/api/XM";
import { Page, PageDefinition } from "../../components/data/Page";
import { ModuleController } from "../../components/ModuleController";
import { Post, PostData } from "../../components/post/Post";
import { PostParts } from "../../components/post/PostParts";
import { RE6Module, Settings } from "../../components/RE6Module";
import { MassDownloader } from "../downloader/MassDownloader";

/**
 * Uses the configured filename template for post-page downloads.
 * Site-native toolbar links are intercepted without altering other actions.
 */
export class DownloadCustomizer extends RE6Module {

  private post: PostData | null = null;
  private postRequest: Promise<PostData | null> | null = null;
  private downloading = false;
  private nativeDownloadHandler: (event: MouseEvent) => void;

  public constructor () {
    super(PageDefinition.post, true);
    this.registerHotkeys(
      { keys: "hotkeyDownload", fnct: this.hotkeyDownload },
    );
  }

  protected getDefaultSettings (): Settings {
    return {
      enabled: true,
      template: "%postid%-%director%-%franchise%-%character%-%species%",
      confirmDownload: false,
      downloadSamples: false,
      hotkeyDownload: "",
    };
  }

  public create (): void {
    super.create();

    // IMPORTANT: Do not parse full post metadata during initialization.
    // Some blep.art pages expose different embedded post data. A thrown parse
    // error previously prevented the handler from ever being installed.
    // Resolve post metadata lazily, only when the user requests a download.
    this.installNativeDownloadHandler();

    // The original three-dot menu already contains a Download entry; keep it
    // in place instead of adding a second, ambiguously named Download button.
    // The marker is useful for checking that the custom handler is installed.
    $(".ptbr-etc-download").attr("data-re6ai-named-download", "true");

    // A fallback button is useful for older layouts without a native menu.
    const native = $(".ptbr-etc-download, #ptbr-etc-menu [data-hotkey=download]");
    if (!native.length) {
      let $container = $(".ptbr-etc-menu").first();
      if (!$container.length) $container = $("#post-options").first();
      if (!$container.length) $container = $("#image-download-link").parent().first();

      if ($container.length && !$("#image-custom-download-file").length) {
        $("<a>")
          .attr({ id: "image-custom-download-file", href: "#", "data-re6ai-named-download": "true" })
          .html("Download (Renamed)")
          .addClass("st-button kinetic")
          .appendTo($container)
          .on("click", (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            void this.startNamedDownload();
          });
      }
    }

    // Keep the optional tag export, but do not parse metadata to render it.
    const $tagsContainer = $(".ptbr-etc-menu").first();
    if ($tagsContainer.length && !$("#image-custom-download-tags").length) {
      $("<a>")
        .attr({ id: "image-custom-download-tags", href: "#" })
        .html("Tags")
        .addClass("st-button kinetic")
        .appendTo($tagsContainer)
        .on("click", (event) => {
          event.preventDefault();
          void this.downloadTags();
        });
    }
  }

  public destroy (): void {
    if (this.nativeDownloadHandler) {
      document.removeEventListener("click", this.nativeDownloadHandler, true);
      this.nativeDownloadHandler = null;
    }

    $(".ptbr-etc-download").removeAttr("data-re6ai-named-download");
    $("#image-custom-download-file, #image-custom-download-tags").remove();
    super.destroy();
  }

  /**
   * blep's three-dot toolbar contains:
   *   #ptbr-etc-menu > a.ptbr-etc-download[data-hotkey="download"]
   *
   * This href is a distinct /data/download/... endpoint, not necessarily the
   * same URL as Post.file.original. Never compare it to the image URL.
   * Intercept during capture before the browser or site's menu code acts.
   */
  private installNativeDownloadHandler (): void {
    if (this.nativeDownloadHandler) return;

    this.nativeDownloadHandler = (event: MouseEvent): void => {
      if (event.defaultPrevented || event.button !== 0
        || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey)
        return;

      const target = event.target as Element;
      if (!target || !target.closest) return;

      const exact = target.closest(
        ".ptbr-etc-download, #ptbr-etc-menu [data-hotkey='download'], "
        + ".ptbr-etc-menu [data-hotkey='download']",
      );

      // A layout variant may render a button rather than an anchor. Identify
      // the action by its text ONLY when it is inside the post overflow menu.
      const menu = target.closest("#ptbr-etc-menu, .ptbr-etc-menu");
      const candidate = menu ? target.closest("a, button, [role='menuitem']") : null;
      const byLabel = candidate && menu.contains(candidate)
        && /^Download(?:\s+(?:File|Original|Image))?$/i.test((candidate.textContent || "").trim());

      if (!exact && !byLabel) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      void this.startNamedDownload();
    };

    document.addEventListener("click", this.nativeDownloadHandler, true);
  }

  /**
   * Read metadata only when required. A failed embedded-post parser should
   * never suppress the Download control or stop other re6AI modules loading.
   */
  private async resolvePost (): Promise<PostData | null> {
    if (this.post) return this.post;
    if (this.postRequest) return this.postRequest;

    this.postRequest = (async (): Promise<PostData | null> => {
      try {
        const fromDOM = Post.getViewingPost();
        if (fromDOM && fromDOM.file && fromDOM.id) {
          this.post = fromDOM;
          return this.post;
        }
      } catch {
        // blep may omit the original e6AI base64 #post-data payload.
      }

      const postID = Number(Page.getPageID());
      if (!Number.isSafeInteger(postID) || postID <= 0) return null;

      try {
        const apiPost = await E621.Post.id(postID).first<APIPost>();
        if (!apiPost || apiPost.id !== postID) throw new Error("Unexpected post API response");
        this.post = PostData.fromAPI(apiPost, "0");
        return this.post;
      } catch (error) {
        console.error("reBlep Personal: cannot load current post metadata for download", error);
        return null;
      }
    })();

    try {
      return await this.postRequest;
    } finally {
      this.postRequest = null;
    }
  }

  private getDownloadUrl (post: PostData): string {
    if (this.fetchSettings<boolean>("downloadSamples") && post.has.sample)
      return post.file.sample || post.file.original;
    return post.file.original;
  }

  private getDownloadFileName (post: PostData): string {
    let ext = post.file.ext as string;
    if (this.fetchSettings<boolean>("downloadSamples") && post.has.sample) {
      const sampleURL = post.file.sample || "";
      const match = sampleURL.split("?")[0].match(/\.([a-z0-9]+)$/i);
      if (match) ext = match[1].toLowerCase();
    }
    return DownloadCustomizer.getFileName(post, this.fetchSettings<string>("template"), ext);
  }

  private async startNamedDownload (): Promise<void> {
    if (this.downloading) return;
    this.downloading = true;

    const post = await this.resolvePost();
    if (!post) {
      this.downloading = false;
      Danbooru.error("Unable to read this post's data for a named download.");
      return;
    }

    const url = this.getDownloadUrl(post);
    if (!url) {
      this.downloading = false;
      Danbooru.error("No downloadable file URL is available for this post.");
      return;
    }

    const name = DownloadCustomizer.confirmFilename(this.getDownloadFileName(post));
    if (name === null) {
      this.downloading = false;
      return;
    }

    XM.Connect.download({
      url: url,
      name: name,
      onload: () => { this.downloading = false; },
      onerror: (error) => {
        this.downloading = false;
        Danbooru.error("Unable to download this file. See the browser console for details.");
        console.error("reBlep Personal: named download failed", error);
      },
      ontimeout: (error) => {
        this.downloading = false;
        Danbooru.error("The file download timed out.");
        console.error("reBlep Personal: named download timed out", error);
      },
    });
  }

  private async downloadTags (): Promise<void> {
    const post = await this.resolvePost();
    if (!post) {
      Danbooru.error("Unable to read post tags for download.");
      return;
    }
    const content = PostParts.formatHoverText(post);
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = DownloadCustomizer.getFileName(post, this.fetchSettings<string>("template"), "txt");
    (document.body || document.documentElement).appendChild(anchor);
    try {
      anchor.click();
    } finally {
      window.setTimeout(() => {
        anchor.remove();
        URL.revokeObjectURL(url);
      }, 30000);
    }
  }

  /** Existing settings UI uses this method after changes to filename options. */
  public refreshDownloadLink (): void {
    const link = $("#image-custom-download-file");
    if (!this.post || !link.length) return;
    link.attr({
      href: this.getDownloadUrl(this.post),
      download: this.getDownloadFileName(this.post),
    });
  }

  private hotkeyDownload (): void {
    void this.startNamedDownload();
  }

  /**
   * Confirm or edit the proposed filename if the user enabled confirmation.
   * The browser decides whether to prompt for the actual download directory.
   */
  public static confirmFilename (filename: string): string | null {
    if (!ModuleController.fetchSettings<boolean>(DownloadCustomizer, "confirmDownload"))
      return filename;

    const response = window.prompt("Download file as:", filename);
    if (response === null) return null;
    const safeName = response.trim().replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");
    return safeName.length ? safeName : null;
  }

  public static getFileName (post: PostData, template?: string, ext?: string): string {
    if (!template) template = ModuleController.fetchSettings<string>(DownloadCustomizer, "template");

    const base = MassDownloader.createFilenameBase(template, post)
      .slice(0, 128)
      .replace(/-{2,}/g, "-")
      .replace(/-*$/g, "")
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
      .trim();

    return (base || String(post.id)) + "." + (ext ? ext : post.file.ext);
  }

}
