#!/usr/bin/env bun

/**
 * Reset and rebuild media database
 *
 * This script:
 * 1. Clears cms_media and cms_media_sizes tables
 * 2. Scans uploads directory for WebP files
 * 3. Rebuilds media database with proper entries
 * 4. Links size variants correctly
 */

import { PrismaClient } from '@prisma/client'
import { readdir, stat } from 'fs/promises'
import { join, dirname, basename, extname } from 'path'
import { existsSync } from 'fs'

// Initialize Prisma
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.CMS_DATABASE_URL || process.env.DATABASE_URL
    }
  }
})

const UPLOADS_DIR = './public/uploads'

interface MediaFile {
  filePath: string
  filename: string
  relativePath: string
  isVariant: boolean
  variantType?: string
  baseFilename?: string
}

async function resetMediaDatabase(): Promise<void> {
  try {
    // 1. Clear existing media tables
    await prisma.cms_media_sizes.deleteMany()
    await prisma.cms_media.deleteMany()

    // 2. Scan uploads directory
    const mediaFiles = await scanMediaFiles()

    // 3. Group files by base name
    const fileGroups = groupFilesByBase(mediaFiles)

    // 4. Insert media records
    let mediaCount = 0
    let sizeCount = 0

    for (const [baseFilename, files] of Object.entries(fileGroups)) {
      const originalFile = files.find((f) => !f.isVariant)
      if (!originalFile) continue

      // Get file stats
      const fullPath = join(UPLOADS_DIR, originalFile.relativePath)
      const stats = await stat(fullPath)

      // Create media record
      const mediaRecord = await prisma.cms_media.create({
        data: {
          filename: originalFile.filename,
          file_path: `/${originalFile.relativePath}`,
          mime_type: 'image/webp',
          file_size: Number(stats.size),
          width: null, // Will be populated if we add image dimension detection
          height: null,
          alt_text: '',
          wp_attachment_id: null, // No WordPress ID for new files
          created_at: new Date(),
          updated_at: new Date()
        }
      })

      mediaCount++

      // Create size variant records
      const variants = files.filter((f) => f.isVariant)
      for (const variant of variants) {
        const variantFullPath = join(UPLOADS_DIR, variant.relativePath)
        if (existsSync(variantFullPath)) {
          const variantStats = await stat(variantFullPath)

          await prisma.cms_media_sizes.create({
            data: {
              media_id: mediaRecord.id,
              size_name: variant.variantType!,
              file_path: `/${variant.relativePath}`,
              width: getSizeWidth(variant.variantType!),
              height: getSizeHeight(variant.variantType!),
              file_size: Number(variantStats.size)
            }
          })

          sizeCount++
        }
      }
    }

    // eslint-disable-next-line no-console
    console.log(`✅ Media database reset completed!`)
    // eslint-disable-next-line no-console
    console.log(`   Created ${mediaCount} media records`)
    // eslint-disable-next-line no-console
    console.log(`   Created ${sizeCount} size variant records`)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('❌ Error resetting media database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

async function scanMediaFiles(): Promise<MediaFile[]> {
  const files: MediaFile[] = []

  async function scanDirectory(dir: string, relativePath = ''): Promise<void> {
    const entries = await readdir(dir)

    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const relativeFilePath = relativePath ? join(relativePath, entry) : entry

      const stats = await stat(fullPath)

      if (stats.isDirectory()) {
        await scanDirectory(fullPath, relativeFilePath)
      } else if (stats.isFile() && /\.webp$/i.test(entry)) {
        // Check if this is a size variant
        const isVariant = /-(?:thumbnail|medium|large)\.webp$/i.test(entry)
        let variantType: string | undefined
        let baseFilename: string | undefined

        if (isVariant) {
          const match = entry.match(/(.*)-(?:thumbnail|medium|large)\.webp$/i)
          if (match) {
            baseFilename = match[1]
            variantType = entry.replace(`${baseFilename}-`, '').replace('.webp', '')
          }
        }

        files.push({
          filePath: fullPath,
          filename: entry,
          relativePath: relativeFilePath.replace(/\\/g, '/'), // Normalize path separators
          isVariant,
          variantType,
          baseFilename
        })
      }
    }
  }

  if (existsSync(UPLOADS_DIR)) {
    await scanDirectory(UPLOADS_DIR)
  }

  return files
}

function groupFilesByBase(files: MediaFile[]): Record<string, MediaFile[]> {
  const groups: Record<string, MediaFile[]> = {}

  for (const file of files) {
    let groupKey: string

    if (file.isVariant && file.baseFilename) {
      // Use the base filename for variants
      groupKey = `${dirname(file.relativePath)}/${file.baseFilename}`
    } else {
      // Use filename without extension for originals
      groupKey = `${dirname(file.relativePath)}/${basename(file.filename, extname(file.filename))}`
    }

    // Normalize the group key
    groupKey = groupKey.replace(/\\/g, '/').replace(/^\.\//, '')

    if (!groups[groupKey]) {
      groups[groupKey] = []
    }
    groups[groupKey].push(file)
  }

  return groups
}

function getSizeWidth(sizeType: string): number {
  switch (sizeType.toLowerCase()) {
    case 'thumbnail':
      return 300
    case 'medium':
      return 768
    case 'large':
      return 1200
    default:
      return 0
  }
}

function getSizeHeight(sizeType: string): number {
  switch (sizeType.toLowerCase()) {
    case 'thumbnail':
      return 300
    case 'medium':
      return 768
    case 'large':
      return 1200
    default:
      return 0
  }
}

// Run the reset
resetMediaDatabase().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error)
  process.exit(1)
})
