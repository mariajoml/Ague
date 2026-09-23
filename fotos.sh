#!/bin/bash
# ------------------------------------------------------------
#  fotos.sh — prepara las fotos de la carta
#
#  1. Suelta tus fotos (heic, jpg, png) en  fotos-originales/
#  2. Corre:  ./fotos.sh
#  3. Listo: quedan optimizadas en fotos/ y el sitio las toma solo.
#
#  Pies de foto (opcional): edita fotos/pies.txt con líneas así
#     ague-01.jpg | Tu cumpleaños, 2022
# ------------------------------------------------------------
set -euo pipefail
cd "$(dirname "$0")"

ORIG="fotos-originales"
DEST="fotos"
PIES="$DEST/pies.txt"
ANCHO=1600

mkdir -p "$ORIG" "$DEST"
[ -f "$PIES" ] || : > "$PIES"

echo "→ Buscando fotos en $ORIG/ ..."

shopt -s nullglob nocaseglob
archivos=("$ORIG"/*.{heic,heif,jpg,jpeg,png,webp})
shopt -u nocaseglob

if [ ${#archivos[@]} -eq 0 ]; then
  echo "   (vacío) Suelta las fotos en $ORIG/ y vuelve a correr esto."
  exit 0
fi

# ordena por nombre para que el orden sea predecible
IFS=$'\n' archivos=($(printf '%s\n' "${archivos[@]}" | sort)); unset IFS

salida="$DEST/fotos.js"
{
  echo "/* generado por fotos.sh — no editar a mano."
  echo "   Para cambiar los pies de foto, edita fotos/pies.txt */"
  echo "window.FOTOS = ["
} > "$salida"

n=0
for f in "${archivos[@]}"; do
  n=$((n+1))
  base=$(printf "ague-%02d.jpg" "$n")
  sips -s format jpeg -s formatOptions 82 -Z "$ANCHO" "$f" --out "$DEST/$base" >/dev/null 2>&1 \
    || { echo "   ✗ no pude convertir: $f"; continue; }

  # pie de foto desde pies.txt  (formato:  archivo.jpg | texto)
  pie=$(grep -m1 "^[[:space:]]*$base[[:space:]]*|" "$PIES" 2>/dev/null | cut -d'|' -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' || true)
  grep -q "^[[:space:]]*$base[[:space:]]*|" "$PIES" 2>/dev/null || echo "$base | " >> "$PIES"

  pie_esc=$(printf '%s' "$pie" | sed 's/\\/\\\\/g; s/"/\\"/g')
  printf '  { "src": "fotos/%s", "pie": "%s" },\n' "$base" "$pie_esc" >> "$salida"
  echo "   ✓ $(basename "$f")  →  $base"
done

echo "];" >> "$salida"

echo ""
echo "Listo: $n foto(s) en $DEST/"
echo "Pies de foto opcionales en $PIES — edítalo y vuelve a correr ./fotos.sh"
