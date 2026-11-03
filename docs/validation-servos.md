# Servo validation — 2026-11-03

Automated checks run locally without a connected SuperBit or servo. The user observed approximately 0°, 90°, and 180° on the tested kit servo with legacy Servo2 values 0, 180, and 360; those observations motivate the 600–3000 µs defaults. These are not universal SG90 specifications or scope measurements.
Tools: PXT CLI 0.5.1, micro:bit target 9.1.2, pxt-core 13.2.17.

## Automated checks

Run the README setup, then `npm test`, `npm run build:sim`, and optionally
`npm run test:render`.

- Local PXT compile, all 173 extracted localization keys, placeholder and
  segment checks, Hebrew loading and English fallback.
- Example → native Blocks (no grey TypeScript blocks), TypeScript → Python →
  TypeScript conversion and local PXT compilation.
- Actual exported code executed with mocked I2C writes: angle and speed
  mapping on all eight ports, limits, fractional values, NaN, infinities,
  invalid ports/directions, PWM quantization, calibration validation,
  independent port/type state, restart defaults, neutral and Stop equivalence,
  and the PCA9685 address/register/channel bytes and prescaler.
- 864 byte-for-byte comparisons against upstream commit
  `2dc96afd11a4510601a9c4f55b94ae4b1a6ec229` for all four legacy Servo APIs.
  Keep full Git history when running this regression check.
- Offline RTL rendering of all 29 extension blocks with PXT language `he`.

The I2C mock verifies requested register bytes, not physical pulses or movement.
A successful simulator build is not a native firmware build.

## Still requires a physical board

- Measure PWM frequency and pulse widths with a scope or logic analyzer on
  S1–S8, including 0°/90°/180°, both 100% directions, and Stop/zero speed.
- Confirm supply voltage, common ground, connector polarity, and oscillator
  frequency. The conversion assumes the PCA9685's nominal 25 MHz oscillator.
- Measure positional travel and calibrate safe endpoints for each supplied
  servo. Confirm no buzzing/stalling and test with the intended linkage/load.
- Calibrate neutral for every continuous-rotation servo. Check stopping after
  forward and reverse commands, all speed settings, and changes in load/power.
- Exercise motors, RGB, sensors, and mixed old/new servo calls on the board.
- Reboot and verify the program reapplies its calibration blocks.

## Other outstanding checks

A native firmware build was attempted locally and failed because Docker is not
installed (`spawn docker ENOENT`). Cloud compilation was not run: automatic
approval review rejected external compiler source upload, and the user then
requested local work only. No source is submitted by the test scripts.

The full hosted-editor installation/language-switch smoke test is documented in
`localization.md`; it remains separate from the passing local PXT renderer and
compiler checks. Current local changes require publication before normal installation includes them.
