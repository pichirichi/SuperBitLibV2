# Hebrew localization

PXT loads `_locales/he/SuperBitV2-strings.json` for block labels, categories,
and dropdowns, and `SuperBitV2-jsdoc-strings.json` for tooltips. Both are listed
in `pxt.json`, following the existing Chinese resources. English block labels
and English JSDoc in `main.ts` remain the fallback. No API or block ID is renamed.

The Chinese resources include obsolete keys for APIs that are not present in
this repository; Hebrew retains translations of those keys, and additionally
covers every key extracted from the current source. Explicit labels on the
music and port enums make their existing names available to the PXT localization
loader without changing enum values.

Literal Latin technical terms use Unicode LRI/PDI (U+2066/U+2069) to isolate
left-to-right runs within Hebrew. Parameter tokens such as `%num` and `%value`
are never wrapped or changed. Numbers, separators (`|`), and port labels remain
usable by PXT. Do not apply a right-to-left override to an entire block string.

## Automated local checks

Run the setup in the README, then `npm test` and `npm run build:sim`.
`pxt gendocs --locs` extracts the current source strings. The test checks complete
Hebrew coverage, exact parameter tokens and block segment counts, compiles with
the local PXT compiler, loads Hebrew via PXT's actual localization mechanism,
and checks English and unavailable-language fallback. Generated extraction and
build files are ignored by Git. The validation host cannot upload source or
fetch missing packages; `pxt install` is a separate setup step.

## Editor smoke test

1. Install the branch URL from the README into a new project.
2. Select Hebrew in Settings → Language (or open `?forcelang=he`).
3. Open each of the four SuperBitV2 categories. Check labels, dropdowns, and
   tooltips, especially Servo, RGB, PWM, negative speed, and S1–S8.
4. Place blocks from each category; confirm all parameter sockets remain visible.
5. Change to JavaScript, Python, and back to Blocks. Existing API names remain
   English in code; changing the editor language does not rename them.
6. Select English again and confirm the original English labels reappear.

This UI check needs no SuperBit board. Hardware measurements are a separate
activity; localization does not alter any control calculation.

Reference: [MakeCode extension localization](https://makecode.com/extensions/localization).

`tests/interfaces.js` also compiles an example, decompiles it to native Blocks,
and verifies a TypeScript → Python → TypeScript round trip with the actual PXT
converters. `npm run test:render` runs an optional headless-browser render with
PXT configured to Hebrew and the workspace set to RTL. It blocks all browser
network requests and writes screenshots under `built/validation/` for review.

## NeoPixel dependency

SuperBitV2 also supplies Hebrew keys for its unchanged NeoPixel dependency.
See [NeoPixel coverage and validation](neopixel-localization.md).
`tests/neopixel-localization.js` extracts that dependency’s current keys and
checks that a consuming project receives the translations through SuperBitV2.

## Category names across language switches

MakeCode caches localized API metadata. PXT's `{id:category}` localization
path can save a translated namespace name without retaining its English name,
so switching to English may keep Hebrew categories. The source declares an
explicit English `block` label for each namespace, and Hebrew uses the
namespace's `|block` key instead of a `{id:category}` key. This causes PXT to
retain `_untranslatedBlock` when localizing and restore English in its cache.
Do not reintroduce the Hebrew category-ID aliases: they bypass that mechanism.

`neopixel-localization.ts` adds only an empty namespace declaration with its
English block label; it emits no JavaScript and leaves NeoPixel behavior intact.
`tests/category-switch.js` checks two Hebrew → English cycles using the web
editor's metadata-cache restoration behavior for all five categories. Hosted
language-switch verification is still required after the fix is published.
