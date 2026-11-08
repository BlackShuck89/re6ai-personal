# reBlep

**An independently maintained enhancement userscript for [blep.art](https://blep.art/), derived from re6AI and re621.**

reBlep began as a personal continuation of [re6AI](https://github.com/re621/re6ai), the e6AI adaptation of bitWolfy's [re621](https://github.com/re621/re621.Legacy) userscript. With e6AI's closure announced for **November 13, 2026**, the active port now targets **blep.art**, a compatible Danbooru-based imageboard.

The script is now called **reBlep**, matching the renamed `BlackShuck89/reblep` repository. Earlier releases appeared as **reBlep Personal** and **re6AI Personal — blep.art**; those releases remain available in the same repository history.

The repository has been **detached from GitHub's fork network** and is maintained as an independent project. This changes repository ownership and maintenance, **not** the project's origins, copyrights, or license. It is **not** an official re621, re6AI, e6AI or blep.art release.

## Current status

**Current renamed beta: v1.2.0-beta.8.** This release builds on the blep.art migration and fixes search-result loading, renamed downloads from the native three-dot menu, and favorite-to-upvote behavior. The maintainer verified those fixes in Firefox/Tampermonkey; automated regression tests also pass. This is still beta software.

- **[`master`](https://github.com/BlackShuck89/reblep/tree/master)** is the default branch for reviewed builds and releases.
- **[Releases](https://github.com/BlackShuck89/reblep/releases)** contain the installable userscript and archived builds.
- **[Pull requests](https://github.com/BlackShuck89/reblep/pulls)** are used for new fixes and upstream feature modernization.

The project retains its **re621/re6AI 1.x-derived architecture**. Improvements from [re621 2.x](https://github.com/re621/re621-alpha) are ported selectively; full feature parity is not claimed.

## Features and goals

The inherited code includes modules for subscriptions and notifications, custom and bulk downloads, post viewing, search and thumbnail enhancements, tag utilities, keyboard shortcuts, and appearance settings. Individual features may need adjustment for blep.art.

The goals of this independent continuation are to:

- Keep the existing features compatible with blep.art without relying on retired e6AI hosts.
- Preserve archived e6AI versions and avoid mixing old-site account IDs or settings.
- Keep the script's identity, release URLs, issue tracking, and maintenance independent of upstream.
- Integrate useful newer re621 features **selectively**, without discarding established functionality.
- Improve testing and browser compatibility while retaining user settings where practical.

## Installation

Install [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/) and open the **[latest reBlep prerelease](https://github.com/BlackShuck89/reblep/releases/tag/v1.2.0-beta.8)**. Use the `script.user.js` asset and confirm the installed script targets `https://blep.art/*`.

**Changing the displayed userscript name to reBlep may create a new installation identity.** The blep.art script's `@namespace` (`https://github.com/BlackShuck89/re6ai-personal/blep.art`, a stable identifier rather than an active download URL) and saved setting keys are intentionally unchanged, but a userscript manager may treat the renamed userscript as a new installation. Back up your existing settings and subscriptions first, and **disable the older blep.art script if both names appear** to avoid duplicate page modifications. Do not assume the manager automatically transfers settings.

Older e6AI releases remain archived. Do not install them expecting blep.art support. For historical e6AI favorites, use [blep.art's official importer](https://blep.art/maintenance/user/e6ai_favorite_import). Existing beta releases have pinned update URLs, so installing this beta manually may be necessary.

## Build the userscript

Install [Bun](https://bun.sh/), then:

```sh
git clone https://github.com/BlackShuck89/reblep.git
cd reblep
git checkout master
bun install --frozen-lockfile
bun run compile-typescript:prod
bun run compile-sass:prod
bun run compose-userscript:prod
```

The intended userscript output is `build/userscript/script.user.js`. GitHub Actions checks compile the project and execute blep.art compatibility fixtures; browser testing still matters. The inherited browser-extension build is not a supported release target at this stage.

## Original projects and attribution

This is a **derivative work**, not a clean-room rewrite. Credit for the inherited code and design belongs to its original authors and contributors:

| Project or contributor | Contribution |
| --- | --- |
| **[bitWolfy](https://github.com/bitWolfy)** | Original author of **re621 — e621 Reimagined**, the project from which this codebase ultimately derives. |
| **[re621 Legacy](https://github.com/re621/re621.Legacy)** | Original 1.x-era enhancement codebase for e621.net. |
| **[re6AI](https://github.com/re621/re6ai)** | Existing adaptation of re621 for e6ai.net, used as the **direct source** of this repository's initial code. |
| **Sindrake** | Credited contributor to the re6AI project and its e6AI adaptation. |
| **Earlopain** | Credited contributor to the original re621 and re6AI projects. |
| **[BlackShuck89](https://github.com/BlackShuck89)** | Maintainer of this independent reBlep continuation and subsequent changes. |

Original authorship and attribution remain in the package metadata and version history where available. Future external contributions and copied/adapted code should retain their applicable notices and be credited appropriately.

**License:** The inherited project is distributed under the **GNU General Public License version 3 (GPLv3)**. This derivative remains under GPLv3; see [LICENSE](LICENSE). Detaching from GitHub's fork network does not transfer exclusive ownership of upstream code or remove its license requirements.

The names re621, re6AI, and e6AI identify their respective upstream projects and site; this repository is independent and does not imply endorsement by their creators or operators.

## Issues and contributions

Please report bugs and suggestions in [reBlep Personal Issues](https://github.com/BlackShuck89/reblep/issues) rather than upstream's issue tracker. Changes from the original projects are reviewed and incorporated manually; the repository does not automatically synchronize with upstream.

For background, releases, and additional acknowledgements, consult the [original re6AI repository](https://github.com/re621/re6ai), [re621 Legacy](https://github.com/re621/re621.Legacy), and [re621 2.x](https://github.com/re621/re621-alpha).
