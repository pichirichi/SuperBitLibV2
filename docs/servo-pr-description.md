Add calibrated positional and continuous-rotation Servo controls for all eight ports.

`Servo180` clamps 0–180° and maps to per-port pulse endpoints (conservative 1000–2000 µs defaults). `Servo360` accepts direction and 0–100% command speed; zero speed and `Servo360Stop` send the same calibrated neutral. Defaults follow the working Servo4 pulses (800/1700/2600 µs). Advanced calibration validates ordered pulses in 500–3100 µs and remains independent per port and servo type. Physical 180° travel requires measured endpoint calibration; no universal SG90 mapping is assumed.

The source investigation documents the legacy 600+10×value and 600+(20/3)×value mappings, the 1460 µs versus 1700 µs stop discrepancy, and the prescale-121 / nominal 4.88 µs tick. New APIs round to the actual nominal tick; legacy APIs, IDs, enum values, frequency, and motor code remain unchanged. Includes Hebrew labels/tooltips and TypeScript/Python examples.

Validation: all 173 localization keys; local PXT simulator compilation; native Blocks decompile; TypeScript/Python round trip; mapping, clamping, invalid inputs, calibration, channel bytes and Stop tests on all eight ports; 864 legacy byte comparisons; offline Hebrew RTL block render.

Remaining: native firmware build (Docker absent; cloud source upload not approved), full hosted-editor workflow, scope measurements, physical travel/stop calibration, and loaded-board regression tests. See docs/servos.md and docs/validation-servos.md.

Prepared locally only at the user's request. Based on the separate localization branch; do not publish or merge automatically.
