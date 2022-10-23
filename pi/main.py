import os
import time

import MFRC522
import requests
import RPi.GPIO as GPIO

API_URL = os.environ.get('API_URL')
API_TOKEN = os.environ.get('API_TOKEN')

# Create an object of the class MFRC522
MIFAREReader = MFRC522.MFRC522()

# Welcome message
print("Looking for cards")
print("Press Ctrl-C to stop.")

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
      print(f"UID: {str(uid[0])},{str(uid[1])},{str(uid[2])},{str(uid[3])}")

      # Send off a signal to the server
      # RestAPI to env API_URL/pi/tap POST using requests
      # Body: { uid: [uid[0], uid[1], uid[2], uid[3]] }
      # Auth: Bearer token from env

      # hash + salt the uid
      uid_str = f"{uid[0]}{uid[1]}{uid[2]}{uid[3]}"
      
      res = requests.post(f"{API_URL}/rest/tap", json={ "rfid": uid_str}, headers={ "Authorization": f"Bearer {API_TOKEN}"})


      if res.status_code != 200:
        # color the LEDs 
        print(f"Error: {res.status_code}")
      else:
        is_tap_in: bool = res.json().get('start')
        # whatever LEDs or displays we want to use

      time.sleep(1)
      # Reset LEDs

except KeyboardInterrupt:
  GPIO.cleanup()
