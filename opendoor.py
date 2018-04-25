from time import sleep
import RPi.GPIO as GPIO

DIR = 20   # Direction GPIO Pin
STEP = 21  # Step GPIO Pin

CCW = 1   # CounterClockwise Rotation
SPR = 400   # Steps per Revolution (360 / 7.5)
#//1000 full rot?? play with

GPIO.setmode(GPIO.BCM)
GPIO.setup(DIR, GPIO.OUT)
GPIO.setup(STEP, GPIO.OUT)
GPIO.output(DIR, CCW)

step_count = SPR
delay = 0.005 #keep above 001 #smaller turns faster
for x in range(step_count):
    GPIO.output(STEP, GPIO.HIGH)
    sleep(delay)
    GPIO.output(STEP, GPIO.LOW)
    sleep(delay)

GPIO.cleanup()
