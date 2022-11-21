import os
import time

import requests
import RPi.GPIO as GPIO
from dotenv import load_dotenv
from mfrc522 import MFRC522


def map(x: int, in_min: int, in_max: int, out_min: int, out_max: int) -> int:
    return (x - in_min) * (out_max - out_min) // (in_max - in_min) + out_min


class RGB:
    def __init__(self, rPin: int, gPin: int, bPin: int) -> None:
        GPIO.setmode(GPIO.BCM)

        GPIO.setup(rPin, GPIO.OUT)
        GPIO.setup(gPin, GPIO.OUT)
        GPIO.setup(bPin, GPIO.OUT)

        self.rPin = GPIO.PWM(rPin, 2000)
        self.gPin = GPIO.PWM(gPin, 2000)
        self.bPin = GPIO.PWM(bPin, 2000)

        self.rPin.start(0)
        self.gPin.start(0)
        self.bPin.start(0)

        # GPIO.setwarnings(False)

    def setColor(self, r: int, g: int, b: int) -> None:
        self.rPin.ChangeDutyCycle(100-map(r, 0, 255, 0, 100))
        self.gPin.ChangeDutyCycle(100-map(g, 0, 255, 0, 100))
        self.bPin.ChangeDutyCycle(100-map(b, 0, 255, 0, 100))

    def turnOff(self) -> None:
        self.rPin.ChangeDutyCycle(0)
        self.gPin.ChangeDutyCycle(0)
        self.bPin.ChangeDutyCycle(0)


GPIO.setmode(GPIO.BCM)

load_dotenv()

API_URL = os.environ.get('API_URL')
API_TOKEN = os.environ.get('API_TOKEN')

# Create an object of the class MFRC522
MIFAREReader = MFRC522()

# Welcome message
print("Looking for cards")
print("Press Ctrl-C to stop.")
print(API_URL)
print(API_TOKEN)

RGBLight = RGB(20, 21, 26)

# This loop checks for chips. If one is near it will get the UID
try:
    while True:
        # Scan for cards
        (status, TagType) = MIFAREReader.MFRC522_Request(MIFAREReader.PICC_REQIDL)

        # Get the UID of the card
        (status, uid) = MIFAREReader.MFRC522_Anticoll()

        # If we have the UID, continue
        if status == MIFAREReader.MI_OK:
            # Print UID
            # for each element in uid except the last, convert to hex and add to uid_string
            uid_string = ""
            for element in uid[:-1]:
                uid_string += format(element, '02x')
                # uid_string += " "

            print(f"UID: {uid_string}")

            # Yellow Light
            RGBLight.setColor(255, 127, 0)

            res = requests.post(f"{API_URL}/rest/tap", json={"rfid": uid_string},
                                headers={"Authorization": f"Bearer {API_TOKEN}"})

            if res.status_code != 200:
                # Red Flash
                RGBLight.setColor(255, 0, 0)
                time.sleep(0.2)
                RGBLight.turnOff()
                print(f"Error: {res.status_code}")
            else:
                is_tap_in: bool = res.json().get('start')
                if is_tap_in:
                    RGBLight.setColor(0, 255, 0)
                else:
                    RGBLight.setColor(0, 0, 255)

                time.sleep(0.2)
                RGBLight.turnOff()


except KeyboardInterrupt:
    GPIO.cleanup()
