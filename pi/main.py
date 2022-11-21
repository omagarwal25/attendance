import os
import time

import requests
import RPi.GPIO as GPIO
from dotenv import load_dotenv
from mfrc522 import MFRC522

# class RGB:
#     def __init__(self, rPin: int, gPin: int, bPin: int) -> None:
#         self.rPin = rPin
#         self.gPin = gPin
#         self.bPin = bPin

#         GPIO.setmode(GPIO.BCM)
#         # GPIO.setwarnings(False)
#         GPIO.setup(self.rPin, GPIO.OUT)
#         GPIO.setup(self.gPin, GPIO.OUT)
#         GPIO.setup(self.bPin, GPIO.OUT)

#     def setColor(self, r: int, g: int, b: int) -> None:
#         GPIO.output(self.rPin, r)
#         GPIO.output(self.gPin, g)
#         GPIO.output(self.bPin, b)

#     def turnOff(self) -> None:
#         GPIO.output(self.rPin, 0)
#         GPIO.output(self.gPin, 0)
#         GPIO.output(self.bPin, 0)

led = 21
GPIO.setmode(GPIO.BCM)
GPIO.setup(led, GPIO.OUT)

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

# RGBLight = RGB(26, 20, 21)

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

            GPIO.output(led, 1)
            
            res = requests.post(f"{API_URL}/rest/tap", json={"rfid": uid_string},
                                headers={"Authorization": f"Bearer {API_TOKEN}"})

            if res.status_code != 200:
                # RGBLight.setColor(255, 0, 0)
                print(f"Error: {res.status_code}")

                GPIO.output(led, 0)
                time.sleep(0.2)
                GPIO.output(led, 1)
            else:
                is_tap_in: bool = res.json().get('start')
                print(is_tap_in)
                # if is_tap_in:
                # RGBLight.setColor(0, 255, 0)
                # else:
                # RGBLight.setColor(0, 0, 255)

            time.sleep(1)
            # RGBLight.turnOff()

            GPIO.output(led, 0)

except KeyboardInterrupt:
    GPIO.cleanup()
