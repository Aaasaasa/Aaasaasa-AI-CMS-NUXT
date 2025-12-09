-- Add Media table for WordPress attachment management
-- This will replace the direct path storage in meta tables

-- Main Media/Attachments table
CREATE TABLE cms_media (
  id SERIAL PRIMARY KEY,
  wp_attachment_id INTEGER UNIQUE, -- Original WordPress attachment ID
  filename VARCHAR(255) NOT NULL, -- image.webp
  original_filename VARCHAR(255), -- Original uploaded name
  mime_type VARCHAR(100) NOT NULL, -- image/webp, image/jpeg, etc.
  file_size INTEGER, -- Size in bytes
  upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

-- File paths (without public prefix)
file_path VARCHAR(500) NOT NULL, -- /uploads/2024/05/image.webp
base_path VARCHAR(500) NOT NULL, -- /uploads/2024/05/

-- Image specific metadata
width INTEGER, height INTEGER, alt_text TEXT,

-- WordPress metadata
wp_meta JSONB DEFAULT '{}', -- Original WordPress attachment meta

-- Status
is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Media sizes table (thumbnails, medium, large, etc.)
CREATE TABLE cms_media_sizes (
    id SERIAL PRIMARY KEY,
    media_id INTEGER NOT NULL REFERENCES cms_media (id) ON DELETE CASCADE,
    size_name VARCHAR(50) NOT NULL, -- 'thumbnail', 'medium', 'large', 'original'
    file_path VARCHAR(500) NOT NULL, -- /uploads/2024/05/image-150x150.webp
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups
CREATE INDEX idx_media_wp_attachment_id ON cms_media (wp_attachment_id);

CREATE INDEX idx_media_filename ON cms_media (filename);

CREATE INDEX idx_media_file_path ON cms_media (file_path);

CREATE INDEX idx_media_sizes_media_id ON cms_media_sizes (media_id);

CREATE INDEX idx_media_sizes_size_name ON cms_media_sizes (size_name);

CREATE INDEX idx_media_mime_type ON cms_media (mime_type);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_media_updated_at
  BEFORE UPDATE ON cms_media
  FOR EACH ROW
  EXECUTE FUNCTION update_media_updated_at();

-- Comments for documentation
COMMENT ON
TABLE cms_media IS 'WordPress-style media/attachment management';

COMMENT ON COLUMN cms_media.wp_attachment_id IS 'Original WordPress attachment ID for migration';

COMMENT ON COLUMN cms_media.file_path IS 'Full file path starting with /uploads/';

COMMENT ON COLUMN cms_media.wp_meta IS 'Original WordPress attachment metadata as JSON';

COMMENT ON
TABLE cms_media_sizes IS 'Different sizes/thumbnails for each media item';