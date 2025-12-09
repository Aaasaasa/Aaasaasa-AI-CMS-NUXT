#!/bin/bash
set -e

echo "🔄 Aktualisiere Featured Images aus WordPress Mapping..."

# Lese Updates aus JSON
if [ ! -f "scripts/featured-image-updates.json" ]; then
    echo "❌ Datei scripts/featured-image-updates.json nicht gefunden!"
    echo "   Bitte zuerst scripts/map-wp-images.py ausführen"
    exit 1
fi

UPDATES=$(cat scripts/featured-image-updates.json | jq -r '.[] | "\(.pg_id)|\(.webp_path)"')

if [ -z "$UPDATES" ]; then
    echo "❌ Keine Updates gefunden!"
    exit 1
fi

COUNT=0
UPDATED=0
INSERTED=0

while IFS='|' read -r pg_id webp_path; do
    # Erstelle JSON-Wert für featured_image
    json_value="{\"url\": \"$webp_path\"}"

    # Prüfe ob Meta-Eintrag existiert
    EXISTS=$(docker exec nuxt_postgres psql -U usrcms -d nuxt_pg_cms_db -t -A -c \
        "SELECT COUNT(*) FROM cms_article_meta WHERE \"articleId\" = $pg_id AND key = 'featured_image';")

    if [ "$EXISTS" -gt 0 ]; then
        # UPDATE existierender Eintrag
        echo "  ✏️  Update ID $pg_id: $webp_path"
        docker exec nuxt_postgres psql -U usrcms -d nuxt_pg_cms_db -c \
            "UPDATE cms_article_meta SET value = '$json_value' WHERE \"articleId\" = $pg_id AND key = 'featured_image';" > /dev/null
        UPDATED=$((UPDATED + 1))
    else
        # INSERT neuer Eintrag
        echo "  ➕ Insert ID $pg_id: $webp_path"
        docker exec nuxt_postgres psql -U usrcms -d nuxt_pg_cms_db -c \
            "INSERT INTO cms_article_meta (\"articleId\", key, value) VALUES ($pg_id, 'featured_image', '$json_value');" > /dev/null
        INSERTED=$((INSERTED + 1))
    fi

    COUNT=$((COUNT + 1))
done <<< "$UPDATES"

echo ""
echo "✅ $COUNT Featured Images aktualisiert!"
echo "   - $UPDATED aktualisiert"
echo "   - $INSERTED neu eingefügt"
echo ""
echo "� Überprüfung (erste 10 Artikel):"
docker exec nuxt_postgres psql -U usrcms -d nuxt_pg_cms_db -c \
    "SELECT a.id, LEFT(a.slug, 40) as slug, LEFT(m.value::text, 60) as featured_image FROM cms_articles a LEFT JOIN cms_article_meta m ON a.id = m.\"articleId\" AND m.key = 'featured_image' WHERE a.id <= 10 ORDER BY a.id;"

