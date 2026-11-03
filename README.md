# SuperBitV2

Extension for Yahboom SuperBitV2, with Hebrew labels for Israeli classrooms.
English remains the default fallback. Existing TypeScript APIs, Python names,
and saved block identifiers are preserved.

## Install this fork in MakeCode

1. Open [MakeCode for micro:bit](https://makecode.microbit.org/) and create a project.
2. Open **Extensions** and paste `https://github.com/pichirichi/SuperBitLibV2`.
3. Select the SuperBitV2 extension. Do not also install another SuperBit extension
   in the same project: the namespaces and block identifiers would overlap.
4. Select **Settings → Language → עברית** for Hebrew. The editor reloads.

To install this exact release, use
`https://github.com/pichirichi/SuperBitLibV2#v1.0.1`.
The plain repository URL selects the latest published version.

The fork uses `master` as its default branch. MakeCode pins the installed
extension to a specific commit or release; existing projects do not automatically
follow branch changes. New features must be published through `develop` and
`master` before normal installation includes them. Reload the editor after an
extension update to refresh its blocks and translations.

The separate **NeoPixel** category is supplied by a dependency. SuperBitV2 also
provides its Hebrew block labels, color/RGB-mode dropdowns, and help text.
See [NeoPixel localization and validation](docs/neopixel-localization.md).

## עברית

בעורך MakeCode בחרו בהגדרות, אחר כך בשפה **עברית**. שמות הבלוקים,
האפשרויות בתפריטים ותיאורי העזרה יוצגו בעברית. שמות הפינים והיציאות,
כמו S1 ו־P12, נשארים כפי שהם מודפסים על הלוח.

הקוד ב־JavaScript וב־Python משתמש בשמות המקוריים באנגלית. שינוי השפה
אינו משנה את התוכנית. כדי לראות הסבר, השאירו את העכבר על הבלוק.

## Servo controls

Use **Servo 180° | Port S1 | Angle 90°** for a positional servo, and the
direction/speed and Stop blocks for continuous-rotation servos. All eight ports
are supported. Calibrate safe endpoints and neutral for your actual motors.
See [mapping and calibration](docs/servos.md), [TypeScript example](examples/servos.ts),
and [Python example](examples/servos.py). Existing Servo APIs retain their behavior.

## Localization and validation

See [the localization guide](docs/localization.md) for the resource format,
repeatable checks, and the editor smoke test. See also the
[servo validation record and hardware checklist](docs/validation-servos.md).

With Node.js 24 or newer:

```sh
npm install
npm run pxt:setup
npx pxt install
npm test
npm run build:sim
```

These checks compile locally for the simulator and check the real PXT
localization loader. They do not test physical hardware or produce firmware.
A firmware build needs the native micro:bit toolchain (`npx pxt build --local`),
or explicit permission to submit source to MakeCode's cloud compiler
(`npx pxt build --cloud`).

## License

MIT

## Supported targets

* for PXT/microbit

(The metadata above is needed for package search.)
