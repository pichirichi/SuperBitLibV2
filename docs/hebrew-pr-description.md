Add complete Hebrew localization using PXT locale resources. Includes block labels, dropdown options, four categories, student-friendly tooltips, and direction isolation for Latin technical terms. English remains the fallback; APIs, enum values, and existing block IDs are preserved.

Validation: all 148 extracted keys and placeholders; actual PXT Hebrew loading and English/unavailable-locale fallback; local simulator build; TypeScript → native Blocks; Python round trip and compilation; offline RTL render of all 24 blocks; identical emitted JavaScript before and after source documentation/annotation changes.

Remaining: full hosted-editor install/language-switch smoke test and native firmware build. Local firmware build failed because Docker is absent; cloud upload was rejected by approval review. No hardware-control calculations changed.

This description is saved locally. Draft PR #1 and its branch had already been published before the user requested local work only. No further publishing is authorized.
