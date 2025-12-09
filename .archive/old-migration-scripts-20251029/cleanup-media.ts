#!/usr/bin/env bun

/**
 * Clean unused media files script
 *
 * This script:
 * 1. Scans database for all referenced images in metas table
 * 2. Finds all files in uploads directory
 * 3. Creates 3 size variants for each used image:
 *    - thumbnail (300x300)
 * ) *    - medium (768x768)
 *    - large (1200x1200)
 * 4. Removes all unused files
 */

import { PrismaClient } from '@prisma/client'
import { readdir, stat, unlink, mkdir, copyFile } from 'fs/promises'
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
const SIZES = {
  thumbnail: { width: 300, height: 300 },
  medium: { width: 768, height: 768 },
  large: { width: 1200, height: 1200 }
}

interface ReferencedImage {
  path: string
  source: string // 'featured_image' | 'content' etc.
}

// Colors for output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
}

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

/**
 * Extract image paths from database
 */
async function getReferencedImages(): Promise<ReferencedImage[]> {
  const referencedImages: ReferencedImage[] = []

  log('blue', '🔍 Scanning database for referenced images...')

  // 1. Featured images from metas table
  const featuredImages = await prisma.meta.findMany({
    where: { key: 'featured_image' },
    select: { value: true }
  })

  for (const meta of featuredImages) {
    let imagePath: string | null = null

    if (typeof meta.value === 'string') {
      // Direct path
      imagePath = meta.value.replace(/^"(.*)"$/, '$1')
    } else if (typeof meta.value === 'object' && meta.value) {
      // JSON object with featured_image property
      const obj = meta.value as any
      if (obj.featured_image) {
        imagePath = obj.featured_image.replace(/^"(.*)"$/, '$1')
      }
    }

    if (imagePath && imagePath.startsWith('/uploads/')) {
      referencedImages.push({
        path: imagePath.replace('/uploads/', ''),
        source: 'featured_image'
      })
    }
  }

  // 2. Images in content (articles, pages, etc.)
  const contentWithImages = await prisma.translation.findMany({
    select: { content: true }
  })

  const imageRegex = /\/uploads\/[^"\s)]+\.(jpg|jpeg|png|webp|gif)/gi

  for (const content of contentWithImages) {
    if (content.content) {
      const matches = content.content.match(imageRegex)
      if (matches) {
        for (const match of matches) {
          referencedImages.push({
            path: match.replace('/uploads/', ''),
            source: 'content'
          })
        }
      }
    }
  }

  // Remove duplicates
  const uniqueImages = Array.from(new Set(referencedImages.map((img) => img.path))).map(
    (path) => referencedImages.find((img) => img.path === path)!
  )

  log('green', `✅ Found ${uniqueImages.length} referenced images`)
  return uniqueImages
}

/**
 * Get all files in uploads directory
 */
async function getAllUploadFiles(): Promise<string[]> {
  const files: string[] = []

  async function scanDirectory(dir: string, relativePath = ''): Promise<void> {
    const entries = await readdir(dir)

    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const relativeFilePath = relativePath ? join(relativePath, entry) : entry

      const stats = await stat(fullPath)

      if (stats.isDirectory()) {
        await scanDirectory(fullPath, relativeFilePath)
      } else if (stats.isFile() && /\.(jpg|jpeg|png|webp|gif|tiff?)$/i.test(entry)) {
        files.push(relativeFilePath)
      }
    }
  }

  if (existsSync(UPLOADS_DIR)) {
    await scanDirectory(UPLOADS_DIR)
  }

  log('blue', `📁 Found ${files.length} image files in uploads directory`)
  return files
}

/**
 * Create image size variants using ImageMagick
 */
async function createSizeVariants(imagePath: string): Promise<void> {
  const fullPath = join(UPLOADS_DIR, imagePath)
  const dir = dirname(fullPath)
  const name = basename(imagePath, extname(imagePath))
  const ext = '.webp' // Always use WebP for variants

  if (!existsSync(fullPath)) {
    log('yellow', `⚠️  Original not found: ${imagePath}`)
    return
  }

  for (const [sizeName, dimensions] of Object.entries(SIZES)) {
    const variantPath = join(dir, `${name}-${sizeName}${ext}`)

    // Skip if variant already exists
    if (existsSync(variantPath)) {
      continue
    }

    try {
      // Use ImageMagick convert command
      const { exec } = await import('child_process')
      const { promisify } = await import('util')
      const execAsync = promisify(exec)

      const command = `convert "${fullPath}" -resize ${dimensions.width}x${dimensions.height}^ -gravity center -extent ${dimensions.width}x${dimensions.height} -quality 85 "${variantPath}"`

      await execAsync(command)
      log('green', `✅ Created ${sizeName}: ${basename(variantPath)}`)
    } catch (error) {
      log('red', `❌ Failed to create ${sizeName} for ${imagePath}: ${error}`)
    }
  }
}

/**
 * Main cleanup function
 */
async function cleanupMedia(): Promise<void> {
  try {
    log('blue', '🧹 Starting media cleanup...')

    // Get referenced images and all files
    const [referencedImages, allFiles] = await Promise.all([
      getReferencedImages(),
      getAllUploadFiles()
    ])

    // Create set of referenced paths (including variants)
    const keepPaths = new Set<string>()

    for (const image of referencedImages) {
      // Keep original
      keepPaths.add(image.path)

      // Keep size variants
      const dir = dirname(image.path)
      const name = basename(image.path, extname(image.path))

      for (const sizeName of Object.keys(SIZES)) {
        keepPaths.add(join(dir, `${name}-${sizeName}.webp`))
      }

      // Create variants if they don't exist
      await createSizeVariants(image.path)
    }

    // Find files to delete
    const filesToDelete = allFiles.filter((file) => !keepPaths.has(file))

    log('yellow', `📊 Cleanup Summary:`)
    console.log(`  Referenced images: ${referencedImages.length}`)
    console.log(`  Total files found: ${allFiles.length}`)
    console.log(`  Files to keep: ${keepPaths.size}`)
    console.log(`  Files to delete: ${filesToDelete.length}`)

    // Delete unused files
    let deletedCount = 0
    let deletedSize = 0

    for (const file of filesToDelete) {
      const fullPath = join(UPLOADS_DIR, file)

      try {
        const stats = await stat(fullPath)
        deletedSize += stats.size
        await unlink(fullPath)
        deletedCount++

        if (deletedCount <= 10) {
          // Show first 10 deletions
          log('red', `🗑️  Deleted: ${file}`)
        } else if (deletedCount === 11) {
          log('yellow', `   ... and ${filesToDelete.length - 10} more files`)
        }
      } catch (error) {
        log('red', `❌ Failed to delete ${file}: ${error}`)
      }
    }

    const savedMB = Math.round((deletedSize / 1024 / 1024) * 100) / 100
    log('green', `✨ Cleanup completed!`)
    log('green', `   Deleted ${deletedCount} unused files`)
    log('green', `   Saved ${savedMB}MB of disk space`)
  } catch (error) {
    log('red', `❌ Error during cleanup: ${error}`)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the cleanup
cleanupMedia().catch(console.error)
