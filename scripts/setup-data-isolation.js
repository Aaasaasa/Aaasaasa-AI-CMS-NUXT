#!/usr/bin/env node

/**
 * Data Isolation Setup Script
 *
 * Dieses Script löst das Problem mit MySQL file watcher permissions
 * indem es das data/ Verzeichnis außerhalb des Nuxt watch-paths verschiebt
 * und einen symlink erstellt. Funktioniert mit allen Paketmanagern.
 */

import { fileURLToPath } from 'node:url'
import { dirname, resolve, join } from 'node:path'
import { existsSync, mkdirSync, symlinkSync, lstatSync, rmSync } from 'node:fs'
import { execSync } from 'node:child_process'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const dataDir = join(projectRoot, 'data')
const dataBackupDir = join(dirname(projectRoot), 'nuxt-wp-multilang-theme-data')

function log(message, type = 'info') {
  const colors = {
    info: '\x1b[36m', // cyan
    success: '\x1b[32m', // green
    warning: '\x1b[33m', // yellow
    error: '\x1b[31m' // red
  }
  const reset = '\x1b[0m'
  // eslint-disable-next-line no-console
  console.log(`${colors[type]}[Data Setup]${reset} ${message}`)
}

function setupDataIsolation() {
  try {
    log('Setting up data directory isolation...')

    // 1. Prüfe ob data/ bereits ein symlink ist
    if (existsSync(dataDir)) {
      const stats = lstatSync(dataDir)
      if (stats.isSymbolicLink()) {
        log('Data directory is already isolated (symlink exists)', 'success')
        return
      }

      // 2. Verschiebe echtes data/ Verzeichnis zu backup location
      if (existsSync(dataBackupDir)) {
        log('Removing existing backup directory...')
        rmSync(dataBackupDir, { recursive: true, force: true })
      }

      log(`Moving data directory to ${dataBackupDir}...`)
      execSync(`mv "${dataDir}" "${dataBackupDir}"`, { stdio: 'inherit' })
    } else {
      // 3. Erstelle backup directory falls data/ nicht existiert
      log('Creating backup data directory...')
      mkdirSync(dataBackupDir, { recursive: true })
    }

    // 4. Erstelle symlink
    log('Creating symlink to isolated data directory...')
    symlinkSync(dataBackupDir, dataDir)

    log('✅ Data directory isolation completed successfully!', 'success')
    log(`   • Original data moved to: ${dataBackupDir}`, 'info')
    log(`   • Symlink created at: ${dataDir}`, 'info')
    log('   • MySQL file watcher permission errors should be resolved', 'info')
  } catch (error) {
    log(`❌ Error setting up data isolation: ${error.message}`, 'error')
    process.exit(1)
  }
}

function restoreDataDirectory() {
  try {
    log('Restoring data directory...')

    if (existsSync(dataDir)) {
      const stats = lstatSync(dataDir)
      if (stats.isSymbolicLink()) {
        log('Removing symlink...')
        rmSync(dataDir, { force: true })
      }
    }

    if (existsSync(dataBackupDir)) {
      log(`Moving data back from ${dataBackupDir}...`)
      execSync(`mv "${dataBackupDir}" "${dataDir}"`, { stdio: 'inherit' })
      log('✅ Data directory restored successfully!', 'success')
    } else {
      log('No backup data directory found', 'warning')
    }
  } catch (error) {
    log(`❌ Error restoring data directory: ${error.message}`, 'error')
    process.exit(1)
  }
}

// Command line interface
const command = process.argv[2]

switch (command) {
  case 'setup':
  case undefined:
    setupDataIsolation()
    break
  case 'restore':
    restoreDataDirectory()
    break
  case '--help':
  case '-h':
    // eslint-disable-next-line no-console
    console.log(`
Data Isolation Setup Script

Usage:
  node scripts/setup-data-isolation.js [command]

Commands:
  setup    (default) Isolate data directory to prevent file watcher issues
  restore  Restore original data directory structure
  --help   Show this help message

Purpose:
  Resolves MySQL file watcher permission errors by moving the data/
  directory outside of Nuxt's file watching scope and creating a symlink.
`)
    break
  default:
    log(`❌ Unknown command: ${command}`, 'error')
    log('Use --help for usage information', 'error')
    process.exit(1)
}
