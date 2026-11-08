# Migrating re6AI Personal to blep.art

## Why

e6AI announced on **November 4, 2026** that it would shut down on **November 13, 2026**. [blep.art](https://blep.art/) is a replacement imageboard built on a compatible Danbooru-derived API and page layout. The new site's [API documentation](https://blep.art/help/api) and [e6AI migration FAQ](https://blep.art/help/faq) describe the transition.

This branch ports **re6AI Personal** to **blep.art**. It does not change the previously published e6AI-only **v1.1.0-beta.1** userscript.

## Technical changes

- The userscript's `@match` is **`https://blep.art/*`**; it is deliberately no longer registered on e6ai.net.
- The separate `@name` and `@namespace` distinguish the blep install from the old e6AI userscript. This prevents GM subscription lists (which refer to numeric post, topic and user IDs) from automatically crossing into a different site's account/database. Per-origin localStorage also remains isolated.
- API calls already used the current page's origin and supplied the required `_client` query parameter; the minimum API delay is now **1,000 ms** to respect blep's documented rate limit.
- Old static1.e6ai.net preview links are not used. The script uses post JSON `file.url`, `preview.url` and `sample.url` wherever available. The legacy MD5-only preview fallback attempts to infer the asset origin from an existing blep thumbnail, falling back to the current domain when unavailable.
- The extension manifest is updated for source compatibility, but **extension packaging has not been tested or released**.
- The script release version for the port is **1.2.0-beta.1**. No GitHub release should be tagged until live blep browser tests pass.

## API expectations

The blep API documents `/posts.json`, `/favorites.json`, `/tags.json`, and other Danbooru-like routes. Blep asks JavaScript userscripts to send `_client` when they cannot set a custom User-Agent and enforces a hard maximum of two API requests per second, advising a sustained rate below that. Our default is one API request per second **from the userscript API queue**, not a global limit across other browser tabs or tools.

**Never auto-copy old subscription IDs or settings requiring site-specific entities.** Blep provides its own e6AI favorites import at [blep.art/maintenance/user/e6ai_favorite_import](https://blep.art/maintenance/user/e6ai_favorite_import). Use that official process for favorites instead of assuming the same post IDs refer to the same content.

## Manual test checklist

1. Install the GitHub Actions artifact `script.user.js` from the port PR in Violentmonkey or Tampermonkey. Confirm the new name **re6AI Personal — blep.art**, version **1.2.0-beta.1**, and match domain `blep.art`.
2. Keep the original e6AI beta installed if desired: the two scripts should not be active on the same website.
3. Open blep's home page and `/posts`. Confirm the header, settings, tag sidebar, thumbnails and blacklist display correctly.
4. Open `/posts/<id>` pages; confirm actual media/thumbnail URLs work, custom download controls appear, and no requests go to `static1.e6ai.net`.
5. Test tag subscriptions and notifications, with a restart; they should start fresh on blep, without importing old e6AI IDs.
6. Confirm downloads and post navigation, without crossing back to e6AI URLs.
7. Test favorites, pools and forums using your blep account. Verify the script does not assume the e6AI user ID.
8. Inspect the Network panel: API calls should target `blep.art`, include `_client`, and remain near or below one per second.
9. Check Firefox with Violentmonkey and Chromium with Tampermonkey, including responsive layouts.

## Known unknowns

- The exact blep media/CDN origin used in every context has not been confirmed; MD5-only preview fallback needs browser validation, although API-supplied media URLs remain authoritative.
- The server may have differences in individual tag categories, page markup, or permissions; e6AI's source structure alone does not guarantee compatibility.
- Feature-modernization PR #2 (Profile Enhancer) remains **separate**, unmerged and intentionally excluded from this first domain-port branch.
- `re621.app` is still used as an inherited Avoid Posting data source. It is not verified against blep's distinct site policies and should be audited before relying on its results for decisions.

## Credits

This adaptation derives from re6AI and re621 by bitWolfy and credited contributors Sindrake and Earlopain. Independent maintenance by BlackShuck89. GPLv3 and upstream notices remain in force.
