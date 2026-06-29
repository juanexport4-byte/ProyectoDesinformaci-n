import json
from datetime import datetime


def calcular_sospecha(post):
    """
    Asigna un puntaje de sospecha del 0 al 4 basado en señales del perfil.
    Mientras más alto, más sospechoso.
    """
    puntaje = 0
    señales = []

    # Señal 1: pocos seguidores
    if post["seguidores"] < 50:
        puntaje += 1
        señales.append("Pocos seguidores")

    # Señal 2: ratio seguidos/seguidores alto (sigue a muchos, pocos lo siguen)
    if post["seguidores"] > 0:
        ratio = post["seguidos"] / post["seguidores"]
        if ratio > 5:
            puntaje += 1
            señales.append("Ratio seguidos/seguidores alto")
    elif post["seguidos"] > 100:
        puntaje += 1
        señales.append("Ratio seguidos/seguidores alto")

    # Señal 3: cuenta nueva (menos de 6 meses)
    if post["fecha_creacion"]:
        try:
            fecha = datetime.fromisoformat(post["fecha_creacion"].replace("Z", "+00:00"))
            dias = (datetime.now(fecha.tzinfo) - fecha).days
            if dias < 180:
                puntaje += 1
                señales.append("Cuenta reciente")
        except:
            pass

    # Señal 4: descripcion vacia
    if not post["descripcion"] or post["descripcion"].strip() == "":
        puntaje += 1
        señales.append("Sin descripción de perfil")

    return puntaje, señales


def analizar_por_categoria(datos):
    # Agrupar por categoría
    por_categoria = {}
    for post in datos:
        cat = post["tipo_estafa"]
        if cat not in por_categoria:
            por_categoria[cat] = []
        por_categoria[cat].append(post)

    resumen = {}

    for categoria, posts in por_categoria.items():
        total = len(posts)
        sospechosos = 0
        todas_señales = []
        detalles = []

        for post in posts:
            puntaje, señales = calcular_sospecha(post)
            if puntaje >= 2:  # consideramos sospechoso si tiene 2 o más señales
                sospechosos += 1
            todas_señales.extend(señales)
            detalles.append({
                "usuario": post["usuario"],
                "puntaje": puntaje,
                "señales": señales,
                "seguidores": post["seguidores"],
                "seguidos": post["seguidos"],
                "cantidad_posts": post["cantidad_posts"],
                "fecha_creacion": post["fecha_creacion"],
                "url": post["url"]
            })

        # Contar frecuencia de cada señal
        conteo_señales = {}
        for s in todas_señales:
            conteo_señales[s] = conteo_señales.get(s, 0) + 1

        resumen[categoria] = {
            "total_posts": total,
            "total_sospechosos": sospechosos,
            "porcentaje_sospechosos": round((sospechosos / total) * 100, 1),
            "señales_frecuentes": conteo_señales,
            "detalles": detalles
        }

        print(f"\n{categoria}:")
        print(f"  Posts analizados: {total}")
        print(f"  Sospechosos (2+ señales): {sospechosos} ({round((sospechosos/total)*100,1)}%)")
        print(f"  Señales más frecuentes: {conteo_señales}")

    return resumen


if __name__ == "__main__":
    with open("datos_cuenta_bluesky.json", "r", encoding="utf-8") as f:
        datos = json.load(f)

    print(f"Posts cargados: {len(datos)}")
    resumen = analizar_por_categoria(datos)

    with open("analisis_bluesky.json", "w", encoding="utf-8") as f:
        json.dump(resumen, f, ensure_ascii=False, indent=2)

    print("\nGuardado en analisis_bluesky.json")