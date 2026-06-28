from atproto import Client
from datetime import datetime
import json


def conectar(usuario, app_password):
    client = Client()
    client.login(usuario, app_password)
    print("Login exitoso")
    return client


def buscar_categoria(client, categoria, termino, limite=10):
    print(f"Buscando: {categoria} ({termino})...")

    response = client.app.bsky.feed.search_posts(
        params={"q": termino, "limit": limite}
    )

    resultados = []

    for post in response.posts:
        handle = post.author.handle
        post_id = post.uri.split("/")[-1]
        url_post = f"https://bsky.app/profile/{handle}/post/{post_id}"

        resultados.append({
            "fecha_extraccion": datetime.now().strftime("%Y-%m-%d"),
            "fecha_publicacion": post.record.created_at,
            "tipo_estafa": categoria,
            "fuente": "Bluesky",
            "usuario": handle,
            "texto": post.record.text,
            "url": url_post
        })

    return resultados


if __name__ == "__main__":
    client = conectar("juan4-04.bsky.social", "ry7q-2ym3-pbz6-yehy")

    categorias = {
    "Giveaway Crypto": [
        "send 1 BTC get 2 BTC",
        "double your bitcoin",
        "free usdt giveaway",
        "crypto giveaway claim"
    ],
    "Inversión Fraudulenta": [
        "guaranteed returns crypto",
        "DM me for investment",
        "passive income 100% profit",
        "daily profit trading signal"
    ],
    "Airdrop Falso": [
        "claim your airdrop",
        "verify wallet airdrop",
        "connect wallet claim tokens",
        "exclusive token presale airdrop"
    ],
    "Pump & Dump": [
        "next 100x coin",
        "buy now before listing",
        "presale live crypto",
        "moon token launch"
    ]
    }
    todos_los_datos = []

    for categoria, terminos in categorias.items():
        for termino in terminos:
            resultados = buscar_categoria(client, categoria, termino, limite=100)
            todos_los_datos.extend(resultados)

    print(f"\nTotal de posts extraídos: {len(todos_los_datos)}")

    # Guardar en JSON
    with open("datos_bluesky.json", "w", encoding="utf-8") as f:
        json.dump(todos_los_datos, f, ensure_ascii=False, indent=4)

    print("Guardado en datos_bluesky.json")