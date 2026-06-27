import requests
from datetime import datetime
import json
import time


def buscar_hackernews(categoria, termino, limite=10):
    print(f"Buscando en Hacker News: {categoria} ('{termino}')...")

    url = "https://hn.algolia.com/api/v1/search"
    params = {
        "query": termino,
        "tags": "story",
        "hitsPerPage": limite
    }

    resultados = []

    try:
        response = requests.get(url, params=params, timeout=10)

        if response.status_code == 200:
            data = response.json()

            for hit in data["hits"]:
                resultados.append({
                    "fecha_extraccion": datetime.now().strftime("%Y-%m-%d"),
                    "fecha_publicacion": hit.get("created_at", ""),
                    "tipo_estafa": categoria,
                    "fuente": "Hacker News",
                    "usuario": hit.get("author", "desconocido"),
                    "texto": hit.get("title", ""),
                    "url": hit.get("url") or f"https://news.ycombinator.com/item?id={hit['objectID']}"
                })
        else:
            print(f"Error {response.status_code} buscando {categoria}")

    except Exception as e:
        print(f"Error: {e}")

    time.sleep(1)  # pausa entre peticiones, buena práctica
    return resultados


if __name__ == "__main__":

    categorias = {
        "Criptomonedas": "crypto scam",
        "Phishing": "phishing attack",
        "Inversiones": "investment scam",
        "Sorteos falsos": "giveaway scam",
        "Suplantación": "impersonation scam"
    }

    todos_los_datos = []

    for categoria, termino in categorias.items():
        resultados = buscar_hackernews(categoria, termino, limite=50)
        todos_los_datos.extend(resultados)

    print(f"\nTotal de posts extraídos: {len(todos_los_datos)}")

    with open("datos_hackernews.json", "w", encoding="utf-8") as f:
        json.dump(todos_los_datos, f, ensure_ascii=False, indent=4)

    print("Guardado en datos_hackernews.json")