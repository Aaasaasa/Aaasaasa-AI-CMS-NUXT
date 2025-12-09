#!/bin/bash
# Komplette Featured Images Zuordnung für ALLE fehlenden Artikel

set -e

echo "🎯 Setze ALLE fehlenden Featured Images..."

# Verfügbare Bilder als Fallback
TECH_IMAGE="/uploads/2025/02/Project-Management.webp"
CODE_IMAGE="/uploads/2024/05/step-by-step-guide-illustration-showing-the-process-of-setting-up-Git-with-auto-upload-and-synchronization-to-a-production-server.webp"
AI_IMAGE="/uploads/2024/05/DALL·E-2024-05-21-23.24.56-A-modern-clean-website-interface-showcasing-advanced-AI-technology-with-elements-representing-GPT-4-capabilities.-The-design-should-include-icons-for.webp"
SERVER_IMAGE="/uploads/2025/02/Managing-Multiple-SSH-Keys-for-Client-Backups-on-a-Single-Server.webp"
DB_IMAGE="/uploads/2024/07/2024-07-25-A-visual-representation-of-an-ERP-Enterprise-Resource-Planning-model-showing-relational-databases-improving-productivity.webp"
WEB_IMAGE="/uploads/2025/02/Business-Process-Model-and-Notation-BPMN.webp"

# SQL für alle fehlenden Artikel
PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db \
  --no-align --tuples-only --quiet \
  -c "
-- Artikel 16: TensorFlow (AI/ML)
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (16, 'featured_image', '\"$AI_IMAGE\"');-- Artikel 17: SEO Tipps
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (17, 'featured_image', '\"$WEB_IMAGE\"')
ON CONFLICT (\"articleId\", key) DO UPDATE SET value = '\"$WEB_IMAGE\"';

-- Artikel 18: Frontend/Backend
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (18, 'featured_image', '\"$CODE_IMAGE\"')
ON CONFLICT (\"articleId\", key) DO UPDATE SET value = '\"$CODE_IMAGE\"';

-- Artikel 19: Suchmaschinen/Webcrawler
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (19, 'featured_image', '\"$WEB_IMAGE\"')
ON CONFLICT (\"articleId\", key) DO UPDATE SET value = '\"$WEB_IMAGE\"';

-- Artikel 21: Ubuntu/Debian
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (21, 'featured_image', '\"$SERVER_IMAGE\"')
ON CONFLICT (\"articleId\", key) DO UPDATE SET value = '\"$SERVER_IMAGE\"';

-- Artikel 23: Python Virtualenv
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (23, 'featured_image', '\"$CODE_IMAGE\"')
ON CONFLICT (\"articleId\", key) DO UPDATE SET value = '\"$CODE_IMAGE\"';

-- Artikel 24: SHA512/Dovecot
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (24, 'featured_image', '\"$SERVER_IMAGE\"')
ON CONFLICT (\"articleId\", key) DO UPDATE SET value = '\"$SERVER_IMAGE\"';

-- Artikel 26: PCL Library Python
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (26, 'featured_image', '\"$CODE_IMAGE\"')
ON CONFLICT (\"articleId\", key) DO UPDATE SET value = '\"$CODE_IMAGE\"';

-- Artikel 27: Thunderbird OAuth2
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (27, 'featured_image', '\"$TECH_IMAGE\"')
ON CONFLICT (\"articleId\", key) DO UPDATE SET value = '\"$TECH_IMAGE\"';

-- Artikel 28: RPM to DEB
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (28, 'featured_image', '\"$SERVER_IMAGE\"')
ON CONFLICT (\"articleId\", key) DO UPDATE SET value = '\"$SERVER_IMAGE\"';

-- Artikel 29: Find Kommando
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (29, 'featured_image', '\"$SERVER_IMAGE\"')
ON CONFLICT (\"articleId\", key) DO UPDATE SET value = '\"$SERVER_IMAGE\"';

-- Artikel 30: Apache Solr
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (30, 'featured_image', '\"$DB_IMAGE\"')
ON CONFLICT (\"articleId\", key) DO UPDATE SET value = '\"$DB_IMAGE\"';

-- Artikel 31: mod_wsgi Django
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (31, 'featured_image', '\"$CODE_IMAGE\"')
ON CONFLICT (\"articleId\", key) DO UPDATE SET value = '\"$CODE_IMAGE\"';

-- Artikel 32: MySQL
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (32, 'featured_image', '\"$DB_IMAGE\"')
ON CONFLICT (\"articleId\", key) DO UPDATE SET value = '\"$DB_IMAGE\"';

-- Artikel 33: Git/Linux Server
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (33, 'featured_image', '\"$CODE_IMAGE\"')
ON CONFLICT (\"articleId\", key) DO UPDATE SET value = '\"$CODE_IMAGE\"';

-- Artikel 34: VisualSFM/CUDA
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (34, 'featured_image', '\"$AI_IMAGE\"')
ON CONFLICT (\"articleId\", key) DO UPDATE SET value = '\"$AI_IMAGE\"';

-- Artikel 35: Apache/Let's Encrypt
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (35, 'featured_image', '\"$SERVER_IMAGE\"')
ON CONFLICT (\"articleId\", key) DO UPDATE SET value = '\"$SERVER_IMAGE\"';

-- Artikel 36: Git SSH Windows
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (36, 'featured_image', '\"$CODE_IMAGE\"')
ON CONFLICT (\"articleId\", key) DO UPDATE SET value = '\"$CODE_IMAGE\"';

-- Artikel 37: JetBrains IDE
INSERT INTO cms_article_meta (\"articleId\", key, value)
VALUES (37, 'featured_image', '\"$CODE_IMAGE\"')
ON CONFLICT (\"articleId\", key) DO UPDATE SET value = '\"$CODE_IMAGE\"';
"

# Zähle finale Anzahl
count=$(PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db \
  --no-align --tuples-only --quiet \
  -c "SELECT COUNT(*) FROM cms_article_meta WHERE key = 'featured_image';" | xargs)

echo "✅ Insgesamt $count Article Featured Images gesetzt"

# Prüfe Portfolio Featured Images
portfolio_count=$(PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db \
  --no-align --tuples-only --quiet \
  -c "SELECT COUNT(*) FROM cms_portfolio_meta WHERE key = 'featured_image';" | xargs)

echo "✅ Portfolio hat bereits $portfolio_count Featured Images"

# Zeige fehlende Artikel
missing=$(PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db \
  --no-align --tuples-only --quiet \
  -c "SELECT COUNT(*) FROM cms_articles WHERE id NOT IN (SELECT \"articleId\" FROM cms_article_meta WHERE key = 'featured_image');" | xargs)

if [ "$missing" -eq 0 ]; then
    echo "🎉 ALLE Artikel haben jetzt Featured Images!"
else
    echo "⚠️ Noch $missing Artikel ohne Featured Images"
fi

echo ""
echo "🎯 Featured Images Update abgeschlossen!"
