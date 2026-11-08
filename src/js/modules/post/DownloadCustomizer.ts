import { XM } from "../../components/api/XM";
import { Danbooru } from "../../components/api/Danbooru";
import { PageDefinition } from "../../components/data/Page";
import { ModuleController } from "../../components/ModuleController";
import { Post, PostData } from "../../components/post/Post";
import { PostParts } from "../../components/post/PostParts";
import { RE6Module, Settings } from "../../components/RE6Module";
import { MassDownloader } from "../downloader/MassDownloader";

/**
 * Renames the files to a user-readable scheme for download
 */
export class DownloadCustomizer extends RE6Module {

  private post: Post;

  private nativeDownloadHandler: (event: MouseEvent) => void;

  public constructor () {
    super(PageDefinition.post, true);
    this.registerHotkeys(
      { keys: "hotkeyDownload", fnct: this.hotkeyDownload },
    );
  }

  /**
   * Returns a set of default settings values
   * @returns Default settings
   */
  protected getDefaultSettings (): Settings {
    return {
      enabled: true,
      template: "%postid%-%director%-%franchise%-%character%-%species%",
      confirmDownload: false,
      downloadSamples: false,
      hotkeyDownload: "",
    };
  }

  /**
   * Creates the module's structure.
   * Should be run immediately after the constructor finishes.
   */
  public create (): void {
    super.create();

    this.post = Post.getViewingPost();

    // The site's own dropdown can still download under a CDN/MD5 filename.
    // Intercept its actual file links, including links added after startup.
    this.installNativeDownloadHandler();

    // Danbooru themes can relocate the post toolbar between releases.
    // Use the established action container first; keep other known menus as fallbacks.
    let downloadContainer = $(".ptbr-etc-menu").first();
    if (!downloadContainer.length) downloadContainer = $("#image-download-link").parent().first();
    if (!downloadContainer.length) downloadContainer = $("#post-options").first();
    if (!downloadContainer.length) {
      console.warn("re6AI Personal: no supported post download toolbar found");
      return;
    }
    if (downloadContainer.find("#image-custom-download-file").length) return;

    // Keep the original dropdown visible: it contains other site actions.
    // Its direct file download links will use the renamed handler below.
    const link = $("<a>")
      .attr({
        id: "image-custom-download-file",
        href: this.getDownloadUrl(),
        download: this.getDownloadFileName(),
      })
      .html("Download (Renamed)")
      .addClass("st-button kinetic")
      .appendTo(downloadContainer)
      .on("click", (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        this.startNamedDownload();
      });

    const tags = $("<a>")
      .attr({
        id: "image-custom-download-tags",
        href: this.getTagsBlock(),
        download: this.parseTemplate("txt"),
      })
      .html("Tags")
      .addClass("st-button kinetic")
      .appendTo(downloadContainer)
      .on("click", () => {
        tags.attr("loading", "true");

        tags.attr({
          loading: "false",
          href: this.getTagsBlock(),
        });
      });
  }

  public destroy (): void {
    if (this.nativeDownloadHandler) {
      document.removeEventListener("click", this.nativeDownloadHandler, true);
      this.nativeDownloadHandler = null;
    }
    $("#image-custom-download-file, #image-custom-download-tags").remove();
    super.destroy();
  }

  /**
   * Keep the site's Download dropdown working with the custom filename.
   * A delegated capture handler also catches dropdown entries created later
   * by the site's own JavaScript before it starts a native download.
   */
  private installNativeDownloadHandler (): void {
    if (this.nativeDownloadHandler) return;
    this.nativeDownloadHandler = (event: MouseEvent): void => {
      const target = event.target as Element;
      if (!target || !target.closest) return;

      // The inserted custom link calls startNamedDownload on its own.
      // Never intercept the "Tags" link or the image fullscreen control.
      if (target.closest("#image-custom-download-file, #image-custom-download-tags"))
        return;

      const link = target.closest<HTMLAnchorElement>(
        ".ptbr-etc-menu a[href], .ptbr-etc-download a[href], "
        + "a.ptbr-etc-download[href], #post-options a[href], #image-download-link a[href]",
      );
      if (!link) return;
      if (link.closest("#image-download-link") && /fullscreen/i.test(link.textContent || ""))
        return;
      if (!this.isPostMediaLink(link)) return;

      event.preventDefault();
      event.stopImmediatePropagation();
      this.startNamedDownload();
    };
    document.addEventListener("click", this.nativeDownloadHandler, true);
  }

  /** Only intercept links to the current post's media, not other menu actions. */
  private isPostMediaLink (link: HTMLAnchorElement): boolean {
    try {
      const url = new URL(link.href, window.location.href);
      if (!["https:", "http:"].includes(url.protocol)) return false;

      for (const media of [this.post.file.original, this.post.file.sample]) {
        if (!media) continue;
        const known = new URL(media, window.location.href);
        if (url.origin === known.origin && url.pathname === known.pathname)
          return true;
      }

      // Some themes show alternate original/sample resolutions in a dropdown.
      // Limit this fallback to actual media paths inside download menus.
      return url.pathname.includes("/data/")
        && (link.hasAttribute("download") || !!link.closest(".ptbr-etc-download"));
    } catch {
      return false;
    }
  }

  /** The sole path used by the custom button and native dropdown downloads. */
  private startNamedDownload (): void {
    const url = this.getDownloadUrl();
    const name = DownloadCustomizer.confirmFilename(this.getDownloadFileName());
    if (name === null) return;
    if (!url) {
      Danbooru.error("No downloadable file URL is available for this post.");
      return;
    }

    const link = $("#image-custom-download-file");
    if (link.attr("loading") === "true") return;
    link.attr("loading", "true");
    XM.Connect.download({
      url: url,
      name: name,
      onload: () => { link.removeAttr("loading"); },
      onerror: (error) => {
        link.removeAttr("loading");
        Danbooru.error("Unable to download this file. See the browser console for details.");
        console.error("re6AI Personal: file download failed", error);
      },
      ontimeout: (error) => {
        link.removeAttr("loading");
        Danbooru.error("The file download timed out.");
        console.error("re6AI Personal: file download timed out", error);
      },
    });
  }

  /** Creates a download link with the saved template */
  public refreshDownloadLink (): void {
    $("#image-custom-download-file").attr({
      href: this.getDownloadUrl(),
      download: this.getDownloadFileName(),
    });
  }

  /** The actual source chosen by the 'Download Samples' setting. */
  private getDownloadUrl (): string {
    if (this.fetchSettings<boolean>("downloadSamples") && this.post.has.sample)
      return this.post.file.sample || this.post.file.original;
    return this.post.file.original;
  }

  /** Ensure that a sampled JPG is not incorrectly saved with the original extension. */
  private getDownloadFileName (): string {
    let ext = this.post.file.ext as string;
    if (this.fetchSettings<boolean>("downloadSamples") && this.post.has.sample) {
      const sampleURL = this.post.file.sample || "";
      const match = sampleURL.split("?")[0].match(/\.([a-z0-9]+)$/i);
      if (match) ext = match[1].toLowerCase();
    }
    return this.parseTemplate(ext);
  }

  /**
   * Native Blob downloads respect filenames, but Firefox does not let a
   * userscript force the OS 'Save As' chooser. Confirm the suggested name here
   * and let the browser's configured download location behavior decide where
   * the file is stored.
   */
  public static confirmFilename (filename: string): string | null {
    if (!ModuleController.fetchSettings<boolean>(DownloadCustomizer, "confirmDownload"))
      return filename;

    const response = window.prompt("Download file as:", filename);
    if (response === null) return null;
    const safeName = response.trim().replace(/[<>:"/\\|?*\x00-\x1f]/g, "_");
    return safeName.length ? safeName : null;
  }

  private getTagsBlock (): string {
    return URL.createObjectURL(new Blob(
      [PostParts.formatHoverText(this.post)],
      { type: "text/plain" },
    ));
  }

  private hotkeyDownload (): void {
    const link = $("#image-custom-download-file")[0] as HTMLElement;
    if (link) link.click();
  }

  /**
   * Parses the download link template, replacing variables with their corresponding values
   * @returns string Download link
   */
  private parseTemplate (ext?: string): string {
    return DownloadCustomizer.getFileName(this.post, this.fetchSettings("template"), ext);
  }

  /**
   * Parses the download link template, replacing variables with their corresponding values
   * @returns string Download link
   */
  public static getFileName (post: PostData, template?: string, ext?: string): string {
    if (!template) template = ModuleController.fetchSettings<string>(DownloadCustomizer, "template");

    // No, I don't know why some modules use this method instead of going straight to MassDownloader

    const base = MassDownloader.createFilenameBase(template, post)
      .slice(0, 128)
      .replace(/-{2,}/g, "-")
      .replace(/-*$/g, "")
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, "_")
      .trim();
    return (base || String(post.id)) + "." + (ext ? ext : post.file.ext);
  }

}
