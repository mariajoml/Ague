# Para mi Ague 💌

Carta de cumpleaños interactiva para mi abuelita.

## Cómo verla

Abre `index.html` en el navegador. Ya está.

## Cómo poner las fotos

1. Exporta las fotos desde Fotos (Archivo → Exportar → Exportar originales) a la carpeta `fotos-originales/`.
2. En la terminal, dentro de esta carpeta:

   ```bash
   ./fotos.sh
   ```

   Convierte HEIC/PNG a JPG, las optimiza y deja todo listo en `fotos/`.
3. Recarga `index.html`.

### Pies de foto (opcional)

Después de correr `./fotos.sh` se crea `fotos/pies.txt` con una línea por foto:

```
ague-01.jpg | Tu cumpleaños en el Four Points
ague-02.jpg | El brindis en la boda
```

Escribe el texto después del `|` y vuelve a correr `./fotos.sh`.

## Música (opcional)

Pon un mp3 en `audio/cancion.mp3` y el botón de música arriba a la derecha lo reproduce.

## Estructura

```
index.html        la carta
css/style.css     los estilos
js/main.js        sobre, reveals, lecciones, galería, velitas, corazones
fotos.sh          importador de fotos
fotos/            fotos listas para web + fotos.js (generado)
fotos-originales/ donde sueltas los originales (no se sube a git)
```

## Publicar

En GitHub: Settings → Pages → Branch `main` / carpeta `/ (root)`.
