# re6AI Personal

An independently maintained fork of [re6AI](https://github.com/re621/re6ai), adapted from the original [re621](https://github.com/re621/re621) project for [e6ai.net](https://e6ai.net).

This is **not an official upstream release**. Original author and contributor credits are retained in `package.json`; the source is licensed under GPLv3 (see [LICENSE](LICENSE)).

## Status

Development is taking place on the [development branch](https://github.com/BlackShuck89/re6ai-personal/tree/development). The fork has not yet been validated end-to-end on a live e6AI session. Do not install the upstream re6AI userscript at the same time.

## Installation

After a release is published, install the userscript using [Tampermonkey](https://tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/):

[Latest fork release](https://github.com/BlackShuck89/re6ai-personal/releases/latest)

The userscript's update and download metadata points to **this fork**, not the original repository. No downloadable release has been published yet.

## Building locally

Install [Bun](https://bun.sh/), then run:

```sh
bun install --frozen-lockfile
bun run compile-typescript:prod
bun run compile-sass:prod
bun run compose-userscript:prod
```

The userscript should be generated at `build/userscript/script.user.js`. The older extension build is preserved for reference but is not a supported release target yet.

## Development priorities

- Resolve tag subscription buttons and download toolbar regressions.
- Update remaining re621 labels to e6AI terminology.
- Compare with re621 2.x and port compatible functionality incrementally.
- Add browser smoke tests and verify e6AI API rate-limit compliance.
- Review settings migration and check for regressions before merging into `master`.

Please report issues in [this fork's issue tracker](https://github.com/BlackShuck89/re6ai-personal/issues). For original project information, see [upstream re6AI](https://github.com/re621/re6ai).
