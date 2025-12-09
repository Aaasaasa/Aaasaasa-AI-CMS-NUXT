#!/bin/bash

# Media cleanup script
# Creates 3 size variants and removes unused files

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

UPLOADS_DIR="./public/uploads"
DB_URL="${CMS_DATABASE_URL:-$DATABASE_URL}"

echo -e "${GREEN}🧹 Starting media cleanup...${NC}"

# Check dependencies
if ! command -v sqlite3 &> /dev/null; then
    echo -e "${RED}❌ Error: sqlite3 is not installed${NC}"
    echo "Install with: sudo apt install sqlite3"
    exit 1
fi

if ! command -v convert &> /dev/null; then
    echo -e "${RED}❌ Error: ImageMagick is not installed${NC}"
    echo "Install with: sudo apt install imagemagick"
    exit 1
fi

# Get referenced images from database
echo -e "${BLUE}🔍 Getting referenced images from database...${NC}"

# Get database path from URL
DB_FILE=$(echo "$DB_URL" | sed 's|^file:||')

# Create temporary SQL file for SQLite
cat > /tmp/get_images.sql << 'EOF'
-- Get featured images from metas
SELECT DISTINCT
  CASE
    -- Handle direct string paths
    WHEN value LIKE '"/uploads/%' THEN trim(value, '"')
    -- Handle JSON objects with featured_image property
    WHEN value LIKE '%"featured_image"%' THEN
      trim(json_extract(value, '$.featured_image'), '"')
    -- Handle other formats
    ELSE value
  END as image_path
FROM metas
WHERE key = 'featured_image'
  AND value IS NOT NULL
  AND (
    value LIKE '%/uploads/%'
  )

UNION

-- Get images from content (simple pattern matching for SQLite)
SELECT DISTINCT
  substr(content,
    instr(content, '/uploads/'),
    instr(substr(content, instr(content, '/uploads/')), ' ') - 1
  ) as image_path
FROM translations
WHERE content IS NOT NULL
  AND content LIKE '%/uploads/%';
EOF

# Execute query and get image paths
referenced_images=$(sqlite3 "$DB_FILE" < /tmp/get_images.sql | grep -v '^$' | sed 's/^ *//' | sed 's/ *$//' | sort | uniq)
rm -f /tmp/get_images.sql

# Count referenced images
image_count=$(echo "$referenced_images" | wc -l)
echo -e "${GREEN}✅ Found $image_count referenced images${NC}"

# Create size variants for each referenced image
echo -e "${BLUE}🖼️  Creating size variants...${NC}"

created_variants=0

while IFS= read -r image_path; do
    if [ -n "$image_path" ] && [ "$image_path" != "null" ]; then
        # Remove /uploads/ prefix if present
        clean_path=$(echo "$image_path" | sed 's|^/uploads/||')
        full_path="$UPLOADS_DIR/$clean_path"

        if [ -f "$full_path" ]; then
            # Get directory and filename without extension
            dir=$(dirname "$full_path")
            filename=$(basename "$clean_path" | cut -d. -f1)

            # Create variants: thumbnail (300x300), medium (768x768), large (1200x1200)
            sizes=("thumbnail:300x300" "medium:768x768" "large:1200x1200")

            for size_info in "${sizes[@]}"; do
                size_name=$(echo "$size_info" | cut -d: -f1)
                dimensions=$(echo "$size_info" | cut -d: -f2)

                variant_path="$dir/${filename}-${size_name}.webp"

                # Create variant if it doesn't exist
                if [ ! -f "$variant_path" ]; then
                    if convert "$full_path" -resize "${dimensions}^" -gravity center -extent "$dimensions" -quality 85 "$variant_path" 2>/dev/null; then
                        echo -e "${GREEN}✅ Created $size_name: $(basename "$variant_path")${NC}"
                        ((created_variants++))
                    else
                        echo -e "${YELLOW}⚠️  Failed to create $size_name for: $(basename "$full_path")${NC}"
                    fi
                fi
            done
        else
            echo -e "${YELLOW}⚠️  Referenced image not found: $clean_path${NC}"
        fi
    fi
done <<< "$referenced_images"

# Build list of files to keep (referenced images + their variants)
keep_files_temp="/tmp/keep_files.txt"
: > "$keep_files_temp"

while IFS= read -r image_path; do
    if [ -n "$image_path" ] && [ "$image_path" != "null" ]; then
        # Remove /uploads/ prefix
        clean_path=$(echo "$image_path" | sed 's|^/uploads/||')
        echo "$clean_path" >> "$keep_files_temp"

        # Add variants
        dir=$(dirname "$clean_path")
        filename=$(basename "$clean_path" | cut -d. -f1)

        echo "$dir/${filename}-thumbnail.webp" >> "$keep_files_temp"
        echo "$dir/${filename}-medium.webp" >> "$keep_files_temp"
        echo "$dir/${filename}-large.webp" >> "$keep_files_temp"
    fi
done <<< "$referenced_images"

# Find all image files in uploads
echo -e "${BLUE}📁 Scanning uploads directory...${NC}"
all_files_temp="/tmp/all_files.txt"
find "$UPLOADS_DIR" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.gif" -o -iname "*.tiff" -o -iname "*.tif" \) | sed "s|$UPLOADS_DIR/||" > "$all_files_temp"

total_files=$(wc -l < "$all_files_temp")
echo -e "${BLUE}📊 Found $total_files total image files${NC}"

# Find files to delete (not in keep list)
files_to_delete_temp="/tmp/files_to_delete.txt"
comm -23 <(sort "$all_files_temp") <(sort "$keep_files_temp") > "$files_to_delete_temp"

files_to_delete_count=$(wc -l < "$files_to_delete_temp")
files_to_keep_count=$((total_files - files_to_delete_count))

echo ""
echo -e "${YELLOW}📊 Cleanup Summary:${NC}"
echo "  Referenced images: $image_count"
echo "  Created variants: $created_variants"
echo "  Total files: $total_files"
echo "  Files to keep: $files_to_keep_count"
echo "  Files to delete: $files_to_delete_count"

# Delete unused files
if [ $files_to_delete_count -gt 0 ]; then
    echo ""
    echo -e "${YELLOW}🗑️  Deleting unused files...${NC}"

    deleted_count=0
    deleted_size=0

    while IFS= read -r file; do
        if [ -n "$file" ]; then
            file_path="$UPLOADS_DIR/$file"
            if [ -f "$file_path" ]; then
                file_size=$(stat -f%z "$file_path" 2>/dev/null || stat -c%s "$file_path")
                deleted_size=$((deleted_size + file_size))

                if rm "$file_path"; then
                    ((deleted_count++))
                    if [ $deleted_count -le 10 ]; then
                        echo -e "${RED}🗑️  Deleted: $file${NC}"
                    elif [ $deleted_count -eq 11 ]; then
                        echo -e "${YELLOW}   ... and $((files_to_delete_count - 10)) more files${NC}"
                    fi
                fi
            fi
        fi
    done < "$files_to_delete_temp"

    saved_mb=$((deleted_size / 1024 / 1024))
    echo ""
    echo -e "${GREEN}✨ Cleanup completed!${NC}"
    echo -e "${GREEN}   Deleted $deleted_count unused files${NC}"
    echo -e "${GREEN}   Saved ${saved_mb}MB of disk space${NC}"
else
    echo -e "${GREEN}✨ No unused files found - uploads directory is clean!${NC}"
fi

# Cleanup temp files
rm -f "$keep_files_temp" "$all_files_temp" "$files_to_delete_temp"

echo -e "${GREEN}🎉 Media cleanup finished!${NC}"
