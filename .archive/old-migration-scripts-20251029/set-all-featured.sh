#!/bin/bash
# Komplette Featured Images Zuordnung - einfache Version

set -e

echo "🎯 Setze ALLE fehlenden Featured Images..."

# Verfügbare Bilder
TECH="/uploads/2025/02/Project-Management.webp"
CODE="/uploads/2024/05/step-by-step-guide-illustration-showing-the-process-of-setting-up-Git-with-auto-upload-and-synchronization-to-a-production-server.webp"
AI="/uploads/2024/05/DALL·E-2024-05-21-23.24.56-A-modern-clean-website-interface-showcasing-advanced-AI-technology-with-elements-representing-GPT-4-capabilities.-The-design-should-include-icons-for.webp"
SERVER="/uploads/2025/02/Managing-Multiple-SSH-Keys-for-Client-Backups-on-a-Single-Server.webp"
DB="/uploads/2024/07/2024-07-25-A-visual-representation-of-an-ERP-Enterprise-Resource-Planning-model-showing-relational-databases-improving-productivity.webp"
WEB="/uploads/2025/02/Business-Process-Model-and-Notation-BPMN.webp"

# Einfache INSERTs ohne ON CONFLICT
PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db --no-align --tuples-only --quiet -c "
INSERT INTO cms_article_meta (\"articleId\", key, value) VALUES
(16, 'featured_image', '\"$AI\"'),
(17, 'featured_image', '\"$WEB\"'),
(18, 'featured_image', '\"$CODE\"'),
(19, 'featured_image', '\"$WEB\"'),
(21, 'featured_image', '\"$SERVER\"'),
(23, 'featured_image', '\"$CODE\"'),
(24, 'featured_image', '\"$SERVER\"'),
(26, 'featured_image', '\"$CODE\"'),
(27, 'featured_image', '\"$TECH\"'),
(28, 'featured_image', '\"$SERVER\"'),
(29, 'featured_image', '\"$SERVER\"'),
(30, 'featured_image', '\"$DB\"'),
(31, 'featured_image', '\"$CODE\"'),
(32, 'featured_image', '\"$DB\"'),
(33, 'featured_image', '\"$CODE\"'),
(34, 'featured_image', '\"$AI\"'),
(35, 'featured_image', '\"$SERVER\"'),
(36, 'featured_image', '\"$CODE\"'),
(37, 'featured_image', '\"$CODE\"');
"

count=$(PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db --no-align --tuples-only --quiet -c "SELECT COUNT(*) FROM cms_article_meta WHERE key = 'featured_image';" | xargs)

echo "✅ $count Article Featured Images gesetzt"

missing=$(PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db --no-align --tuples-only --quiet -c "SELECT COUNT(*) FROM cms_articles WHERE id NOT IN (SELECT \"articleId\" FROM cms_article_meta WHERE key = 'featured_image');" | xargs)

if [ "$missing" -eq 0 ]; then
    echo "🎉 ALLE Artikel haben Featured Images!"
else
    echo "⚠️ Noch $missing Artikel fehlen"
fi
