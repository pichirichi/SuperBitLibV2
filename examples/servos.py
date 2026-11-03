# Connect a positional Servo to S1 and a continuous-rotation Servo to S2.
# These are starting values, not measured calibration for your kit.
SuperBitV2.calibrate_servo180(SuperBitV2.enServo.S1, 1000, 2000)
SuperBitV2.servo180(SuperBitV2.enServo.S1, 90)
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
