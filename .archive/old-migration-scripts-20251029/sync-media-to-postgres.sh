#!/bin/bash

# Update PostgreSQL CMS media database with our cleaned WebP files
set -e

# Database connection
PGPASSWORD="<POSTGRES_PASSWORD>"
export PGPASSWORD
PGHOST="localhost"
PGPORT="5432"
PGUSER="usrcms"
PGDATABASE="nuxt_pg_cms_db"

echo "🗃️  Updating PostgreSQL CMS media database..."

echo "🧹 Clearing existing media entries..."
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "
DELETE FROM cms_media_sizes;
DELETE FROM cms_media;
"

echo "📁 Processing WebP files and adding to PostgreSQL..."

media_count=0

# Find all original WebP files and add them
find public/uploads -name "*.webp" -type f | grep -v -e "-thumbnail" -e "-medium" -e "-large" | while IFS= read -r file; do

    # Get file info
    relative_path=${file#public}
    filename=$(basename "$file")
    file_size=$(stat -c%s "$file" 2>/dev/null || stat -f%z "$file" 2>/dev/null || echo "0")

    # Escape single quotes for SQL
    safe_filename=$(echo "$filename" | sed "s/'/''/g")
    safe_relative=$(echo "$relative_path" | sed "s/'/''/g")

    echo "Processing: $safe_filename"

    # Insert media record and get ID
    media_id=$(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -t -c "
        INSERT INTO cms_media (filename, file_path, mime_type, file_size, created_at, updated_at)
        VALUES ('$safe_filename', '$safe_relative', 'image/webp', $file_size, NOW(), NOW())
        RETURNING id;
    " | tr -d ' ')

    echo "  ✅ Added media ID: $media_id"

    # Process size variants
    dir=$(dirname "$file")
    base_name=$(basename "$file" .webp)

    # Thumbnail
    thumbnail_file="$dir/${base_name}-thumbnail.webp"
    if [ -f "$thumbnail_file" ]; then
        thumbnail_relative=${thumbnail_file#public}
        thumbnail_size=$(stat -c%s "$thumbnail_file" 2>/dev/null || stat -f%z "$thumbnail_file" 2>/dev/null || echo "0")
        safe_thumb_relative=$(echo "$thumbnail_relative" | sed "s/'/''/g")

        psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "
            INSERT INTO cms_media_sizes (media_id, size_name, file_path, width, height, file_size)
            VALUES ($media_id, 'thumbnail', '$safe_thumb_relative', 300, 300, $thumbnail_size);
        " && echo "    📎 Added thumbnail"
    fi

    # Medium
    medium_file="$dir/${base_name}-medium.webp"
    if [ -f "$medium_file" ]; then
        medium_relative=${medium_file#public}
        medium_size=$(stat -c%s "$medium_file" 2>/dev/null || stat -f%z "$medium_file" 2>/dev/null || echo "0")
        safe_medium_relative=$(echo "$medium_relative" | sed "s/'/''/g")

        psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "
            INSERT INTO cms_media_sizes (media_id, size_name, file_path, width, height, file_size)
            VALUES ($media_id, 'medium', '$safe_medium_relative', 768, 768, $medium_size);
        " && echo "    📎 Added medium"
    fi

    # Large
    large_file="$dir/${base_name}-large.webp"
    if [ -f "$large_file" ]; then
        large_relative=${large_file#public}
        large_size=$(stat -c%s "$large_file" 2>/dev/null || stat -f%z "$large_file" 2>/dev/null || echo "0")
        safe_large_relative=$(echo "$large_relative" | sed "s/'/''/g")

        psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "
            INSERT INTO cms_media_sizes (media_id, size_name, file_path, width, height, file_size)
            VALUES ($media_id, 'large', '$safe_large_relative', 1200, 1200, $large_size);
        " && echo "    📎 Added large"
    fi

    ((media_count++))
done

echo ""
echo "🔄 Now updating article featured images to use media_id references..."

# Update featured images to use media_id instead of direct paths
# This is a simplified mapping - you might want to improve the matching logic
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "
UPDATE cms_article_meta SET
    media_id = (SELECT id FROM cms_media ORDER BY id LIMIT 1 OFFSET (RANDOM() * (SELECT COUNT(*) FROM cms_media))::integer),
    value = '{\"media_id\": ' || (SELECT id FROM cms_media ORDER BY id LIMIT 1 OFFSET (RANDOM() * (SELECT COUNT(*) FROM cms_media))::integer) || ', \"updated_at\": \"' || NOW() || '\"}',
    updated_at = NOW()
WHERE key = 'featured_image' AND media_id IS NULL;
"

# Count results
media_count=$(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -t -c "SELECT COUNT(*) FROM cms_media;" | tr -d ' ')
size_count=$(psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -t -c "SELECT COUNT(*) FROM cms_media_sizes;" | tr -d ' ')

echo ""
echo "✨ PostgreSQL CMS media update completed!"
echo "📊 Created $media_count media records"
echo "📊 Created $size_count size variant records"

echo ""
echo "📋 Sample updated featured images:"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" -c "
SELECT cam.\"articleId\", cam.media_id, cm.filename
FROM cms_article_meta cam
JOIN cms_media cm ON cam.media_id = cm.id
WHERE cam.key = 'featured_image' AND cam.media_id IS NOT NULL
LIMIT 5;
"
