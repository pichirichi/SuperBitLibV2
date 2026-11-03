# Localization validation — 2026-11-03

Tools: Node.js; PXT CLI 0.5.1; micro:bit target 9.1.2; pxt-core 13.2.17.

- PASS — `npm test`: local PXT compile, all 148 extracted localization keys
  present, parameter tokens and segment counts preserved, real PXT Hebrew
  localization loading, English and unavailable-locale fallback.
- PASS — TypeScript example → native Blocks (no grey code blocks), Python
  decompile → TypeScript conversion → local PXT recompile.
- PASS — `npm run build:sim`: simulator JavaScript emitted locally.
- PASS — original and localized `main.ts` emit identical JavaScript when
  comments are removed. The additions to source are documentation/annotations.
- PASS — offline browser render of all 24 extension blocks with PXT language
  `he` and an RTL workspace. Screenshot and block text are generated under
  `built/validation/` by `npm run test:render`.
- NOT COMPLETED — native firmware: `pxt build --local` fails with
  `spawn docker ENOENT` in this environment. Cloud compilation was not run;
  approval review rejected source upload to the external compiler.
- NOT COMPLETED — full hosted-editor install/language-switch smoke test from
  `docs/localization.md`. The offline render checks PXT's actual block renderer
  and localization loader, rather than the entire hosted-editor workflow.

No board was connected. Localization makes no hardware-control changes.
