#!/bin/bash
# Ergänze fehlende Featured Images basierend auf verfügbaren Bildern

set -e

echo "🔄 Ergänze fehlende Featured Images..."

# Non-interactive SQL updates für fehlende Artikel
PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db \
  --no-align --tuples-only --quiet \
  -c "
-- Artikel 4: Laravel CMS
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (4, 'featured_image', '\"/uploads/2025/01/Laravel-12-Custom-CMS-with-a-Filament3.webp\"');

-- Artikel 5: Database Marketing
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (5, 'featured_image', '\"/uploads/2025/01/Databasemarketing.png.webp\"');

-- Artikel 6: Database Marketing (gleich wie 5)
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (6, 'featured_image', '\"/uploads/2025/01/Databasemarketing.png.webp\"');

-- Artikel 13: Drag and Drop
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (13, 'featured_image', '\"/uploads/2024/05/DALL·E-2024-05-22-07.16.12-A-modern-web-application-interface-showing-a-drag-and-drop-list-in-a-container-with-Bootstrap-5-styling.-The-list-items-should-be-displayed-as-cards-t.webp\"');

-- Artikel 14: WordPress Plugin
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (14, 'featured_image', '\"/uploads/2024/05/DALL·E-2024-05-22-00.05.58-A-screenshot-of-a-WordPress-dashboard-showing-a-custom-plugin-creation.-The-screen-includes-sections-for-plugin-name-description-author-and-code-ed.webp\"');

-- Artikel 15: GPT-4 (ähnlich wie 11)
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (15, 'featured_image', '\"/uploads/2024/05/DALL·E-2024-05-21-23.24.56-A-modern-clean-website-interface-showcasing-advanced-AI-technology-with-elements-representing-GPT-4-capabilities.-The-design-should-include-icons-for.webp\"');

-- Artikel 20: MVC
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (20, 'featured_image', '\"/uploads/2025/02/Business-Process-Model-and-Notation-BPMN.webp\"');

-- Artikel 22: PostgreSQL Ubuntu
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (22, 'featured_image', '\"/uploads/2025/02/Managing-Multiple-SSH-Keys-for-Client-Backups-on-a-Single-Server.webp\"');

-- Artikel 25: JavaScript
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (25, 'featured_image', '\"/uploads/2025/04/Modules-in-VueJS_ES-Modules_CommonJS.png.webp\"');
"

# Zähle Ergebnisse
count=$(PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db \
  --no-align --tuples-only --quiet \
  -c "SELECT COUNT(*) FROM cms_article_meta WHERE key = 'featured_image';" | xargs)

echo "✅ Insgesamt $count Featured Images gesetzt"
echo "🎉 Fehlende Bilder ergänzt!"
