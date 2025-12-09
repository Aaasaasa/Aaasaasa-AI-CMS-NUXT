#!/bin/bash

# Image conversion script - Convert all JPG, PNG, TIFF to WebP
# Usage: ./scripts/convert-images-to-webp.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
UPLOADS_DIR="./public/uploads"
QUALITY=85  # WebP quality (1-100, 85 is good balance)
BACKUP_ORIGINALS=true

echo -e "${GREEN}🖼️  Starting image conversion to WebP...${NC}"
echo "Directory: $UPLOADS_DIR"
echo "Quality: $QUALITY"
echo ""

# Check if cwebp is installed
if ! command -v cwebp &> /dev/null; then
    echo -e "${RED}❌ Error: cwebp is not installed${NC}"
    echo "Install with: sudo apt update && sudo apt install webp"
    exit 1
fi

# Statistics
total_files=0
converted_files=0
skipped_files=0
saved_space=0

# Create backup directory if needed
if [ "$BACKUP_ORIGINALS" = true ]; then
    backup_dir="./backups/originals_$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    echo -e "${YELLOW}📁 Backup directory created: $backup_dir${NC}"
fi

# Function to convert a single file
convert_file() {
    local input_file="$1"
    local output_file="${input_file%.*}.webp"

    # Skip if WebP already exists and is newer
    if [[ -f "$output_file" ]] && [[ "$output_file" -nt "$input_file" ]]; then
        echo -e "${YELLOW}⏭️  Skipping (WebP exists): $(basename "$input_file")${NC}"
        ((skipped_files++))
        return
    fi

    # Get original file size
    original_size=$(stat -f%z "$input_file" 2>/dev/null || stat -c%s "$input_file")

    # Convert to WebP
    if cwebp -q "$QUALITY" "$input_file" -o "$output_file" &>/dev/null; then
        # Get new file size
        new_size=$(stat -f%z "$output_file" 2>/dev/null || stat -c%s "$output_file")
        space_saved=$((original_size - new_size))
        saved_space=$((saved_space + space_saved))

        # Format file sizes
        original_kb=$((original_size / 1024))
        new_kb=$((new_size / 1024))

        echo -e "${GREEN}✅ Converted: $(basename "$input_file") (${original_kb}KB → ${new_kb}KB)${NC}"
        ((converted_files++))

        # Backup original if requested
        if [ "$BACKUP_ORIGINALS" = true ]; then
            # Preserve directory structure in backup
            relative_path=$(dirname "${input_file#$UPLOADS_DIR/}")
            backup_target_dir="$backup_dir/$relative_path"
            mkdir -p "$backup_target_dir"
            cp "$input_file" "$backup_target_dir/"
        fi

        # Remove original file after successful conversion
        rm "$input_file"
    else
        echo -e "${RED}❌ Failed to convert: $(basename "$input_file")${NC}"
    fi
}

# Find and convert all image files
echo -e "${YELLOW}🔍 Searching for image files...${NC}"

while IFS= read -r -d '' file; do
    ((total_files++))
    convert_file "$file"
done < <(find "$UPLOADS_DIR" \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.tiff" -o -iname "*.tif" \) -type f -print0)

echo ""
echo -e "${GREEN}📊 Conversion Summary:${NC}"
echo "Total files found: $total_files"
echo "Converted: $converted_files"
echo "Skipped: $skipped_files"

if [ $saved_space -gt 0 ]; then
    saved_mb=$((saved_space / 1024 / 1024))
    echo "Space saved: ${saved_mb}MB"
fi

if [ "$BACKUP_ORIGINALS" = true ]; then
    echo -e "${YELLOW}📁 Original files backed up to: $backup_dir${NC}"
fi

echo -e "${GREEN}✨ Image conversion completed!${NC}"
