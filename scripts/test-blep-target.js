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

assert.equal(pkg.version, "1.2.0-beta.3");
assert.match(pkg.displayName, /blep\.art/);
assert.match(pkg.namespace, /\/blep\.art$/);
assert.deepEqual(meta.match, ["https://blep.art/*"]);
assert(meta.connect.includes("blep.art"), "Blep API origin must be permitted");
assert(!meta.connect.includes("static1.e6ai.net"), "Old media origin must not be required");
assert.match(meta.updateURL, /v1\.2\.0-beta\.3/);
assert.match(meta.downloadURL, /v1\.2\.0-beta\.3/);
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


console.log("blep.art domain, identity, and API guard checks passed");
