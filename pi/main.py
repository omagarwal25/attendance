import os
import time
from dataclasses import dataclass
from enum import Enum

import requests
import RPi.GPIO as GPIO
from dotenv import main
from mfrc522 import MFRC522


def map(x: int, in_min: int, in_max: int, out_min: int, out_max: int) -> int:
    return (x - in_min) * (out_max - out_min) // (in_max - in_min) + out_min


@dataclass
class Color:
    r: int
    g: int
    b: int


class Colors(Enum):
    RED = Color(255, 0, 0)
    GREEN = Color(0, 255, 0)
    BLUE = Color(0, 0, 255)
    YELLOW = Color(255, 255, 0)
    CYAN = Color(0, 255, 255)
    MAGENTA = Color(255, 0, 255)
    WHITE = Color(255, 255, 255)
    BLACK = Color(0, 0, 0)


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

    def setColor(self, color: Color) -> None:
        self.rPin.ChangeDutyCycle(map(color.r, 0, 255, 0, 100))
        self.gPin.ChangeDutyCycle(map(color.g, 0, 255, 0, 100))
        self.bPin.ChangeDutyCycle(map(color.b, 0, 255, 0, 100))

    def turnOff(self) -> None:
        self.setColor(Colors.BLACK.value)


GPIO.setmode(GPIO.BCM)

main.load_dotenv()

API_URL = os.environ.get("API_URL")
API_TOKEN = os.environ.get("API_TOKEN")

# Create an object of the class MFRC522
MIFAREReader = MFRC522()

# Welcome message
print("Looking for cards")
print("Press Ctrl-C to stop.")
print(API_URL)
print(API_TOKEN)
pid = os.getpid()
print(pid)

RGBLight = RGB(26, 21, 20)

# flash to show ready
RGBLight.setColor(Colors.WHITE.value)
time.sleep(1)
RGBLight.turnOff()
time.sleep(1)
RGBLight.setColor(Colors.WHITE.value)
time.sleep(1)
RGBLight.turnOff()

# This loop checks for chips. If one is near it will get the UID

while True:
    # ping 1.1.1.1 to check internet connection
    response = os.system("ping -c 1 1.1.1.1")

    # and then check the response...
    if response == 0:
        print("Internet Connected")
        break
    else:
        print("No Internet")
        time.sleep(1)

# flash to show ready
RGBLight.setColor(Colors.GREEN.value)
time.sleep(1)
RGBLight.turnOff()
time.sleep(1)
RGBLight.setColor(Colors.GREEN.value)
time.sleep(1)
RGBLight.turnOff()

print("ready to go")

try:
    while True:
        # Scan for cards
        (status, TagType) = MIFAREReader.Request(MIFAREReader.PICC_REQIDL)

        # Get the UID of the card
        (status, uid) = MIFAREReader.Anticoll()

        # If we have the UID, continue
        if status == MIFAREReader.MI_OK:
            # Print UID
            # for each element in uid except the last, convert to hex and add to uid_string
            uid_string = ""
            for element in uid[:-1]:
                uid_string += format(element, "02x")
                # uid_string += " "

            print(f"UID: {uid_string}")

            # Yellow Light
            RGBLight.setColor(Colors.YELLOW.value)

            res = requests.post(
                f"{API_URL}/rest/tap",
                json={"rfid": uid_string},
                headers={"Authorization": f"Bearer {API_TOKEN}"},
            )

            if res.status_code == 404:
                # flash white for two seconds
                RGBLight.setColor(Colors.WHITE.value)
                time.sleep(2)
                RGBLight.turnOff()
                time.sleep(0.5)

                seq_res = requests.post(
                    f"{API_URL}/rest/colorRegister",
                    json={"rfid": uid_string},
                    headers={"Authorization": f"Bearer {API_TOKEN}"},
                )

                if seq_res.status_code != 200:
                    # Red Flash
                    RGBLight.setColor(Colors.RED.value)
                    print(f"Error: {res.status_code}")

                print(seq_res.json(), "RESULT")

                seq = seq_res.json().get("data")

                for color in seq.split(","):
                    RGBLight.setColor(Colors[color.upper()].value)
                    time.sleep(1)
                    RGBLight.turnOff()
                    time.sleep(0.5)

            elif res.status_code != 200:
                # Red Flash
                RGBLight.setColor(Colors.RED.value)
                print(f"Error: {res.status_code}")
            else:
                is_tap_in: bool = res.json().get("start")
                if is_tap_in:
                    RGBLight.setColor(Colors.GREEN.value)
                else:
                    RGBLight.setColor(Colors.BLUE.value)

            time.sleep(0.2)
            RGBLight.turnOff()
            time.sleep(0.5)


except KeyboardInterrupt:
    GPIO.cleanup()
