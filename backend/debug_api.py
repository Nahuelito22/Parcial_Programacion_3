import requests
import os
from dotenv import load_dotenv
import json

# Cargar tu API Key desde el .env
load_dotenv()
api_key = os.getenv("API_FOOTBALL_KEY")

url = "https://v3.football.api-sports.io/leagues?id=1"
headers = {
    "x-apisports-key": api_key
}

print("Conectando a API-Football...")
response = requests.get(url, headers=headers)

if response.status_code == 200:
    data = response.json()
    # Imprimir el JSON de forma bonita para poder leerlo
    print(json.dumps(data, indent=2))
else:
    print(f"Error {response.status_code}: {response.text}")