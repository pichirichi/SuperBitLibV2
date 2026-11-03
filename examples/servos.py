# Connect a positional Servo to S1 and a continuous-rotation Servo to S2.
# Servo180 defaults to 600–3000 µs, measured on our kit servo; other servos may need calibration.
SuperBitV2.servo180(SuperBitV2.enServo.S1, 90)
# Optional calibration: change these endpoints for your motor; resets on restart.
SuperBitV2.calibrate_servo180(SuperBitV2.enServo.S1, 600, 3000)
SuperBitV2.calibrate_servo360(SuperBitV2.enServo.S2, 800, 1700, 2600)
SuperBitV2.servo360(SuperBitV2.enServo.S2, SuperBitV2.ServoDirection.FORWARD, 50)
basic.pause(1000)
SuperBitV2.servo360_stop(SuperBitV2.enServo.S2)
basic.pause(500)
SuperBitV2.servo360(SuperBitV2.enServo.S2, SuperBitV2.ServoDirection.REVERSE, 50)
basic.pause(1000)
# Speed zero also stops. This sends exactly the same pulse as Servo360Stop.
SuperBitV2.servo360(SuperBitV2.enServo.S2, SuperBitV2.ServoDirection.REVERSE, 0)
SuperBitV2.servo360_stop(SuperBitV2.enServo.S2)
