import os
import time

import requests
import RPi.GPIO as GPIO
from dotenv import load_dotenv
from mfrc522 import MFRC522

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

# This loop checks for chips. If one is near it will get the UID
try:
  while True:
    # Scan for cards
    (status,TagType) = MIFAREReader.MFRC522_Request(MIFAREReader.PICC_REQIDL)

    # Get the UID of the card
    (status,uid) = MIFAREReader.MFRC522_Anticoll()

    # If we have the UID, continue
    if status == MIFAREReader.MI_OK:
      # Print UID
      print(f"UID: {uid[0]}{uid[1]}{uid[2]}{uid[3]}")

      # hash + salt the uid
      uid_str = f"{uid[0]}{uid[1]}{uid[2]}{uid[3]}"
      
      # grab the user's email
      email = input("Enter your email: ")

      res = requests.post(f"{API_URL}/rest/register", json={ "rfid": uid_str, "email": email }, headers={ "Authorization": f"Bearer {API_TOKEN}" })

      print("Registration successful!")

      time.sleep(1)
      # Reset LEDs

except KeyboardInterrupt:
  GPIO.cleanup()
