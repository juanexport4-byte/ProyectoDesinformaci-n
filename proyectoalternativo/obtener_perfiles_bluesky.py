import json
import time
from atproto import Client


def obtener_perfiles(usuario, app_password):

    # Cargar datos ya extraídos
    with open("datos_bluesky.json", "r", encoding="utf-8") as f:
        datos = json.load(f)

    # Obtener usuarios únicos
    usuarios_unicos = list(set(post["usuario"] for post in datos))
    print(f"Usuarios únicos a consultar: {len(usuarios_unicos)}")

    # Conectar
    client = Client()
    client.login(usuario, app_password)
    print("Login exitoso")

    # Obtener perfil de cada usuario
    perfiles = {}
    for i, handle in enumerate(usuarios_unicos):
        try:
            perfil = client.app.bsky.actor.get_profile(params={"actor": handle})
            perfiles[handle] = {
                "seguidores": perfil.followers_count or 0,
                "seguidos": perfil.follows_count or 0,
                "cantidad_posts": perfil.posts_count or 0,
                "descripcion": perfil.description or "",
                "fecha_creacion": perfil.created_at or "",
                "verificado": perfil.labels is not None and len(perfil.labels) > 0
            }
            if (i + 1) % 50 == 0:
                print(f"Progreso: {i + 1}/{len(usuarios_unicos)}")

        except Exception as e:
            print(f"Error con {handle}: {e}")
            perfiles[handle] = {
                "seguidores": 0,
                "seguidos": 0,
                "cantidad_posts": 0,
                "descripcion": "",
                "fecha_creacion": "",
                "verificado": False
            }

        time.sleep(0.3)

    # Combinar perfiles con los posts originales
    for post in datos:
        handle = post["usuario"]
        if handle in perfiles:
            post.update(perfiles[handle])

    # Guardar en archivo nuevo sin tocar el original
    with open("datos_cuenta_bluesky.json", "w", encoding="utf-8") as f:
        json.dump(datos, f, ensure_ascii=False, indent=4)

    print(f"\nListo. {len(datos)} posts enriquecidos con datos de perfil.")
    print("Guardado en datos_cuenta_bluesky.json")


if __name__ == "__main__":
    obtener_perfiles("juan4-04.bsky.social", "ry7q-2ym3-pbz6-yehy")