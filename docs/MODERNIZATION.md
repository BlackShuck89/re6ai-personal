# Feature modernization roadmap

This project is **not** a drop-in replacement for the re621 2.x architecture. We are porting compatible functionality to the existing, e6AI-specific re6AI 1.x codebase, one small change at a time.

## Current feature slice: Profile Enhancer (unreleased)

**Source inspiration:** [re621 2.x ProfileEnhancer](https://github.com/re621/re621-alpha/blob/main/src/js/components/minor/ProfileEnhancer.ts) and [its stylesheet](https://github.com/re621/re621-alpha/blob/main/src/css/components/_profile-enhancer.scss). The implementation here is adapted for re6AI Personal's `RE6Module` lifecycle and the e6AI page structure. The GPLv3 and upstream credit are retained.

The new **Enhanced User Profiles** option is found in **re6AI Personal Settings → Features**.

- Off by default: existing sites, profiles and script settings keep their original appearance.
- When enabled, profile favorites/uploads are shown in a responsive card layout with readable headings and cleaner spacing.
- Only profile pages with the expected `#c-users #a-show` favorites/uploads markup are affected. No profile data, links or DOM nodes are replaced, and user edit pages remain untouched.
- Uses existing module settings storage, including the settings export/import mechanism, without changing old keys.
- Can be enabled or disabled immediately on a supported profile page, without requiring a script reinstall.

## Already present in re6AI Personal

Some modules that appear modern in re621 2.x already have legacy counterparts, so porting them again would duplicate or conflict with working behavior:

| re621 2.x module | Existing re6AI code | Action |
| --- | --- | --- |
| StickyElements | `Miscellaneous` sticky header/sidebar/quick-edit controls | Audit behavior, don't duplicate |
| ThumbnailResizer | `BetterSearch` thumbnail resizing and buttons | Improve selectively |
| QuoteTools | `Miscellaneous` reply/quoting and copy ID | Audit edge cases |
| ModeExtender | `SearchUtilities` and related post interaction code | Compare later |
| BlacklistUI | `BlacklistEnhancer`, `Blacklist` | Compare carefully; avoid changing filtering semantics |

## Manual acceptance checks

1. Open **Settings → Features** and verify the **Enhanced User Profiles** checkbox is initially **off**.
2. Open a user profile with visible favorites/uploads. The layout should be unchanged while disabled.
3. Enable the checkbox and verify a responsive favorites/uploads layout appears (reload the profile if necessary after enabling it elsewhere).
4. Turn the feature off on that profile and confirm the original layout returns immediately.
5. Reload and revisit the profile to confirm the checkbox state persists.
6. Verify normal browsing, downloads, subscriptions, profiles lacking those sections, and user edit forms are unaffected.
7. Test desktop and narrow/mobile viewport widths in Firefox and Chromium.

## Upcoming candidates

- Improved profile-section controls once verified against e6AI's actual DOM.
- Modernize the existing thumbnail sizing controls without duplicating the resizer.
- Bring over targeted newer post-viewer and search improvements after identifying upstream feature differences and verifying e6AI API compatibility.
- Add browser DOM tests that cover module activation, settings persistence, and responsive layout.

This document describes implementation status, not a claim of complete parity with re621 2.x.
