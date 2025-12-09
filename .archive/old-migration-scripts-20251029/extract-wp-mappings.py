#!/usr/bin/env python3
"""
WordPress Featured Image Mapper
Extrahiert featured image mappings aus WordPress SQL Dump
und matched sie gegen existierende WebP Files
"""

import re
import json
from pathlib import Path

# Pfade
SQL_FILE = Path(".docker/data/mysql/sta3wp.sql")
UPLOADS_DIR = Path("public/uploads")
OUTPUT_FILE = Path("scripts/wp-featured-mappings.json")

def extract_thumbnail_mappings(sql_content):
    """Extrahiert post_id -> attachment_id mappings"""
    pattern = r"\((\d+),(\d+),'_thumbnail_id','(\d+)'\)"
    mappings = {}

    for match in re.finditer(pattern, sql_content):
        meta_id, post_id, attachment_id = match.groups()
        mappings[post_id] = attachment_id

    print(f"✓ {len(mappings)} _thumbnail_id mappings gefunden")
    return mappings

def extract_attachment_files(sql_content):
    """Extrahiert attachment_id -> filepath mappings"""
    pattern = r"\((\d+),(\d+),'_wp_attached_file','([^']+)'\)"
    files = {}

    for match in re.finditer(pattern, sql_content):
        meta_id, attachment_id, filepath = match.groups()
        files[attachment_id] = filepath

    print(f"✓ {len(files)} attachment files gefunden")
    return files

def extract_post_slugs(sql_content):
    """Extrahiert post_id -> slug und post_type mappings"""
    # Suche nach as_posts INSERT mit post_type = 'post' oder 'avada_portfolio'
    posts = {}

    # Pattern für post entries (ID ist nach VALUES( das erste Feld)
    lines = sql_content.split('\n')

    for line in lines:
        if "'post'" in line or "'avada_portfolio'" in line:
            # Einfaches Pattern: suche ID und post_name (slug)
            # Format: (ID, post_author, post_date, ..., post_name, ...)
            id_match = re.search(r'INSERT INTO `as_posts` VALUES \((\d+)', line)
            if id_match:
                post_id = id_match.group(1)

                # Suche post_name (Slug) - nach 5. Komma ungefähr
                # Einfacher: suche Pattern mit publish und dann slug
                slug_match = re.search(r",'([a-z0-9-]+)',\d+,'(post|avada_portfolio)'", line)
                if slug_match:
                    slug = slug_match.group(1)
                    post_type = slug_match.group(2)
                    posts[post_id] = {"slug": slug, "type": post_type}

    print(f"✓ {len(posts)} posts/portfolios gefunden")
    return posts

def convert_to_webp_path(original_path):
    """Konvertiert WordPress Pfad zu WebP Pfad"""
    # Beispiel: 2023/04/file.png -> file.webp
    filename = Path(original_path).stem
    webp_name = f"{filename}.webp"

    # Prüfe ob File existiert
    webp_path = UPLOADS_DIR / webp_name
    if webp_path.exists():
        return f"/uploads/{webp_name}"

    # Alternative: mit Datum prefix
    date_prefix = Path(original_path).parts[0] if '/' in original_path else None
    if date_prefix:
        alt_name = f"{date_prefix.replace('/', '-')}-{filename}.webp"
        alt_path = UPLOADS_DIR / alt_name
        if alt_path.exists():
            return f"/uploads/{alt_name}"

    return None

def main():
    print("🔍 Lese WordPress SQL Dump...")
    sql_content = SQL_FILE.read_text(encoding='utf-8', errors='ignore')

    print("\n📊 Extrahiere Daten...")
    thumbnail_map = extract_thumbnail_mappings(sql_content)
    attachment_files = extract_attachment_files(sql_content)
    post_slugs = extract_post_slugs(sql_content)

    print("\n🔗 Erstelle Zuordnungen...")
    results = {
        "articles": [],
        "portfolios": [],
        "unmapped": []
    }

    for post_id, attachment_id in thumbnail_map.items():
        if post_id not in post_slugs:
            continue

        post_info = post_slugs[post_id]
        slug = post_info["slug"]
        post_type = post_info["type"]

        # Hole Dateipfad
        if attachment_id not in attachment_files:
            results["unmapped"].append({
                "post_id": post_id,
                "slug": slug,
                "reason": f"Attachment {attachment_id} nicht gefunden"
            })
            continue

        original_path = attachment_files[attachment_id]
        webp_path = convert_to_webp_path(original_path)

        if not webp_path:
            results["unmapped"].append({
                "post_id": post_id,
                "slug": slug,
                "original": original_path,
                "reason": "Keine WebP-Datei gefunden"
            })
            continue

        entry = {
            "post_id": post_id,
            "slug": slug,
            "attachment_id": attachment_id,
            "original_path": original_path,
            "webp_path": webp_path
        }

        if post_type == "avada_portfolio":
            results["portfolios"].append(entry)
        else:
            results["articles"].append(entry)

    print(f"\n✅ Erfolgreich zugeordnet:")
    print(f"   - {len(results['articles'])} Artikel")
    print(f"   - {len(results['portfolios'])} Portfolio Items")
    print(f"   - {len(results['unmapped'])} nicht zuordenbar")

    # Speichere Ergebnis
    OUTPUT_FILE.write_text(json.dumps(results, indent=2, ensure_ascii=False))
    print(f"\n💾 Gespeichert: {OUTPUT_FILE}")

    # Zeige Beispiele
    if results["articles"]:
        print(f"\n📰 Beispiel Artikel:")
        for article in results["articles"][:3]:
            print(f"   {article['slug']} -> {article['webp_path']}")

    if results["portfolios"]:
        print(f"\n🎨 Beispiel Portfolio:")
        for portfolio in results["portfolios"][:3]:
            print(f"   {portfolio['slug']} -> {portfolio['webp_path']}")

if __name__ == "__main__":
    main()
