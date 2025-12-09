#!/bin/bash

# Simple media cleanup - keep only 3 sizes: original, thumbnail (300x300), medium (768x768), large (1200x1200)
# Remove all other WordPress generated sizes

set -e

UPLOADS_DIR="./public/uploads"

echo "🧹 Starting WordPress media cleanup..."
echo "Keeping only: original, -thumbnail, -medium, -large variants"
echo ""

# Count files before cleanup
total_before=$(find "$UPLOADS_DIR" -name "*.webp" -type f | wc -l)
echo "📊 Files before cleanup: $total_before"

# Delete files with WordPress size patterns we don't want
# Keep: original files (no size suffix), -thumbnail.webp, -medium.webp, -large.webp
# Delete: all other size variants like -150x150.webp, -300x214.webp, etc.

deleted_count=0

echo "🗑️  Removing unwanted size variants..."

# Find and delete files that match WordPress size patterns but are NOT our 3 wanted sizes
find "$UPLOADS_DIR" -name "*.webp" -type f | while read -r file; do
    filename=$(basename "$file")

    # Skip if it's one of our wanted variants or original
    if [[ "$filename" =~ -thumbnail\.webp$ ]] || \
       [[ "$filename" =~ -medium\.webp$ ]] || \
       [[ "$filename" =~ -large\.webp$ ]] || \
       [[ ! "$filename" =~ -[0-9]+x[0-9]+.*\.webp$ ]]; then
        continue  # Keep this file
    fi

    # Delete WordPress generated size variants we don't want
    if [[ "$filename" =~ -[0-9]+x[0-9]+ ]] || \
       [[ "$filename" =~ @2x\.webp$ ]] || \
       [[ "$filename" =~ -[0-9]+x[0-9]+@2x\.webp$ ]]; then
        echo "🗑️  Deleting: $filename"
        rm "$file"
        ((deleted_count++)) || true
    fi
done

# Count files after cleanup
total_after=$(find "$UPLOADS_DIR" -name "*.webp" -type f | wc -l)
saved_files=$((total_before - total_after))

echo ""
echo "✨ Cleanup completed!"
echo "📊 Files before: $total_before"
echo "📊 Files after: $total_after"
echo "📊 Files removed: $saved_files"
echo ""

# Now create the 3 standard sizes for original files that don't have them
echo "🖼️  Creating missing size variants..."

created_count=0

find "$UPLOADS_DIR" -name "*.webp" -type f | while read -r file; do
    filename=$(basename "$file")
    dir=$(dirname "$file")

    # Skip if this is already a size variant
    if [[ "$filename" =~ -thumbnail\.webp$ ]] || \
       [[ "$filename" =~ -medium\.webp$ ]] || \
       [[ "$filename" =~ -large\.webp$ ]] || \
       [[ "$filename" =~ -[0-9]+x[0-9]+ ]]; then
        continue
    fi

    # This should be an original file, create variants
    base_name="${filename%.*}"  # Remove .webp extension

    # Create thumbnail (300x300)
    thumbnail_path="$dir/${base_name}-thumbnail.webp"
    if [[ ! -f "$thumbnail_path" ]] && command -v convert >/dev/null 2>&1; then
        if convert "$file" -resize 300x300^ -gravity center -extent 300x300 -quality 85 "$thumbnail_path" 2>/dev/null; then
            echo "✅ Created thumbnail: $(basename "$thumbnail_path")"
            ((created_count++)) || true
        fi
    fi

    # Create medium (768x768)
    medium_path="$dir/${base_name}-medium.webp"
    if [[ ! -f "$medium_path" ]] && command -v convert >/dev/null 2>&1; then
        if convert "$file" -resize 768x768^ -gravity center -extent 768x768 -quality 85 "$medium_path" 2>/dev/null; then
            echo "✅ Created medium: $(basename "$medium_path")"
            ((created_count++)) || true
        fi
    fi

    # Create large (1200x1200)
    large_path="$dir/${base_name}-large.webp"
    if [[ ! -f "$large_path" ]] && command -v convert >/dev/null 2>&1; then
        if convert "$file" -resize 1200x1200^ -gravity center -extent 1200x1200 -quality 85 "$large_path" 2>/dev/null; then
            echo "✅ Created large: $(basename "$large_path")"
            ((created_count++)) || true
        fi
    fi
done

echo ""
echo "📊 Created $created_count new size variants"

# Final count
final_count=$(find "$UPLOADS_DIR" -name "*.webp" -type f | wc -l)
echo "📊 Final file count: $final_count"

echo ""
echo "🎉 WordPress media cleanup finished!"
echo "✨ Now you have only original + 3 size variants (thumbnail, medium, large)"
