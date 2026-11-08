// Executable API response regression checks using blep.art's documented
// artist/copyright tag groups and wrapped/unwrapped response variants.
import { strict as assert } from "node:assert";
import { APIPost } from "../src/js/components/api/responses/APIPost.ts";
import { unwrapResponse } from "../src/js/components/api/responses/ResponseUnwrap.ts";

const blepTags = {
  artist: ["artist_one", "artist_two"],
  contributor: ["artist_two", "colorist"],
  copyright: ["example_series"],
  general: ["solo", "digital_media"],
  character: ["sample_character"],
  species: ["fox"],
  invalid: [],
  meta: ["hi_res"],
  lore: [],
};
const originalTags = JSON.stringify(blepTags);
const normalized = APIPost.normalizeTags(blepTags);
assert.deepEqual(normalized.director, ["artist_one", "artist_two", "colorist"]);
assert.deepEqual(normalized.franchise, ["example_series"]);
assert.deepEqual(normalized.character, ["sample_character"]);
assert.deepEqual(normalized.species, ["fox"]);
assert.equal(JSON.stringify(blepTags), originalTags, "normalization must not mutate input");

const post = { id: 194198, tags: blepTags };
const tags = APIPost.getTags(post);
assert(tags.includes("artist_one") && tags.includes("example_series") && tags.includes("fox"));
assert.equal(tags.length, new Set(tags).size, "all tags should be unique");

const legacy = APIPost.normalizeTags({
  director: ["old_director"], franchise: ["old_franchise"], general: ["old_general"],
});
assert.deepEqual(legacy.director, ["old_director"]);
assert.deepEqual(legacy.franchise, ["old_franchise"]);
assert.deepEqual(APIPost.normalizeTags(undefined).director, []);

const samplePosts = [post, { id: 194193, tags: blepTags }];
assert.deepEqual(unwrapResponse({ posts: samplePosts }, "posts"), samplePosts);
assert.deepEqual(unwrapResponse(samplePosts, "posts"), samplePosts);
assert.deepEqual(unwrapResponse({ post }, "post"), [post]);
assert.deepEqual(unwrapResponse(post, "post"), [post]);
assert.deepEqual(unwrapResponse({ posts: [] }, "posts"), []);
assert.deepEqual(unwrapResponse(null, "posts"), []);
console.log("blep.art API tag categories and wrapped/unwrapped responses passed");
