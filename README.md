# re6AI Personal

**An independently maintained enhancement userscript being adapted for [blep.art](https://blep.art/), based on re6AI and re621.**

re6AI Personal began as a personal continuation of [re6AI](https://github.com/re621/re6ai), the e6AI adaptation of bitWolfy's [re621](https://github.com/re621/re621.Legacy) userscript. With e6AI's closure announced for **November 13, 2026**, the active port now targets **blep.art**, a compatible Danbooru-based imageboard.

The migration is being developed on [`feature/blep-art-port`](https://github.com/BlackShuck89/re6ai-personal/tree/feature/blep-art-port), separate from the previously published e6AI version.

The repository has been **detached from GitHub's fork network** and is maintained as an independent project. This changes repository ownership and maintenance, **not** the project's origins, copyrights, or license. It is **not** an official re621, re6AI, e6AI or blep.art release.

## Current status

**blep.art port in progress.** The new-domain version is undergoing builds and browser verification; it is not yet a published stable release.

- **[`master`](https://github.com/BlackShuck89/re6ai-personal/tree/master)** currently contains the published e6AI-only v1.1.0 Beta 1.
- **[`feature/blep-art-port`](https://github.com/BlackShuck89/re6ai-personal/tree/feature/blep-art-port)** targets blep.art (v1.2.0 Beta 1 in development); it will be merged only after testing.
- Changes are reviewed through [pull requests](https://github.com/BlackShuck89/re6ai-personal/pulls) before being brought into `master`.
- The previous e6AI beta passed a basic smoke test. The blep.art port needs its own compatibility testing; see [migration notes](docs/BLEP_ART_PORT.md).

This project currently builds on the **re621/re6AI 1.x-era architecture**, not the rewritten re621 2.x codebase. [re621 2.x](https://github.com/re621/re621-alpha) is a reference for potential future enhancements; feature parity has **not** been achieved.

## Features and goals

The inherited code includes modules for subscriptions and notifications, custom and bulk downloads, post viewing, search and thumbnail enhancements, tag utilities, keyboard shortcuts, and appearance settings. Individual features may need adjustment for blep.art.

The goals of this independent continuation are to:

- Make the existing features work on blep.art without calling e6AI's retired static-host URLs.
- Preserve the working e6AI beta while validating blep-specific subscriptions, downloads and profiles.
- Keep the script's name, update URLs, issue tracking, and releases independent of upstream.
- Import useful newer re621 features **selectively**, without discarding e6AI-specific functionality.
- Improve testing and browser compatibility while retaining user settings where practical.

## Installation

The project is intended for a userscript manager such as [Violentmonkey](https://violentmonkey.github.io/) or [Tampermonkey](https://www.tampermonkey.net/).

**Current published release:** [v1.1.0 Beta 1](https://github.com/BlackShuck89/re6ai-personal/releases/tag/v1.1.0-beta.1), which targets **e6ai.net only**. Do **not** install it expecting blep.art support.

**blep.art development port:** after the [port pull request](https://github.com/BlackShuck89/re6ai-personal/pulls) passes CI, download its GitHub Actions artifact `script.user.js` for testing. A separately named **re6AI Personal — blep.art** script is built as **v1.2.0-beta.1**. It is not released until browser tests confirm compatibility.

The old e6AI script and new blep.art script use **different `@match`, `@name`, and `@namespace` values** to prevent old subscription IDs from being applied to blep's independent database. They can be installed side by side, although the old one will stop working once e6AI closes. Personal settings and subscriptions are **not automatically migrated**.

To import e6AI favorites into blep, use [blep's official favorites import page](https://blep.art/maintenance/user/e6ai_favorite_import). Release metadata is pinned to explicit beta tags; new beta versions may require manual installation.

## Build the userscript

Install [Bun](https://bun.sh/), then:

```sh
git clone https://github.com/BlackShuck89/re6ai-personal.git
cd re6ai-personal
git checkout feature/blep-art-port
bun install --frozen-lockfile
bun run compile-typescript:prod
bun run compile-sass:prod
bun run compose-userscript:prod
```

The intended userscript output is `build/userscript/script.user.js`. GitHub Actions checks compile the port, but live blep.art testing remains necessary. The inherited browser-extension build is not a supported release target at this stage.

## Original projects and attribution

This is a **derivative work**, not a clean-room rewrite. Credit for the inherited code and design belongs to its original authors and contributors:

| Project or contributor | Contribution |
| --- | --- |
| **[bitWolfy](https://github.com/bitWolfy)** | Original author of **re621 — e621 Reimagined**, the project from which this codebase ultimately derives. |
| **[re621 Legacy](https://github.com/re621/re621.Legacy)** | Original 1.x-era enhancement codebase for e621.net. |
| **[re6AI](https://github.com/re621/re6ai)** | Existing adaptation of re621 for e6ai.net, used as the **direct source** of this repository's initial code. |
| **Sindrake** | Credited contributor to the re6AI project and its e6AI adaptation. |
| **Earlopain** | Credited contributor to the original re621 and re6AI projects. |
| **[BlackShuck89](https://github.com/BlackShuck89)** | Maintainer of this independent re6AI Personal continuation and subsequent changes. |

Original authorship and attribution remain in the package metadata and version history where available. Future external contributions and copied/adapted code should retain their applicable notices and be credited appropriately.

**License:** The inherited project is distributed under the **GNU General Public License version 3 (GPLv3)**. This derivative remains under GPLv3; see [LICENSE](LICENSE). Detaching from GitHub's fork network does not transfer exclusive ownership of upstream code or remove its license requirements.

The names re621, re6AI, and e6AI identify their respective projects and site; this repository is independent and does not imply endorsement by their creators or operators.

## Issues and contributions

Please report bugs and suggestions in [re6AI Personal Issues](https://github.com/BlackShuck89/re6ai-personal/issues) rather than upstream's issue tracker. Changes from the original projects are reviewed and incorporated manually; the repository does not automatically synchronize with upstream.

For background, releases, and additional acknowledgements, consult the [original re6AI repository](https://github.com/re621/re6ai), [re621 Legacy](https://github.com/re621/re621.Legacy), and [re621 2.x](https://github.com/re621/re621-alpha).
