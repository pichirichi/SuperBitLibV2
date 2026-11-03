# Positional and continuous-rotation Servos

Use `Servo180` for a positional motor and `Servo360` / `Servo360Stop` for a
continuous-rotation motor. All new blocks accept ports S1–S8. The original
`Servo`, `Servo2`, `Servo3`, `Servo4`, enum values, and block IDs remain unchanged.
Calibration affects only the new APIs, independently for each port and servo type.

## What the existing implementation sends

The PCA9685 has 4096 PWM steps per frame. `initPCA9685` requests 50 Hz;
`setFreq` computes `25000000 / 4096 / 50 - 1 = 121.0703125` and stores it in
an 8-bit buffer, truncating it to prescale 121. At the nominal 25 MHz clock:

- One tick = `(121 + 1) / 25 = 4.88 µs`.
- One frame = `4096 × 4.88 = 19988.48 µs`, approximately 50.0288 Hz.
- Legacy APIs instead assume exactly 20000 µs and truncate PWM counts in
  `setPwm`'s bitwise byte packing.

The nominal frame error is approximately 0.058%, far too small to explain a
roughly twofold angle difference. Actual oscillator frequency must be measured
on hardware; neither the software nor these tests can establish it.

| Call / input | Legacy requested pulse | Written count | Nominal actual pulse |
| --- | ---: | ---: | ---: |
| `Servo(180)` | 2400 µs | 491 | 2396.08 µs |
| `Servo(244)` | 3040 µs | 622 | 3035.36 µs |
| `Servo2(360)` | 3000 µs | 614 | 2996.32 µs |
| `Servo3(stop)` | 1460 µs | 299 | 1459.12 µs |
| `Servo4(stop)` | 1700 µs | 348 | 1698.24 µs |
| `Servo(115)` | 1750 µs | 358 | 1747.04 µs |

`Servo` uses `600 + 10 × value` µs. `Servo2`, intended for a 270° servo, first
maps 0–270 to 0–180 and therefore uses `600 + (20/3) × value` µs. Its 90-unit
step is only a 600 µs pulse change. Your observed 180° endpoints for `Servo(244)`
and `Servo2(360)` correspond to similar pulses around 3000 µs. This is evidence
that the tested servo's travel differs from the library's assumed endpoints,
not a universal conversion factor. Supply voltage, load, servo variation,
oscillator timing, and the measurement method still require hardware checking.

`Servo3` uses 1500 µs for zero forward/reverse speed, but a different 1460 µs
Stop pulse. Neither matches the observed neutral around 1700–1750 µs.
`Servo4` consistently centres its directions and Stop on 1700 µs, with full
forward/reverse pulses of 800/2600 µs at its 90-unit speed limit. This explains
why it is the useful reference for the tested continuous-rotation servo.

Reference: [NXP PCA9685 datasheet, PWM frequency and PRE_SCALE](https://www.nxp.com/docs/en/data-sheet/PCA9685.pdf).

## New mappings

`Servo180(port, angle)` clamps the angle to 0–180, then linearly maps it between
that port's calibrated pulse endpoints. The default 1000–2000 µs interval is a
conservative starting range. **It is not a claim of a physical 180° sweep on an
uncalibrated servo.** The logical angle represents physical travel only after
measuring and calibrating the actual endpoints. A servo that cannot safely
travel a full 180° must be used with its measured, narrower travel; do not force
it to reach the label's endpoint.

`Servo360(port, direction, speed)` clamps speed to 0–100 percent and interpolates
from calibrated neutral toward the selected full-speed pulse. Defaults are
800 µs forward, 1700 µs neutral, and 2600 µs reverse, following `Servo4`.
Both speed zero and `Servo360Stop(port)` send precisely the same neutral pulse.
An invalid direction also sends neutral. Forward means the shorter-pulse side;
actual wheel direction depends on the servo and how it is mounted. Percentage
is the command strength, not measured RPM, and low percentages may be inside
the motor's deadband.

The shared new pulse writer rounds to the nearest 4.88 µs tick. Quantization is
at most 2.44 µs at the nominal oscillator frequency. The common PCA9685 frequency,
DC motors, and every legacy control calculation are unchanged. No pulse-wide
or mechanical calibration is applied to the other seven ports.

Invalid ports (including fractional numbers) are ignored. NaN angles use 90°;
NaN speeds stop. Positive/negative infinity clamp to the corresponding range
endpoint. Calibration requires finite pulses within 500–3100 µs, ordered as
`min < max` or `forward < neutral < reverse`. Invalid calibration is ignored
atomically, retaining the previous values. This electrical envelope is a
software guard, **not a guarantee that every allowed pulse is safe mechanically**.

## Calibrate a positional Servo

Calibration is an advanced teacher/setup operation. Disconnect the mechanical
linkage and use the kit's recommended servo power supply and a common ground.
A servo can still hit an internal stop without a linkage. Stop and reduce travel
if it buzzes, stalls, or presses against a mechanical limit.

1. Start with `CalibrateServo180(S1, 1000, 2000)` and `Servo180(S1, 90)`.
2. Measure the current travel. Approach each end slowly, adjusting its pulse
   by small steps (for example 10–20 µs) and testing the corresponding angle.
3. Back away from any mechanical stop. Do not automatically set 3040 µs because
   another motor reached 180° there; it is only the pulse inferred from the
   supplied observation. The allowed maximum of 3100 µs is not a target.
4. Save the measured safe endpoints in `CalibrateServo180` at program startup.
   That block updates configuration without moving the servo; the next
   `Servo180` call uses it. Verify the physical angles with a protractor.

If the servo does not safely reach 180°, use a smaller measured range rather
than forcing a full sweep. Calibration cannot add mechanical travel or feedback.

## Calibrate continuous-rotation stopping

1. Raise wheels or remove the driven mechanism so unexpected motion cannot
   move the kit. Begin with `CalibrateServo360(S2, 800, 1700, 2600)`.
2. If the shaft creeps, adjust neutral by about 5–10 µs per attempt around the
   current value. The reported 1750 µs is a useful nearby test, not a universal
   default. Configuration immediately sends the new neutral pulse.
3. Find a pulse that stops the shaft. Keep the directional endpoints on either
   side of neutral, and reduce their range if needed for the actual servo.
4. Confirm Stop and zero speed in both directions after running at 25%, 50%,
   and 100%. Recheck under the intended load and supply voltage.

PWM resolution is about 4.88 µs per tick; neutral values within the same tick
produce the same signal. There is no speed sensor or active braking guarantee.
Calibration is held in RAM and resets on restart. Put the calibrated setup
blocks at the start of every program. Recalibrate after changing the motor.

## Examples

[TypeScript](../examples/servos.ts) and [MakeCode Python](../examples/servos.py)
show a positional Servo on S1 and a continuous-rotation Servo on S2.
The new Python functions are `servo180`, `calibrate_servo180`, `servo360`,
`servo360_stop`, and `calibrate_servo360`. They are generated from the same
TypeScript API metadata; there is no separate Python implementation.

## בדיקה וכיול בכיתה

למנוע Servo שמגיע לזווית מסוימת השתמשו בבלוק **Servo 180°**. למנוע שמסתובב
ברציפות השתמשו ב־**Servo 360°** ובבלוק העצירה שלו. מהירות 0 עוצרת גם היא.

לפני שימוש בזוויות הקצה, בקשו מהמורה לכייל את המנוע. ערכי ברירת המחדל אינם
מבטיחים תנועה של 180 מעלות בכל מנוע. אם המנוע רועד, מזמזם או נתקע, הפסיקו
את הניסוי וצמצמו את טווח התנועה. במנוע בסיבוב רציף, אם יש תנועה איטית בזמן
עצירה, צריך לכייל את משך אות העצירה. שמרו את בלוקי הכיול בתחילת התוכנית:
הכיול מתאפס בכל הפעלה מחדש.
