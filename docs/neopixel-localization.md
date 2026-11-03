# NeoPixel Hebrew localization

SuperBitV2 loads `github:lzty634158/pxt-neopixel` as its NeoPixel dependency.
That dependency supplies the separate NeoPixel toolbox category but has no
Hebrew locale. SuperBitV2 now provides its missing translations through the
existing `_locales/he/SuperBitV2-strings.json` and
`SuperBitV2-jsdoc-strings.json` files. No third-party source, dependency URL,
TypeScript/Python API, enum value, block ID, or LED calculation is changed.

PXT combines localization keys from the consuming project's dependencies.
Fully qualified keys such as `neopixel.Strip.showColor|block`,
`NeoPixelColors.Red|block`, and `{id:category}Neopixel` can therefore be supplied
by SuperBitV2. This avoids maintaining a fork of the dependency just for text.
This locale applies when SuperBitV2 is installed; it does not translate an
independent NeoPixel installation in a project without SuperBitV2.

The 88 extracted keys cover the category, all 20 standard/advanced blocks,
10 color options, three RGB modes, tooltips, and parameter help. Latin technical
terms use the same LRI/PDI text isolation as the existing SuperBitV2 Hebrew.
Parameter placeholders, shadow IDs such as `neopixel_colors`, and block segment
separators are preserved. Existing variable names such as `strip` and `range`
remain user-defined variable names.

The Hebrew help distinguishes functions that display immediately (`showColor`,
`showRainbow`, `showBarGraph`) from changes requiring `show`. Descriptions of
`showBarGraph` at a nonpositive maximum and the matrix's vertical coordinate
follow the actual dependency implementation rather than copying inaccurate
upstream English descriptions.

## Validation — 2026-11-03

Tools: local micro:bit target 9.1.2, pxt-core 13.2.17, PXT CLI 0.5.1.

- PASS — `npm test`: existing 173 SuperBitV2 locale keys and all existing
  servo/interface checks remain passing, including 864 legacy PWM comparisons.
- PASS — 88 NeoPixel locale keys (35 block/category/dropdown, 53 help/parameter),
  checked against PXT extraction from the installed dependency, with exact
  placeholders, shadow IDs, and segment counts.
- PASS — a virtual consuming project installs SuperBitV2, which installs the
  unchanged NeoPixel dependency; PXT loads all Hebrew keys from SuperBitV2.
  English and unavailable-locale fallback remain intact.
- PASS — NeoPixel TypeScript fixture compiles and decompiles to native Blocks;
  the Python fixture decompiles, converts back, and recompiles locally.
- PASS — simulator build and offline RTL render of 49 blocks, including all
  20 NeoPixel blocks; screenshot at `built/validation/hebrew-blocks.png`.

Existing PXT Python limitation: `strip.length()` decompiles as `len(strip)()`.
That call remains in the TypeScript/Blocks check but is excluded from the
Python round-trip fixture. This translation change does not patch or rename
that existing API. All its block text and help are still checked.

No physical LED/hardware test or native firmware build was performed for this
text-only change. A hosted MakeCode test requires publishing the feature through
the fork's normal Git Flow process, updating the project's pinned extension,
and reloading the editor. This feature is initially kept local for review.
