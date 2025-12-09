#!/bin/bash
# Featured Images fix - non-interactive

set -e

echo "🔍 Zeige Artikel und aktuelle Featured Images..."

# Non-interactive psql with proper options
PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db \
  --no-align --tuples-only --quiet \
  -c "SELECT ca.id, ca.slug, COALESCE(cam.value::text, 'NULL') FROM cms_articles ca LEFT JOIN cms_article_meta cam ON ca.id = cam.\"articleId\" AND cam.key = 'featured_image' ORDER BY ca.id;"

echo ""
echo "🎯 Fertig - keine interaktive DB-Session"
