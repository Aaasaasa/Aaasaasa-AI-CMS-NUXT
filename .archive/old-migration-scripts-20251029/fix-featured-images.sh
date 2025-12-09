#!/bin/bash

# Einfache Lösung: Update die featured images direkt in PostgreSQL
set -e

PGPASSWORD="<POSTGRES_PASSWORD>"
export PGPASSWORD

echo "🔄 Aktualisiere Featured Images in PostgreSQL CMS..."

# Schaue erst, welche Dateien wir tatsächlich haben
echo "📁 Verfügbare WebP Dateien:"
find public/uploads -name "*.webp" -type f | grep -v -e "-thumbnail" -e "-medium" -e "-large" | head -5

echo ""
echo "🗃️ Aktuelle featured_image Einträge:"
psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db -c "
SELECT \"articleId\", value
FROM cms_article_meta
WHERE key = 'featured_image'
LIMIT 5;
"

echo ""
echo "🔄 Aktualisiere featured_image Werte auf existierende Dateien..."

# Update ALLE Artikel mit existierenden Dateien
psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db -c "
-- Artikel 1: Malware Scanner
UPDATE cms_article_meta
SET value = '\"/uploads/2025/01/how-to-scan-and-clean-your-cloud-linux-server-from-malware.webp\"'
WHERE \"articleId\" = 1 AND key = 'featured_image';

-- Artikel 2: NPM ERESOLVE
UPDATE cms_article_meta
SET value = '\"/uploads/2025/01/ERESOLVE_npm_yarn.webp\"'
WHERE \"articleId\" = 2 AND key = 'featured_image';

-- Artikel 3: PHP Installation
UPDATE cms_article_meta
SET value = '\"/uploads/2025/01/How-to-Install-PHP-8.3-on-Ubuntu-22.04.webp\"'
WHERE \"articleId\" = 3 AND key = 'featured_image';

-- Artikel 4: NPM Conflicts (ähnlich wie Artikel 2)
UPDATE cms_article_meta
SET value = '\"/uploads/2025/01/ERESOLVE_npm_yarn.webp\"'
WHERE \"articleId\" = 4 AND key = 'featured_image';

-- Artikel 5: Malware Scanning (ähnlich wie Artikel 1)
UPDATE cms_article_meta
SET value = '\"/uploads/2025/01/how-to-scan-and-clean-your-cloud-linux-server-from-malware.webp\"'
WHERE \"articleId\" = 5 AND key = 'featured_image';

-- Artikel 6: Malware Scanning (ähnlich wie Artikel 1)
UPDATE cms_article_meta
SET value = '\"/uploads/2025/01/how-to-scan-and-clean-your-cloud-linux-server-from-malware.webp\"'
WHERE \"articleId\" = 6 AND key = 'featured_image';

-- Artikel 7: Ubuntu Packages (bereits korrekt)
-- Artikel 8: FFmpeg MOV to MP4 (bereits korrekt)
-- Artikel 9: Already correct (bereits korrekt)

-- Artikel 10: ERP System - korrigiere den Pfad
UPDATE cms_article_meta
SET value = '\"/uploads/2024/07/2024-07-25-A-visual-representation-of-an-ERP-Enterprise-Resource-Planning-model-showing-relational-databases-improving-productivity.webp\"'
WHERE \"articleId\" = 10 AND key = 'featured_image';

-- Artikel 11: AI Technology (bereits korrekt)
-- Artikel 12, 13, 14, 15: LibreOffice - alle auf die Hauptdatei setzen
UPDATE cms_article_meta
SET value = '\"/uploads/2024/05/DALL·E-2024-05-21-23.36.22-An-illustration-of-a-modern-desktop-environment-showing-LibreOffice-on-an-Ubuntu-system.-The-image-should-depict-a-Python-script-running-within-LibreO.webp\"'
WHERE \"articleId\" IN (12, 13, 14, 15) AND key = 'featured_image';
"

echo ""
echo "✅ Featured Images aktualisiert!"

echo ""
echo "📋 Neue featured_image Werte:"
psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db -c "
SELECT \"articleId\", value
FROM cms_article_meta
WHERE key = 'featured_image'
LIMIT 5;
"

echo ""
echo "🎉 Fertig! Jetzt sollten die Bilder funktionieren."
