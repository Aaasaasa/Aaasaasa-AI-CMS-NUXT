# Portalunabhängige Entwicklungsumgebung

## Übersicht

Dieses Projekt unterstützt alle gängigen Paketmanager und löst automatisch MySQL File Watcher Permission-Probleme.

## Schnellstart

### Automatische Erkennung (Empfohlen)

```bash
./dev.sh
```

### Manuell mit spezifischem Paketmanager

```bash
# Yarn
yarn dev

# NPM
npm run dev

# PNPM
pnpm dev

# Bun
bun run dev
```

## Unterstützte Paketmanager

| Paketmanager | Lockfile            | Auto-Erkennung | Status      |
| ------------ | ------------------- | -------------- | ----------- |
| **Yarn**     | `yarn.lock`         | ✅             | Primär      |
| **NPM**      | `package-lock.json` | ✅             | Unterstützt |
| **PNPM**     | `pnpm-lock.yaml`    | ✅             | Unterstützt |
| **Bun**      | `bun.lockb`         | ✅             | Unterstützt |

## Verfügbare Scripts

### Entwicklung

- `./dev.sh` - Universeller Development Server
- `./dev.sh dev:clean` - Clean Build + Development Server
- `./dev.sh dev:safe` - Explizit sicherer Modus
- `yarn/npm/pnpm/bun run dev` - Standard Development

### Data Management

- `./dev.sh setup:data` - Setup MySQL Data Isolation
- `./dev.sh restore:data` - Restore Original Data Structure
- `yarn/npm/pnpm/bun run setup:data` - Manual Setup
- `yarn/npm/pnpm/bun run restore:data` - Manual Restore

### WordPress Migration

- `./dev.sh wp:migrate` - WordPress zu PostgreSQL Migration
- `./dev.sh wp:test` - Test Migration Script
- `./dev.sh wp:clean` - Clean WordPress Dump

## Problem: MySQL File Watcher Permissions

### Das Problem

```
ERROR [unhandledRejection] EACCES: permission denied, watch '/path/to/data/mysql/#ib_16384_0.dblwr'
```

### Die Lösung

Automatische **Data Directory Isolation**:

1. **Detection**: Script erkennt MySQL Permission-Probleme
2. **Isolation**: Verschiebt `data/` nach `/srv/proj/nuxt-wp-multilang-theme-data`
3. **Symlink**: Erstellt symlink `data/` → isoliertes Verzeichnis
4. **Watch Exclusion**: Nuxt File Watcher ignoriert isolierte Daten

### Technische Details

```bash
# Original Structure (Problematisch)
project/
├── data/
│   └── mysql/           # MySQL files cause watcher errors
└── nuxt.config.ts

# Neue Structure (Gelöst)
project/
├── data/ → symlink      # Points to isolated directory
└── nuxt.config.ts

# Isolated Location
/srv/proj/nuxt-wp-multilang-theme-data/
└── mysql/               # Same files, outside watch scope
```

## Automatische Features

### Paketmanager-Erkennung

1. **Lockfile Detection**: Prüft yarn.lock, package-lock.json, etc.
2. **Command Detection**: Fallback zu verfügbaren Commands
3. **Smart Execution**: Führt korrekten PM-Command aus

### Data Isolation

1. **Auto-Setup**: Läuft automatisch bei `dev` Commands
2. **Permission-Safe**: Keine sudo/root Rechte nötig
3. **Reversible**: `restore:data` stellt Original zurück

### Error Prevention

1. **Watch Exclusion**: Ignoriert problematische MySQL Files
2. **Symlink Management**: Intelligente Link-Verwaltung
3. **Cross-Platform**: Funktioniert auf Linux/macOS/WSL

## Manuelle Verwendung

### Setup Data Isolation

```bash
node scripts/setup-data-isolation.js setup
```

### Restore Original Structure

```bash
node scripts/setup-data-isolation.js restore
```

### Help

```bash
./dev.sh help
node scripts/setup-data-isolation.js --help
```

## Integration in andere Projekte

1. **Kopiere Scripts**:
   - `scripts/setup-data-isolation.js`
   - `dev.sh`

2. **Update package.json**:

```json
{
  "scripts": {
    "dev": "node scripts/setup-data-isolation.js && nuxt dev",
    "setup:data": "node scripts/setup-data-isolation.js setup",
    "restore:data": "node scripts/setup-data-isolation.js restore"
  }
}
```

3. **Update nuxt.config.ts**:

```typescript
export default defineNuxtConfig({
  vite: {
    server: {
      watch: {
        ignored: ['**/data/**', '**/node_modules/**', '**/.nuxt/**']
      }
    }
  }
})
```

## Troubleshooting

### Script Permissions

```bash
chmod +x dev.sh
```

### Node.js Version

```bash
node --version  # >= 18.x required
```

### Manual Data Reset

```bash
rm -rf data/
node scripts/setup-data-isolation.js setup
```

## Entwicklung

Die Lösung ist:

- ✅ **Portalunabhängig**: Alle Paketmanager
- ✅ **Automatisch**: Keine manuelle Konfiguration
- ✅ **Reversibel**: Einfach rückgängig machbar
- ✅ **Cross-Platform**: Linux, macOS, WSL
- ✅ **Production-Safe**: Keine Auswirkung auf Builds
