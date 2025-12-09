#!/bin/bash

# Simple media database reset - create entries for cleaned WebP files
set -e

UPLOADS_DIR="./public/uploads"
DB_FILE="dev.db"

echo "🗃️  Resetting media database..."

# Create tables
sqlite3 "$DB_FILE" << 'EOF'
DROP TABLE IF EXISTS cms_media_sizes;
DROP TABLE IF EXISTS cms_media;

CREATE TABLE cms_media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    mime_type TEXT DEFAULT 'image/webp',
    file_size INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE cms_media_sizes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    media_id INTEGER NOT NULL,
    size_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    FOREIGN KEY (media_id) REFERENCES cms_media(id)
);
EOF

echo "📁 Processing WebP files..."

# Get list of original files (excluding variants)
original_files=$(find "$UPLOADS_DIR" -name "*.webp" -type f | grep -v -e "-thumbnail\.webp$" -e "-medium\.webp$" -e "-large\.webp$")

media_count=0
size_count=0

for file in $original_files; do
    echo "Processing: $(basename "$file")"

    # Get file info
    relative_path=${file#$UPLOADS_DIR/}
    filename=$(basename "$file")
    file_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo "0")

    # Insert media record and get ID
    media_id=$(sqlite3 "$DB_FILE" "
        INSERT INTO cms_media (filename, file_path, mime_type, file_size)
        VALUES ('$filename', '/$relative_path', 'image/webp', $file_size);
        SELECT last_insert_rowid();
    ")

    ((media_count++))

    # Process variants
    dir=$(dirname "$file")
    base_name=$(basename "$file" .webp)

    # Thumbnail
    thumbnail_file="$dir/${base_name}-thumbnail.webp"
    if [ -f "$thumbnail_file" ]; then
        thumbnail_relative=${thumbnail_file#$UPLOADS_DIR/}
        thumbnail_size=$(stat -c%s "$thumbnail_file" 2>/dev/null || stat -f%z "$thumbnail_file" 2>/dev/null || echo "0")

        sqlite3 "$DB_FILE" "
            INSERT INTO cms_media_sizes (media_id, size_name, file_path, width, height, file_size)
            VALUES ($media_id, 'thumbnail', '/$thumbnail_relative', 300, 300, $thumbnail_size);
        "
        ((size_count++))
    fi

    # Medium
    medium_file="$dir/${base_name}-medium.webp"
    if [ -f "$medium_file" ]; then
        medium_relative=${medium_file#$UPLOADS_DIR/}
        medium_size=$(stat -c%s "$medium_file" 2>/dev/null || stat -f%z "$medium_file" 2>/dev/null || echo "0")

        sqlite3 "$DB_FILE" "
            INSERT INTO cms_media_sizes (media_id, size_name, file_path, width, height, file_size)
            VALUES ($media_id, 'medium', '/$medium_relative', 768, 768, $medium_size);
        "
        ((size_count++))
    fi

    # Large
    large_file="$dir/${base_name}-large.webp"
    if [ -f "$large_file" ]; then
        large_relative=${large_file#$UPLOADS_DIR/}
        large_size=$(stat -c%s "$large_file" 2>/dev/null || stat -f%z "$large_file" 2>/dev/null || echo "0")

        sqlite3 "$DB_FILE" "
            INSERT INTO cms_media_sizes (media_id, size_name, file_path, width, height, file_size)
            VALUES ($media_id, 'large', '/$large_relative', 1200, 1200, $large_size);
        "
        ((size_count++))
    fi
done

echo ""
echo "✨ Media database reset completed!"
echo "📊 Created $media_count media records"
echo "📊 Created $size_count size variant records"

# Show sample data
echo ""
echo "📋 Sample media entries:"
sqlite3 "$DB_FILE" "SELECT id, filename, file_path FROM cms_media LIMIT 3;" -header -column 2>/dev/null || echo "No data to display"
