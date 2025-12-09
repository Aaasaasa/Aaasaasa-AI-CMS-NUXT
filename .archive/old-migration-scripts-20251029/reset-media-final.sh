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

media_count=0
size_count=0

# Process files with safer handling
find "$UPLOADS_DIR" -name "*.webp" -type f | grep -v -e "-thumbnail\.webp" -e "-medium\.webp" -e "-large\.webp" | while IFS= read -r file; do
    echo "Processing: $(basename "$file")"

    # Get file info
    relative_path=${file#$UPLOADS_DIR/}
    filename=$(basename "$file")
    file_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo "0")

    # Escape single quotes for SQL
    safe_filename=$(echo "$filename" | sed "s/'/''/g")
    safe_relative=$(echo "$relative_path" | sed "s/'/''/g")

    # Insert media record and get ID
    media_id=$(sqlite3 "$DB_FILE" "
        INSERT INTO cms_media (filename, file_path, mime_type, file_size)
        VALUES ('$safe_filename', '/$safe_relative', 'image/webp', $file_size);
        SELECT last_insert_rowid();
    ")

    echo "  ✅ Added media ID: $media_id"

    # Process variants
    dir=$(dirname "$file")
    base_name=$(basename "$file" .webp)

    # Thumbnail
    thumbnail_file="$dir/${base_name}-thumbnail.webp"
    if [ -f "$thumbnail_file" ]; then
        thumbnail_relative=${thumbnail_file#$UPLOADS_DIR/}
        thumbnail_size=$(stat -c%s "$thumbnail_file" 2>/dev/null || stat -f%z "$thumbnail_file" 2>/dev/null || echo "0")
        safe_thumb_relative=$(echo "$thumbnail_relative" | sed "s/'/''/g")

        sqlite3 "$DB_FILE" "
            INSERT INTO cms_media_sizes (media_id, size_name, file_path, width, height, file_size)
            VALUES ($media_id, 'thumbnail', '/$safe_thumb_relative', 300, 300, $thumbnail_size);
        " && echo "    📎 Added thumbnail"
    fi

    # Medium
    medium_file="$dir/${base_name}-medium.webp"
    if [ -f "$medium_file" ]; then
        medium_relative=${medium_file#$UPLOADS_DIR/}
        medium_size=$(stat -c%s "$medium_file" 2>/dev/null || stat -f%z "$medium_file" 2>/dev/null || echo "0")
        safe_medium_relative=$(echo "$medium_relative" | sed "s/'/''/g")

        sqlite3 "$DB_FILE" "
            INSERT INTO cms_media_sizes (media_id, size_name, file_path, width, height, file_size)
            VALUES ($media_id, 'medium', '/$safe_medium_relative', 768, 768, $medium_size);
        " && echo "    📎 Added medium"
    fi

    # Large
    large_file="$dir/${base_name}-large.webp"
    if [ -f "$large_file" ]; then
        large_relative=${large_file#$UPLOADS_DIR/}
        large_size=$(stat -c%s "$large_file" 2>/dev/null || stat -f%z "$large_file" 2>/dev/null || echo "0")
        safe_large_relative=$(echo "$large_relative" | sed "s/'/''/g")

        sqlite3 "$DB_FILE" "
            INSERT INTO cms_media_sizes (media_id, size_name, file_path, width, height, file_size)
            VALUES ($media_id, 'large', '/$safe_large_relative', 1200, 1200, $large_size);
        " && echo "    📎 Added large"
    fi
done

# Count results
media_count=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM cms_media;")
size_count=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM cms_media_sizes;")

echo ""
echo "✨ Media database reset completed!"
echo "📊 Created $media_count media records"
echo "📊 Created $size_count size variant records"

# Show sample data
echo ""
echo "📋 Sample media entries:"
sqlite3 "$DB_FILE" "SELECT id, filename, file_path FROM cms_media LIMIT 3;" -header -column 2>/dev/null || echo "No data to display"
