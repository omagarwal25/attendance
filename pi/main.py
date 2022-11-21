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
        self.rPin = rPin
        self.gPin = gPin
        self.bPin = bPin

        GPIO.setmode(GPIO.BCM)
        # GPIO.setwarnings(False)
        GPIO.PWM(self.rPin, 2000)
        GPIO.PWM(self.gPin, 2000)
        GPIO.PWM(self.bPin, 2000)

    def setColor(self, r: int, g: int, b: int) -> None:
        GPIO.ChangeActiveDutyCycle(self.rPin, 100-map(r, 0, 255, 0, 100))
        GPIO.ChangeActiveDutyCycle(self.gPin, 100-map(g, 0, 255, 0, 100))
        GPIO.ChangeActiveDutyCycle(self.bPin, 100-map(b, 0, 255, 0, 100))

    def turnOff(self) -> None:
        GPIO.output(self.rPin, 0)
        GPIO.output(self.gPin, 0)
        GPIO.output(self.bPin, 0)


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

RGBLight = RGB(26, 21, 20)

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
            RGBLight.setColor(255, 163, 0)

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
