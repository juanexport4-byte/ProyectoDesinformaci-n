import json
from collections import Counter

# Cargar datos de ambas fuentes
with open("datos_bluesky.json", "r", encoding="utf-8") as f:
    posts_bluesky = json.load(f)

with open("datos_hackernews.json", "r", encoding="utf-8") as f:
    posts_hackernews = json.load(f)

# Cargar análisis de Bluesky
with open("analisis_bluesky.json", "r", encoding="utf-8") as f:
    analisis_bluesky = json.load(f)


def contar_por_categoria(posts):
    conteo = Counter(post["tipo_estafa"] for post in posts)
    conteo_ordenado = conteo.most_common()
    etiquetas = [item[0] for item in conteo_ordenado]
    valores = [item[1] for item in conteo_ordenado]
    return etiquetas, valores


etiquetas_bsky, valores_bsky = contar_por_categoria(posts_bluesky)
etiquetas_hn, valores_hn = contar_por_categoria(posts_hackernews)

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

# Preparar resumen del análisis para el dashboard
# Solo guardamos lo necesario para el modal (no los detalles completos)
analisis_resumen = {}
for categoria, data in analisis_bluesky.items():
    analisis_resumen[categoria] = {
        "total_posts": data["total_posts"],
        "total_sospechosos": data["total_sospechosos"],
        "porcentaje_sospechosos": data["porcentaje_sospechosos"],
        "señales_frecuentes": data["señales_frecuentes"]
    }

datos_dashboard = {
    "bluesky": {
        "etiquetas": etiquetas_bsky,
        "valores": valores_bsky,
        "analisis": analisis_resumen
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

print(f"datos.json generado con {len(todos_los_posts)} posts en total")
print(f"Análisis incluido para {len(analisis_resumen)} categorías")