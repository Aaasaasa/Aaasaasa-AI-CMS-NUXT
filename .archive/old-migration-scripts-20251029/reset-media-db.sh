#!/bin/bash

# Simple media database reset for SQLite
# This script will create media entries for all the cleaned WebP files

set -e

UPLOADS_DIR="./public/uploads"
DB_FILE="dev.db"

echo "🗃️  Resetting media database..."

# Check if database exists
if [ ! -f "$DB_FILE" ]; then
    echo "❌ Database file $DB_FILE not found"
    exit 1
fi

echo "🧹 Clearing existing media tables..."

# Clear existing media tables (assuming they exist)
sqlite3 "$DB_FILE" "DELETE FROM cms_media_sizes;" 2>/dev/null || echo "cms_media_sizes table doesn't exist"
sqlite3 "$DB_FILE" "DELETE FROM cms_media;" 2>/dev/null || echo "cms_media table doesn't exist"

# Create tables if they don't exist
echo "📋 Creating media tables if needed..."

sqlite3 "$DB_FILE" << 'EOF'
CREATE TABLE IF NOT EXISTS cms_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    mime_type TEXT DEFAULT 'image/webp',
    file_size INTEGER,
    width INTEGER,
    height INTEGER,
    alt_text TEXT DEFAULT '',
    wp_attachment_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS cms_media_sizes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_id INTEGER NOT NULL,
    size_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    FOREIGN KEY (media_id) REFERENCES cms_media(id) ON DELETE CASCADE
);
EOF

echo "📁 Scanning uploads directory for original WebP files..."

media_count=0
size_count=0

# Find all original WebP files (not size variants)
while IFS= read -r -d '' file; do

    # Get relative path from uploads
    relative_path=${file#$UPLOADS_DIR/}
    filename=$(basename "$file")

    # Get file size
    file_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file")

    # Insert media record
    media_id=$(sqlite3 "$DB_FILE" "
        INSERT INTO cms_media (filename, file_path, mime_type, file_size, created_at, updated_at)
        VALUES ('$filename', '/$relative_path', 'image/webp', $file_size, datetime('now'), datetime('now'));
        SELECT last_insert_rowid();
    ")

    echo "✅ Added media: $filename (ID: $media_id)"
    ((media_count++))

    # Check for size variants and add them
    dir=$(dirname "$file")
    base_name=$(basename "$file" .webp)

    # Thumbnail variant
    thumbnail_file="$dir/${base_name}-thumbnail.webp"
    if [ -f "$thumbnail_file" ]; then
        thumbnail_relative=${thumbnail_file#$UPLOADS_DIR/}
        thumbnail_size=$(stat -c%s "$thumbnail_file" 2>/dev/null || stat -f%z "$thumbnail_file")

        sqlite3 "$DB_FILE" "
            INSERT INTO cms_media_sizes (media_id, size_name, file_path, width, height, file_size)
            VALUES ($media_id, 'thumbnail', '/$thumbnail_relative', 300, 300, $thumbnail_size);
        "
        echo "  📎 Added thumbnail variant"
        ((size_count++))
    fi

    # Medium variant
    medium_file="$dir/${base_name}-medium.webp"
    if [ -f "$medium_file" ]; then
        medium_relative=${medium_file#$UPLOADS_DIR/}
        medium_size=$(stat -c%s "$medium_file" 2>/dev/null || stat -f%z "$medium_file")

        sqlite3 "$DB_FILE" "
            INSERT INTO cms_media_sizes (media_id, size_name, file_path, width, height, file_size)
            VALUES ($media_id, 'medium', '/$medium_relative', 768, 768, $medium_size);
        "
        echo "  📎 Added medium variant"
        ((size_count++))
    fi

    # Large variant
    large_file="$dir/${base_name}-large.webp"
    if [ -f "$large_file" ]; then
        large_relative=${large_file#$UPLOADS_DIR/}
        large_size=$(stat -c%s "$large_file" 2>/dev/null || stat -f%z "$large_file")

        sqlite3 "$DB_FILE" "
            INSERT INTO cms_media_sizes (media_id, size_name, file_path, width, height, file_size)
            VALUES ($media_id, 'large', '/$large_relative', 1200, 1200, $large_size);
        "
        echo "  📎 Added large variant"
        ((size_count++))
    fi
done < <(find "$UPLOADS_DIR" -name "*.webp" -type f -print0 | grep -zv "\-thumbnail\.webp$" | grep -zv "\-medium\.webp$" | grep -zv "\-large\.webp$")

echo ""
echo "✨ Media database reset completed!"
echo "📊 Created $media_count media records"
echo "📊 Created $size_count size variant records"

# Show some sample data
echo ""
echo "📋 Sample media entries:"
sqlite3 "$DB_FILE" "SELECT id, filename, file_path FROM cms_media LIMIT 5;" -header -column

echo ""
echo "📋 Sample size variants:"
sqlite3 "$DB_FILE" "SELECT cms_media_sizes.id, cms_media.filename, cms_media_sizes.size_name, cms_media_sizes.file_path FROM cms_media_sizes JOIN cms_media ON cms_media_sizes.media_id = cms_media.id LIMIT 5;" -header -column
