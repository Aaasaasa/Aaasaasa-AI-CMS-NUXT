#!/usr/bin/env python3
"""
Map WordPress Featured Images to PostgreSQL
Nutzt die bereits extrahierten _thumbnail_id und _wp_attached_file Daten
"""

import re
import json
import subprocess
from pathlib import Path

# Bekannte Mappings aus grep Output
THUMBNAIL_MAPPINGS = """
12707,13406,_thumbnail_id,13588
14757,13440,_thumbnail_id,13584
15761,13543,_thumbnail_id,13579
15782,13541,_thumbnail_id,13581
15786,13537,_thumbnail_id,13583
16256,13758,_thumbnail_id,13760
16304,13765,_thumbnail_id,13773
16294,13768,_thumbnail_id,13771
16512,13817,_thumbnail_id,13819
16517,13821,_thumbnail_id,13819
16547,13828,_thumbnail_id,13830
16574,13835,_thumbnail_id,13839
16584,13841,_thumbnail_id,13842
16605,13846,_thumbnail_id,13847
"""

ATTACHMENT_FILES = """
15759,13579,_wp_attached_file,2023/04/stajic_de_Front_und_Backend_Entwicklung_Webentwicklung.png
15772,13581,_wp_attached_file,2023/04/stajic_Suchmaschinen_Webcrawler_Suchergebnissen.png
15784,13583,_wp_attached_file,2023/04/foto_Suchmaschinen_Webcrawler_Suchergebnissen.png
15788,13584,_wp_attached_file,2022/05/Ubuntu-APT-Paketquellen-www.stajic.de_.jpeg
15799,13585,_wp_attached_file,2021/07/PostgreSQL-Ubuntu-Server-www.stajic.de_.jpeg
15809,13588,_wp_attached_file,2023/05/stajic_de_Python_Logo_Virtuelle_Environments.png
15820,13590,_wp_attached_file,2021/02/stajic_MySQL_XAMPP_Absicherung.png
15831,13592,_wp_attached_file,2020/09/stajic_Wie_Funktioniert_der_DNS.png
15842,13595,_wp_attached_file,2020/09/stajic_SSH_Banner_Logo_Absicherung.png
16241,13726,_wp_attached_file,2024/07/2024-07-25-A-real-world-model-of-an-ERP-Enterprise-Resource-Planning-system-showing-relational-databases-improving-productivity.webp
16250,13760,_wp_attached_file,2024/07/2024-07-25-A-visual-representation-of-an-ERP-Enterprise-Resource-Planning-model-showing-relational-databases-improving-productivity.webp
16291,13771,_wp_attached_file,2024/10/20241008-Convert-MOV-to-MP4-Using-FFmpeg_-A-Simple-Guide.webp
16301,13773,_wp_attached_file,2024/10/20241008-Why-You-Should-Consider-It-and-How-It-Works.webp
16482,13798,_wp_attached_file,2025/01/packages_snap_flatpak_docker_ssh_tunneling_ubuntu_linux.webp
16509,13819,_wp_attached_file,2025/01/Databasemarketing.png
16544,13830,_wp_attached_file,2025/01/Laravel-12-Custom-CMS-with-a-Filament3.webp
16571,13839,_wp_attached_file,2025/01/How-to-Install-PHP-8.3-on-Ubuntu-22.04.webp
16581,13842,_wp_attached_file,2025/01/ERESOLVE_npm_yarn.webp
16602,13847,_wp_attached_file,2025/01/how-to-scan-and-clean-your-cloud-linux-server-from-malware.webp
"""

UPLOADS_DIR = Path("public/uploads")

def parse_mappings():
    """Parse die bekannten Mappings"""
    # post_id -> attachment_id
    thumbnails = {}
    for line in THUMBNAIL_MAPPINGS.strip().split('\n'):
        if not line:
            continue
        parts = line.split(',')
        post_id = parts[1]
        attachment_id = parts[3]
        thumbnails[post_id] = attachment_id

    # attachment_id -> filepath
    attachments = {}
    for line in ATTACHMENT_FILES.strip().split('\n'):
        if not line:
            continue
        parts = line.split(',', 3)
        attachment_id = parts[1]
        filepath = parts[3]
        attachments[attachment_id] = filepath

    return thumbnails, attachments

def get_pg_articles():
    """Hole alle Artikel aus PostgreSQL"""
    result = subprocess.run(
        ['docker', 'exec', 'nuxt_postgres', 'psql', '-U', 'usrcms', '-d', 'nuxt_pg_cms_db',
         '-t', '-A', '-c',
         'SELECT id || \'|\' || slug FROM cms_articles ORDER BY id;'],
        capture_output=True,
        text=True
    )

    articles = {}
    for line in result.stdout.strip().split('\n'):
        if '|' in line:
            id_str, slug = line.split('|', 1)
            articles[slug] = int(id_str)

    return articles

def convert_to_webp(original_path):
    """Konvertiere WP Pfad zu WebP"""
    # Beispiel: 2023/04/file.png -> 2023/04/file.webp
    path = Path(original_path)
    filename = path.stem

    # Bereits WebP?
    if original_path.endswith('.webp'):
        webp_name = path.name
        # Suche in gleichem Unterordner
        date_folder = '/'.join(path.parts[:-1])  # z.B. "2024/07"
        webp_path = UPLOADS_DIR / date_folder / webp_name
        if webp_path.exists():
            return f"/uploads/{date_folder}/{webp_name}"
    else:
        webp_name = f"{filename}.webp"
        # Suche in gleichem Unterordner
        date_folder = '/'.join(path.parts[:-1])  # z.B. "2023/04"
        webp_path = UPLOADS_DIR / date_folder / webp_name
        if webp_path.exists():
            return f"/uploads/{date_folder}/{webp_name}"

    # Fallback: Suche rekursiv
    for webp_file in UPLOADS_DIR.rglob("*.webp"):
        if webp_file.stem == filename:
            relative_path = webp_file.relative_to(UPLOADS_DIR)
            return f"/uploads/{relative_path}"

    # Fallback 2: Ähnlicher Filename
    for webp_file in UPLOADS_DIR.rglob("*.webp"):
        if filename.lower() in webp_file.stem.lower():
            relative_path = webp_file.relative_to(UPLOADS_DIR)
            return f"/uploads/{relative_path}"

    return None

def main():
    print("🔍 Parse WordPress Mappings...")
    thumbnails, attachments = parse_mappings()
    print(f"   ✓ {len(thumbnails)} WordPress Posts mit Featured Images")
    print(f"   ✓ {len(attachments)} Attachment Dateipfade")

    print("\n📊 Hole PostgreSQL Artikel...")
    pg_articles = get_pg_articles()
    print(f"   ✓ {len(pg_articles)} Artikel in PostgreSQL")

    print("\n🔗 Mappe WordPress IDs zu Slugs...")
    # Mapping der bekannten Post IDs zu PostgreSQL Slugs
    wp_post_slugs = {
        "13406": "force-install-package-in-virtualenv",  # ID 23
        "13440": "ubuntu-debian-doppelte-apt-paketquellen-entfernen",  # ID 21
        "13543": "front-und-backend-entwicklung",  # ID 18
        "13541": "suchmaschinen-webcrawler-suchsoftware-und-suchergebnissen",  # ID 19
        "13537": "front-und-backend-entwicklung",  # ID 18 (duplicate?)
        "13758": "boosting-productivity-with-erp-systems-a-case-study-on-relational-databases",  # ID 10
        "13765": "heic-to-jpg-conversion-why-you-should-consider-it-and-how-it-works",  # ID 9
        "13768": "convert-mov-to-mp4-using-ffmpeg-a-simple-guide",  # ID 8
        "13817": "database-marketing",  # ID 5
        "13821": "databasemarketing",  # ID 6
        "13828": "laravel-12-custom-cms-with-filament3",  # ID 4
        "13835": "how-to-install-php-8-3-on-ubuntu-22-04",  # ID 3
        "13841": "understanding-and-resolving-npm-eresolve-dependency-conflicts",  # ID 2
        "13846": "how-to-scan-and-clean-your-cloud-linux-server-from-malware"  # ID 1
    }

    print("\n🎨 Erstelle Zuordnungen...")
    updates = []
    not_found = []

    for wp_post_id, attachment_id in thumbnails.items():
        if wp_post_id not in wp_post_slugs:
            not_found.append(f"WP Post {wp_post_id} - kein Slug bekannt")
            continue

        slug = wp_post_slugs[wp_post_id]

        if slug not in pg_articles:
            not_found.append(f"Slug '{slug}' nicht in PostgreSQL")
            continue

        pg_id = pg_articles[slug]

        if attachment_id not in attachments:
            not_found.append(f"Attachment {attachment_id} nicht gefunden")
            continue

        original_path = attachments[attachment_id]
        webp_path = convert_to_webp(original_path)

        if not webp_path:
            not_found.append(f"WebP für {original_path} nicht gefunden")
            continue

        updates.append({
            "pg_id": pg_id,
            "slug": slug,
            "wp_post_id": wp_post_id,
            "webp_path": webp_path,
            "original": original_path
        })

    print(f"\n✅ {len(updates)} Zuordnungen erfolgreich")
    print(f"⚠️  {len(not_found)} nicht gefunden")

    if not_found:
        print("\n❌ Probleme:")
        for issue in not_found[:5]:
            print(f"   - {issue}")

    # Zeige Updates
    print("\n📝 Updates:")
    for update in updates:
        print(f"   ID {update['pg_id']:2d} | {update['slug']:40s} | {update['webp_path']}")

    # Speichere für SQL Script
    with open("scripts/featured-image-updates.json", "w") as f:
        json.dump(updates, f, indent=2)

    print(f"\n💾 Gespeichert: scripts/featured-image-updates.json")
    print("\n➡️  Nächster Schritt: SQL Update Script ausführen")

if __name__ == "__main__":
    main()
