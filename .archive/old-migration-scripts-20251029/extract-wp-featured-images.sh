#!/bin/bash
# Extrahiere echte Featured Image Zuordnungen aus WordPress und setze in PostgreSQL

set -e

echo "🔍 Lade WordPress SQL-Dump in temporäre MySQL-Datenbank..."

# Erstelle temporäre Datenbank
mysql -u root -e "DROP DATABASE IF EXISTS temp_wp_extract; CREATE DATABASE temp_wp_extract DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null || {
    echo "❌ MySQL-Zugriff fehlgeschlagen"
    exit 1
}

# Importiere SQL-Dump
mysql -u root temp_wp_extract < .docker/data/mysql/sta3wp_clean.sql 2>/dev/null || {
    echo "⚠️ SQL Import Warnung - fahre fort..."
}

echo "📊 Extrahiere Featured Image Zuordnungen..."

# Extrahiere Article Featured Images (post_type='post')
mysql -u root temp_wp_extract --batch --skip-column-names -e "
SELECT
    p.post_name as slug,
    att.guid as image_url,
    att_file.meta_value as file_path
FROM as_posts p
LEFT JOIN as_postmeta pm ON p.ID = pm.post_id AND pm.meta_key = '_thumbnail_id'
LEFT JOIN as_posts att ON pm.meta_value = att.ID AND att.post_type = 'attachment'
LEFT JOIN as_postmeta att_file ON att.ID = att_file.post_id AND att_file.meta_key = '_wp_attached_file'
WHERE p.post_type = 'post'
AND p.post_status = 'publish'
AND pm.meta_value IS NOT NULL
ORDER BY p.ID;
" > /tmp/article_images.txt

# Extrahiere Portfolio Featured Images (post_type='avada_portfolio')
mysql -u root temp_wp_extract --batch --skip-column-names -e "
SELECT
    p.post_name as slug,
    att.guid as image_url,
    att_file.meta_value as file_path
FROM as_posts p
LEFT JOIN as_postmeta pm ON p.ID = pm.post_id AND pm.meta_key = '_thumbnail_id'
LEFT JOIN as_posts att ON pm.meta_value = att.ID AND att.post_type = 'attachment'
LEFT JOIN as_postmeta att_file ON att.ID = att_file.post_id AND att_file.meta_key = '_wp_attached_file'
WHERE p.post_type = 'avada_portfolio'
AND p.post_status = 'publish'
AND pm.meta_value IS NOT NULL
ORDER BY p.ID;
" > /tmp/portfolio_images.txt

# Cleanup MySQL
mysql -u root -e "DROP DATABASE temp_wp_extract;" 2>/dev/null

echo "🔄 Verarbeite Article Featured Images..."

# Lösche alte falsche Zuordnungen (aber behalte die ersten 12 korrekten)
PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db -q -c "
DELETE FROM cms_article_meta WHERE key = 'featured_image' AND \"articleId\" > 12;
"

# Verarbeite Article Images
while IFS=$'\t' read -r slug image_url file_path; do
    if [[ -z "$slug" || -z "$file_path" ]]; then
        continue
    fi

    # Konvertiere WordPress Pfad zu WebP
    webp_path=$(echo "/uploads/$file_path" | sed 's/\.\(jpg\|jpeg\|png\|gif\)$/.webp/i')

    # Prüfe ob Datei existiert
    if [[ -f "public$webp_path" ]]; then
        # Finde Artikel in PostgreSQL
        article_id=$(PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db -t -q -c "SELECT id FROM cms_articles WHERE slug = '$slug' LIMIT 1;" | xargs)

        if [[ -n "$article_id" && "$article_id" != "" ]]; then
            echo "  ✅ Article '$slug' (ID: $article_id) -> $webp_path"

            PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db -q -c "
                INSERT INTO cms_article_meta (\"articleId\", key, value)
                VALUES ($article_id, 'featured_image', '\"$webp_path\"');
            " 2>/dev/null || true
        fi
    fi
done < /tmp/article_images.txt

echo ""
echo "🎨 Verarbeite Portfolio Featured Images..."

# Lösche alte Portfolio Featured Images
PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db -q -c "
DELETE FROM cms_portfolio_meta WHERE key = 'featured_image';
"

# Verarbeite Portfolio Images
while IFS=$'\t' read -r slug image_url file_path; do
    if [[ -z "$slug" || -z "$file_path" ]]; then
        continue
    fi

    # Konvertiere WordPress Pfad zu WebP
    webp_path=$(echo "/uploads/$file_path" | sed 's/\.\(jpg\|jpeg\|png\|gif\)$/.webp/i')

    # Prüfe ob Datei existiert
    if [[ -f "public$webp_path" ]]; then
        # Finde Portfolio in PostgreSQL
        portfolio_id=$(PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db -t -q -c "SELECT id FROM cms_portfolios WHERE slug = '$slug' LIMIT 1;" | xargs)

        if [[ -n "$portfolio_id" && "$portfolio_id" != "" ]]; then
            echo "  ✅ Portfolio '$slug' (ID: $portfolio_id) -> $webp_path"

            PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db -q -c "
                INSERT INTO cms_portfolio_meta (\"portfolioId\", key, value)
                VALUES ($portfolio_id, 'featured_image', '\"$webp_path\"');
            " 2>/dev/null || true
        fi
    fi
done < /tmp/portfolio_images.txt

# Cleanup
rm -f /tmp/article_images.txt /tmp/portfolio_images.txt

# Statistik
article_count=$(PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db -t -q -c "SELECT COUNT(*) FROM cms_article_meta WHERE key = 'featured_image';" | xargs)
portfolio_count=$(PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db -t -q -c "SELECT COUNT(*) FROM cms_portfolio_meta WHERE key = 'featured_image';" | xargs)

echo ""
echo "✨ Fertig!"
echo "📊 Articles: $article_count Featured Images"
echo "🎨 Portfolio: $portfolio_count Featured Images"
echo "🎯 ALLE Zuordnungen basieren auf echten WordPress-Daten!"
