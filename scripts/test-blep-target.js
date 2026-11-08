// Minimal build-time regression checks for the blep.art port.
// These run without browser access or live API traffic.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

function read(rel) {
  return fs.readFileSync(path.join(__dirname, "..", rel), "utf8");
}

const pkg = JSON.parse(read("package.json"));
const meta = JSON.parse(read("bin/userscript-header.json"));
const extension = JSON.parse(read("bin/extension-manifest.json"));
const api = read("src/js/components/api/E621.ts");
const post = read("src/js/components/post/Post.ts");

assert.equal(pkg.version, "1.2.0-beta.5");
assert.match(pkg.displayName, /blep\.art/);
assert.match(pkg.namespace, /\/blep\.art$/);
assert.deepEqual(meta.match, ["https://blep.art/*"]);
assert(meta.connect.includes("blep.art"), "Blep API origin must be permitted");
assert(!meta.connect.includes("static1.e6ai.net"), "Old media origin must not be required");
assert.match(meta.updateURL, /v1\.2\.0-beta\.5/);
assert.match(meta.downloadURL, /v1\.2\.0-beta\.5/);
assert(extension.content_scripts.some((c) => c.matches.includes("https://blep.art/*")));
assert.match(api, /query\["_client"\]\s*=\s*window\["re621"\]\["useragent"\]/);
assert.match(api, /requestRateLimit\s*=\s*1000\s*;/);
assert.match(api, /delay\s*<\s*E621\.requestRateLimit/);
assert(!post.includes("static1.e6ai.net"), "Preview generation must not use the retired CDN");
const main = read("src/js/main.ts");
const miscellaneous = read("src/js/modules/general/Miscellaneous.ts");
// A post-page API request must never block the global module loader.
assert(!main.includes("await Post.prepareViewingPostData()"),
  "No post-data network request may block feature module registration");
assert(!post.includes("prepareViewingPostData"),
  "Retain the previously working post model without eager post-data requests");
assert(miscellaneous.includes("const postID = Number(Page.getPageID());"),
  "Set-removal must derive the post ID without reading full post data");
assert(miscellaneous.includes("PostActions.removeSet(id, postID);"),
  "Set-removal must use the validated page ID");
assert(miscellaneous.includes("catch (domError)"),
  "The optional Reupload shortcut should recover locally from missing post metadata");
const setLinkPattern = new RegExp("/post_sets/([0-9]+)(?:[/?#]|$)");
assert.equal("/post_sets/123".match(setLinkPattern)[1], "123");
assert.equal("/post_sets/42?source=post".match(setLinkPattern)[1], "42");
assert.equal("https://blep.art/post_sets/7".match(setLinkPattern)[1], "7");
for (const tracker of ["TagTracker", "PoolTracker", "CommentTracker"]) {
  const source = read(`src/js/modules/subscriptions/${tracker}.ts`);
  assert(!source.includes("e6ai.net"), `${tracker} must not link to the retired site`);
  assert(!source.includes("static1.e6ai.net"), `${tracker} must not use the retired CDN`);
  assert.match(source, /PostData\.createPreviewUrlFromMd5/);
  assert.match(source, /PostData\.createSampleUrlFromMd5/);
}
assert(!read("src/js/modules/search/BetterSearch.ts").includes("https://e6ai.net"),
  "Post history must stay on blep.art");



// Filename regression guards: post and search downloads must preserve the
// configured filename rather than allowing GM_download to use the CDN basename.
const connect = read("src/js/components/api/XMConnect.ts");
const customizer = read("src/js/modules/post/DownloadCustomizer.ts");
const search = read("src/js/modules/search/BetterSearch.ts");
const massDownloader = read("src/js/modules/downloader/MassDownloader.ts");
const settings = read("src/js/modules/general/SettingsController.ts");
assert(connect.includes("anchor.download = details.name;"),
  "Blob download anchor must use the configured filename");
assert(connect.includes("(document.body || document.documentElement).appendChild(anchor);"),
  "Firefox requires an attached download anchor");
assert(connect.includes("URL.revokeObjectURL(objectUrl);"),
  "Blob download URL must be cleaned up");
assert(customizer.includes("XM.Connect.download({"),
  "Individual post downloads should preserve the configured filename");
// The upstream toolbar renders this Download action as:
// #ptbr-etc-menu > a.ptbr-etc-download[data-hotkey="download"]
// Its URL can be a /data/download/ endpoint, not Post.file.original.
assert(customizer.includes("this.installNativeDownloadHandler();"),
  "Post-page initialization must always install its native menu handler");
assert(customizer.includes('document.addEventListener("click", this.nativeDownloadHandler, true);'),
  "Native download interception must run before the site's click handlers");
assert(customizer.includes('document.removeEventListener("click", this.nativeDownloadHandler, true);'),
  "Native handler must be removed when the module is disabled");
assert(customizer.includes(".ptbr-etc-download"),
  "Match the actual three-dot dropdown Download entry");
assert(customizer.includes("[data-hotkey='download']"),
  "Match the site's download hotkey attribute");
assert(customizer.includes("event.stopImmediatePropagation();"),
  "Block the site's original hash-named download action");
assert(customizer.includes("const byLabel ="),
  "Support button-like menu layouts by their label, scoped to the menu");
assert(customizer.includes("void this.startNamedDownload();"),
  "Native menu downloads must be routed through the named handler");
assert(!customizer.includes("isPostMediaLink"),
  "Do not filter out the native Download URL by comparing it to the image URL");
const createBlock = customizer.slice(customizer.indexOf("public create (): void"),
  customizer.indexOf("public destroy (): void"));
assert(!createBlock.includes("Post.getViewingPost()"),
  "DownloadCustomizer must not parse post metadata before attaching the menu handler");
assert(!createBlock.includes("await E621"),
  "DownloadCustomizer initialization must not wait on an API request");
assert(customizer.includes("E621.Post.id(postID).first<APIPost>()"),
  "Resolve missing post metadata lazily when a download is requested");
assert(customizer.includes("if (!native.length)"),
  "Do not add a duplicate Download button when the site already provides one");
assert(!customizer.includes('$(".ptbr-etc-download, #image-download-link").hide();'),
  "Do not hide the site's three-dot menu or fullscreen controls");

assert(!customizer.includes("XM.Connect.browserDownload("),
  "Individual post downloads must not use the filename-ignoring path");
assert(customizer.includes("this.getDownloadFileName(post)"),
  "Downloads must use the current filename settings and resolved post metadata");
assert(search.includes("XM.Connect.download({"),
  "Search-mode downloads should use the filename-preserving path");
assert(search.includes("DownloadCustomizer.getFileName(post)"),
  "Search-mode downloads should use the configured name format");
assert(massDownloader.includes("const trimmedArtists = new Set(post.tags.director);"),
  "Filename creation must not mutate the post's tag data");
assert(settings.includes("confirm or edit the generated filename"),
  "Download confirmation text must describe its actual behavior");

console.log("blep.art domain, API, startup, and download filename guard checks passed");
