// Connect a positional Servo to S1 and a continuous-rotation Servo to S2.
// Servo180 defaults to 600–3000 µs, measured on our kit servo; other servos may need calibration.
SuperBitV2.Servo180(SuperBitV2.enServo.S1, 90)
// Optional calibration: change these endpoints for your motor; resets on restart.
SuperBitV2.CalibrateServo180(SuperBitV2.enServo.S1, 600, 3000)
SuperBitV2.CalibrateServo360(SuperBitV2.enServo.S2, 800, 1700, 2600)
SuperBitV2.Servo360(SuperBitV2.enServo.S2, SuperBitV2.ServoDirection.Forward, 50)
basic.pause(1000)
SuperBitV2.Servo360Stop(SuperBitV2.enServo.S2)
basic.pause(500)
SuperBitV2.Servo360(SuperBitV2.enServo.S2, SuperBitV2.ServoDirection.Reverse, 50)
basic.pause(1000)
// Speed zero also stops. This sends exactly the same pulse as Servo360Stop.
SuperBitV2.Servo360(SuperBitV2.enServo.S2, SuperBitV2.ServoDirection.Reverse, 0)
SuperBitV2.Servo360Stop(SuperBitV2.enServo.S2)
