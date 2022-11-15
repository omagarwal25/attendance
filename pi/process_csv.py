# read csv.csv

import csv
import requests
from dataclasses import dataclass
from dotenv import load_dotenv
import os


load_dotenv()

API_URL = os.environ.get('API_URL')
API_TOKEN = os.environ.get('API_TOKEN')


@dataclass
class User:
    email: str
    id: str


users = []

with open('csv.csv', 'r') as f:
    reader = csv.reader(f)
    for row in reader:
        print(row)
        users.append(User(row[0], row[4]))


for user in users:
    print(user.id, user.email)
    res = requests.post(f"{API_URL}/rest/register", json={"rfid": user.id,
                        "email": user.email}, headers={"Authorization": f"Bearer {API_TOKEN}"})

    # print out the response
    print(res.json())
    