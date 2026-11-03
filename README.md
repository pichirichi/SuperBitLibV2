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

The new servo APIs in this local checkout have not been published. The fork URL
installs what is currently published, so it will not include local-only changes.
Validate this checkout with the local commands below. A maintainer can publish
and tag a release later, then projects can update the extension.

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
