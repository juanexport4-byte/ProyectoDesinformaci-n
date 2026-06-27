import json
from collections import Counter

# Cargar ambas fuentes
with open("datos_bluesky.json", "r", encoding="utf-8") as f:
    posts_bluesky = json.load(f)

with open("datos_hackernews.json", "r", encoding="utf-8") as f:
    posts_hackernews = json.load(f)


def contar_por_categoria(posts):
    conteo = Counter(post["tipo_estafa"] for post in posts)
    conteo_ordenado = conteo.most_common()
    etiquetas = [item[0] for item in conteo_ordenado]
    valores = [item[1] for item in conteo_ordenado]
    return etiquetas, valores


# Conteos individuales por plataforma
etiquetas_bsky, valores_bsky = contar_por_categoria(posts_bluesky)
etiquetas_hn, valores_hn = contar_por_categoria(posts_hackernews)

# Tabla combinada (todas las filas, de ambas fuentes)
todos_los_posts = posts_bluesky + posts_hackernews

tabla = [
    {
        "fecha": post["fecha_extraccion"],
        "estafa": post["tipo_estafa"],
        "fuente": post["fuente"],
        "url": post["url"]
    }
    for post in todos_los_posts
]

# Estructura final para el dashboard
datos_dashboard = {
    "bluesky": {
        "etiquetas": etiquetas_bsky,
        "valores": valores_bsky
    },
    "fuente2": {
        "nombre": "Hacker News",
        "etiquetas": etiquetas_hn,
        "valores": valores_hn
    },
    "tabla": tabla
}

with open("datos.json", "w", encoding="utf-8") as f:
    json.dump(datos_dashboard, f, ensure_ascii=False, indent=2)

print("datos.json generado con", len(todos_los_posts), "posts en total")