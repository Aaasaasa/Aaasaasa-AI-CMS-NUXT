#!/bin/bash
# WordPress Featured Images korrekt basierend auf WordPress-Zuordnungen

set -e
PGPASSWORD="<POSTGRES_PASSWORD>"
export PGPASSWORD

echo "🚀 Korrigiere Featured Images basierend auf WordPress-Zuordnungen..."

echo ""
echo "📋 Aktuelle Artikel in PostgreSQL:"
PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db -c "SELECT id, slug FROM cms_articles ORDER BY id;"

echo ""
echo "🧹 Bereinige bestehende featured_image Einträge..."
PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db -c "DELETE FROM cms_article_meta WHERE key = 'featured_image';"

echo ""
echo "🔄 Setze korrekte Featured Images basierend auf WordPress-Zuordnungen..."

# Korrekte Zuordnungen von WordPress
declare -A wp_mappings=(
    ["how-to-scan-and-clean-your-cloud-linux-server-from-malware"]="/uploads/2025/01/how-to-scan-and-clean-your-cloud-linux-server-from-malware.webp"
    ["solving-eresolve-unable-to-resolve-dependency-tree-npm-yarn"]="/uploads/2025/01/ERESOLVE_npm_yarn.webp"
    ["how-to-install-php-8-3-on-ubuntu-22-04"]="/uploads/2025/01/How-to-Install-PHP-8.3-on-Ubuntu-22.04.webp"
    ["packages-snap-flatpak-docker-ssh-tunneling-ubuntu-linux"]="/uploads/2025/01/packages_snap_flatpak_docker_ssh_tunneling_ubuntu_linux.webp"
    ["convert-mov-to-mp4-using-ffmpeg-a-simple-guide"]="/uploads/2024/10/20241008-Convert-MOV-to-MP4-Using-FFmpeg_-A-Simple-Guide.webp"
    ["why-you-should-consider-it-and-how-it-works"]="/uploads/2024/10/20241008-Why-You-Should-Consider-It-and-How-It-Works.webp"
    ["erp-enterprise-resource-planning-model"]="/uploads/2024/07/2024-07-25-A-visual-representation-of-an-ERP-Enterprise-Resource-Planning-model-showing-relational-databases-improving-productivity.webp"
    ["ai-technology-gpt-4-capabilities"]="/uploads/2024/05/DALL·E-2024-05-21-23.24.56-A-modern-clean-website-interface-showcasing-advanced-AI-technology-with-elements-representing-GPT-4-capabilities.-The-design-should-include-icons-for.webp"
    ["libreoffice-python-integration"]="/uploads/2024/05/DALL·E-2024-05-21-23.36.22-An-illustration-of-a-modern-desktop-environment-showing-LibreOffice-on-an-Ubuntu-system.-The-image-should-depict-a-Python-script-running-within-LibreO.webp"
)

# Verarbeite jede Zuordnung
for slug in "${!wp_mappings[@]}"; do
    image_path="${wp_mappings[$slug]}"

    echo "🔍 Verarbeite: $slug"

    # Prüfe ob Datei existiert
    if [[ -f "public$image_path" ]]; then
        echo "  ✅ Datei gefunden: $image_path"

        # Finde Artikel-ID in PostgreSQL
        pg_article_id=$(PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db -t -c "SELECT id FROM cms_articles WHERE slug = '$slug' LIMIT 1;" | xargs)

        if [[ -n "$pg_article_id" && "$pg_article_id" != "" ]]; then
            echo "  📝 Update Artikel ID $pg_article_id mit $image_path"

            PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db -c "INSERT INTO cms_article_meta (\"articleId\", key, value) VALUES ($pg_article_id, 'featured_image', '\"$image_path\"');" >/dev/null 2>&1

            echo "  ✅ Featured Image gesetzt"
        else
            echo "  ⚠️ Artikel nicht gefunden: $slug"
        fi
    else
        echo "  ❌ Datei nicht gefunden: $image_path"
    fi
done

echo ""
echo "📊 Endergebnisse - Featured Images:"
PGPASSWORD=<POSTGRES_PASSWORD> psql -h localhost -p 5432 -U usrcms -d nuxt_pg_cms_db -c "SELECT ca.id, ca.slug, cam.value as featured_image FROM cms_articles ca LEFT JOIN cms_article_meta cam ON ca.id = cam.\"articleId\" AND cam.key = 'featured_image' ORDER BY ca.id;"

echo ""
echo "✨ Featured Images Korrektur abgeschlossen!"
echo "🎯 Basierend auf korrekten WordPress-Zuordnungen"
