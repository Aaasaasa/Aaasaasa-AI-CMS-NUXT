#!/bin/bash
# Einfache Featured Images Korrektur ohne hängende DB-Ausgaben

set -e

echo "🚀 Setze Featured Images schnell..."

# Bereinige zuerst
PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db -q -c "DELETE FROM cms_article_meta WHERE key = 'featured_image';"

echo "🧹 Alte Einträge gelöscht"

# Setze korrekte Featured Images direkt
echo "🔄 Setze neue Featured Images..."

# Direkte SQL-Updates ohne Loops
PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db -q -c "
-- Artikel 1: Malware
INSERT INTO cms_article_meta (\"articleId\", key, value)
SELECT 1, 'featured_image', '\"/uploads/2025/01/how-to-scan-and-clean-your-cloud-linux-server-from-malware.webp\"'
WHERE EXISTS (SELECT 1 FROM cms_articles WHERE id = 1);

-- Artikel 2: NPM ERESOLVE
INSERT INTO cms_article_meta (\"articleId\", key, value)
SELECT 2, 'featured_image', '\"/uploads/2025/01/ERESOLVE_npm_yarn.webp\"'
WHERE EXISTS (SELECT 1 FROM cms_articles WHERE id = 2);

-- Artikel 3: PHP
INSERT INTO cms_article_meta (\"articleId\", key, value)
SELECT 3, 'featured_image', '\"/uploads/2025/01/How-to-Install-PHP-8.3-on-Ubuntu-22.04.webp\"'
WHERE EXISTS (SELECT 1 FROM cms_articles WHERE id = 3);

-- Artikel 7: Ubuntu Packages
INSERT INTO cms_article_meta (\"articleId\", key, value)
SELECT 7, 'featured_image', '\"/uploads/2025/01/packages_snap_flatpak_docker_ssh_tunneling_ubuntu_linux.webp\"'
WHERE EXISTS (SELECT 1 FROM cms_articles WHERE id = 7);

-- Artikel 8: FFmpeg
INSERT INTO cms_article_meta (\"articleId\", key, value)
SELECT 8, 'featured_image', '\"/uploads/2024/10/20241008-Convert-MOV-to-MP4-Using-FFmpeg_-A-Simple-Guide.webp\"'
WHERE EXISTS (SELECT 1 FROM cms_articles WHERE id = 8);

-- Artikel 9: MP4 Guide
INSERT INTO cms_article_meta (\"articleId\", key, value)
SELECT 9, 'featured_image', '\"/uploads/2024/10/20241008-Why-You-Should-Consider-It-and-How-It-Works.webp\"'
WHERE EXISTS (SELECT 1 FROM cms_articles WHERE id = 9);

-- Artikel 10: ERP
INSERT INTO cms_article_meta (\"articleId\", key, value)
SELECT 10, 'featured_image', '\"/uploads/2024/07/2024-07-25-A-visual-representation-of-an-ERP-Enterprise-Resource-Planning-model-showing-relational-databases-improving-productivity.webp\"'
WHERE EXISTS (SELECT 1 FROM cms_articles WHERE id = 10);

-- Artikel 11: AI Technology
INSERT INTO cms_article_meta (\"articleId\", key, value)
SELECT 11, 'featured_image', '\"/uploads/2024/05/DALL·E-2024-05-21-23.24.56-A-modern-clean-website-interface-showcasing-advanced-AI-technology-with-elements-representing-GPT-4-capabilities.-The-design-should-include-icons-for.webp\"'
WHERE EXISTS (SELECT 1 FROM cms_articles WHERE id = 11);

-- Artikel 12: LibreOffice
INSERT INTO cms_article_meta (\"articleId\", key, value)
SELECT 12, 'featured_image', '\"/uploads/2024/05/DALL·E-2024-05-21-23.36.22-An-illustration-of-a-modern-desktop-environment-showing-LibreOffice-on-an-Ubuntu-system.-The-image-should-depict-a-Python-script-running-within-LibreO.webp\"'
WHERE EXISTS (SELECT 1 FROM cms_articles WHERE id = 12);
"

echo "✅ Featured Images gesetzt!"

# Schnelle Überprüfung ohne Tabellen-Ausgabe
count=$(PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db -t -q -c "SELECT COUNT(*) FROM cms_article_meta WHERE key = 'featured_image';" | xargs)

echo "📊 $count Featured Images erfolgreich gesetzt"
echo "🎉 Fertig!"
