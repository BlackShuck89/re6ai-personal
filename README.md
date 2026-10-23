# re6AI Personal

**An independently maintained enhancement userscript for [e6AI](https://e6ai.net/), built on the work of re6AI and re621.**

re6AI Personal is a personal continuation of [re6AI](https://github.com/re621/re6ai), the e6AI adaptation of bitWolfy's [re621](https://github.com/re621/re621.Legacy) userscript. It aims to maintain and improve the browsing experience on e6ai.net, fix site-specific regressions, and gradually incorporate suitable improvements from newer re621 development.

The repository has been **detached from GitHub's fork network** and is maintained as an independent project. This changes repository ownership and maintenance, **not** the project's origins, copyrights, or license. It is **not** an official re621, re6AI, or e6AI release.

## Current status

**Work in progress.** This is not yet a verified, production-ready replacement for upstream re6AI.

- **[`master`](https://github.com/BlackShuck89/re6ai-personal/tree/master)** is the default branch for reviewed beta/release code.
- **[`development`](https://github.com/BlackShuck89/re6ai-personal/tree/development)** is used for upcoming fixes, integration, and automated build checks.
- Changes are reviewed through [pull requests](https://github.com/BlackShuck89/re6ai-personal/pulls) before being brought into `master`.
- A basic user smoke test and GitHub Actions build checks have passed, but complete browser regression testing and a **stable** release are still pending.

This project currently builds on the **re621/re6AI 1.x-era architecture**, not the rewritten re621 2.x codebase. [re621 2.x](https://github.com/re621/re621-alpha) is a reference for potential future enhancements; feature parity has **not** been achieved.

## Features and goals

The inherited code includes modules for subscriptions and notifications, custom and bulk downloads, post viewing, search and thumbnail enhancements, tag utilities, keyboard shortcuts, and appearance settings. Individual features may need fixes as e6AI evolves.

The goals of this independent continuation are to:

- Repair and maintain compatibility with changes to e6ai.net.
- Resolve reported re6AI bugs, including tag subscriptions and download controls.
- Keep the script's name, update URLs, issue tracking, and releases independent of upstream.
- Import useful newer re621 features **selectively**, without discarding e6AI-specific functionality.
- Improve testing and browser compatibility while retaining user settings where practical.

## Installation

The project is intended for a userscript manager such as [Violentmonkey](https://violentmonkey.github.io/) or [Tampermonkey](https://www.tampermonkey.net/).

**Current channel: beta (1.1.0 Beta 1).** Find the beta's installable `script.user.js` and release notes on [our releases page](https://github.com/BlackShuck89/re6ai-personal/releases). The prerelease is not considered stable; if the beta release has not appeared yet, use a development build instead. Do not mistake downloads from the *original* re6AI project for this independent version.

The beta's userscript update/download URLs point to its exact release tag because GitHub's `/releases/latest` excludes prereleases. Installing a later beta may require a manual update. Disable any other installed re6AI script while testing this one; running both simultaneously can cause duplicate controls or conflicting behavior. Back up your existing userscript settings before switching builds.

## Build the userscript

Install [Bun](https://bun.sh/), then:

```sh
git clone https://github.com/BlackShuck89/re6ai-personal.git
cd re6ai-personal
git checkout development
bun install --frozen-lockfile
bun run compile-typescript:prod
bun run compile-sass:prod
bun run compose-userscript:prod
```

The intended userscript output is `build/userscript/script.user.js`. GitHub Actions builds have passed, but not all functionality has been regression-tested. The inherited browser-extension build is not a supported release target at this stage.

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
