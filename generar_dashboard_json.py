import json
from collections import Counter

# Cargar los datos ya extraídos
with open("datos_bluesky.json", "r", encoding="utf-8") as f:
    posts_bluesky = json.load(f)

# Contar cuántos posts hay por categoría
conteo = Counter(post["tipo_estafa"] for post in posts_bluesky)

# Ordenar de mayor a menor (para que el gráfico se vea como antes)
conteo_ordenado = conteo.most_common()

etiquetas = [item[0] for item in conteo_ordenado]
valores = [item[1] for item in conteo_ordenado]

# Armar estructura final para el dashboard
datos_dashboard = {
    "bluesky": {
        "etiquetas": etiquetas,
        "valores": valores
    },
    "tabla": [
        {
            "fecha": post["fecha_extraccion"],
            "estafa": post["tipo_estafa"],
            "fuente": post["fuente"],
            "url": post["url"]
        }
        for post in posts_bluesky
    ]
}

# Guardar el JSON final que usará el dashboard
with open("datos.json", "w", encoding="utf-8") as f:
    json.dump(datos_dashboard, f, ensure_ascii=False, indent=2)

print("datos.json generado correctamente")
print("Etiquetas:", etiquetas)
print("Valores:", valores)