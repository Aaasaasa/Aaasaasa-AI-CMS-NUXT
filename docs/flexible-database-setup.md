# 🎯 Flexible Database Configuration

> **KONZEPT-DOKUMENT**: Optionale Datenbank-Auswahl für Aaasaasa AI CMS NUXT
>
> Dieses Dokument beschreibt eine **zukünftige Feature-Idee** für flexible Datenbank-Konfiguration.

## 🎯 Vision: Modulare Datenbank-Auswahl

### Problem

Aktuell ist das System auf **alle 3 Datenbanken** (PostgreSQL, MySQL, MongoDB) konfiguriert. Dies ist:

- ❌ **Zu komplex** für einfache Projekte
- ❌ **Ressourcen-intensiv** (3 DB-Systeme gleichzeitig)
- ❌ **Wartungs-aufwändig** (3x Backups, 3x Monitoring)
- ❌ **Nicht flexibel** (MySQL nur für WP-Migration nötig)

### Lösung: Selektive Datenbank-Aktivierung

```bash
# Installation mit Auswahl
npx create-nuxt-wp-cms my-project

? Welche Datenbanken möchten Sie verwenden?
  ✓ PostgreSQL (CMS - Required)
  ○ MySQL (WordPress Migration)
  ○ MongoDB (Analytics & Logs)
```

## 🏗️ Technische Umsetzung

### 1. Installations-Wizard

**Tool**: `create-nuxt-wp-cms` Package (ähnlich wie `create-nuxt-app`)

```typescript
// scripts/setup-wizard.ts
import inquirer from 'inquirer'

const answers = await inquirer.prompt([
  {
    type: 'checkbox',
    name: 'databases',
    message: 'Welche Datenbanken möchten Sie verwenden?',
    choices: [
      { name: 'PostgreSQL (CMS)', value: 'postgres', checked: true, disabled: 'Required' },
      { name: 'MySQL (WordPress Migration)', value: 'mysql' },
      { name: 'MongoDB (Analytics)', value: 'mongo' }
    ]
  },
  {
    type: 'confirm',
    name: 'includeRedis',
    message: 'Redis für Caching aktivieren?',
    default: true
  },
  {
    type: 'list',
    name: 'deployTarget',
    message: 'Deployment Ziel?',
    choices: ['Docker', 'Vercel', 'Netlify', 'Self-Hosted VPS']
  }
])
```

### 2. Conditional Prisma Schema

**Konzept**: Feature Flags für Prisma Clients

```typescript
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    databases: {
      postgres: true, // ALWAYS true (required)
      mysql: false, // Optional
      mongo: false // Optional
    }
  }
})
```

```typescript
// server/utils/prisma-registry.ts
import { useRuntimeConfig } from '#imports'

export const getDatabaseClients = () => {
  const config = useRuntimeConfig()

  const clients: Record<string, any> = {
    postgres: prismaCmsClient // Always available
  }

  if (config.databases.mysql) {
    clients.mysql = prismaWpClient
  }

  if (config.databases.mongo) {
    clients.mongo = prismaMongoClient
  }

  return clients
}
```

### 3. Dynamic Docker Compose

**Konzept**: Template-basierte docker-compose.yml

```yaml
# docker-compose.template.yml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    # ... always included

  {{#if mysql}}
  mysql:
    image: mysql:8.0
    # ... only if selected
  {{/if}}

  {{#if mongo}}
  mongo:
    image: mongo:7
    # ... only if selected
  {{/if}}

  {{#if redis}}
  redis:
    image: redis:7-alpine
    # ... only if selected
  {{/if}}
```

**Generator**:

```typescript
// scripts/generate-docker-compose.ts
import Handlebars from 'handlebars'
import fs from 'fs/promises'

const template = await fs.readFile('docker-compose.template.yml', 'utf-8')
const compile = Handlebars.compile(template)

const config = {
  mysql: process.env.ENABLE_MYSQL === 'true',
  mongo: process.env.ENABLE_MONGO === 'true',
  redis: process.env.ENABLE_REDIS === 'true'
}

const result = compile(config)
await fs.writeFile('docker-compose.yml', result)
```

### 4. Setup-Validation bei Start

```typescript
// server/plugins/db-validation.ts
export default defineNitroPlugin(async (nitroApp) => {
  const config = useRuntimeConfig()

  // Check PostgreSQL (required)
  try {
    await prismaCms.$connect()
    console.log('✅ PostgreSQL CMS connected')
  } catch (error) {
    console.error('❌ PostgreSQL REQUIRED but not available!')
    throw new Error('PostgreSQL connection failed. CMS cannot start.')
  }

  // Check MySQL (optional)
  if (config.databases.mysql) {
    try {
      await prismaWp.$connect()
      console.log('✅ MySQL WordPress client connected')
    } catch (error) {
      console.warn('⚠️ MySQL configured but connection failed. WordPress migration unavailable.')
    }
  }

  // Check MongoDB (optional)
  if (config.databases.mongo) {
    try {
      await prismaMongo.$connect()
      console.log('✅ MongoDB analytics connected')
    } catch (error) {
      console.warn('⚠️ MongoDB configured but connection failed. Analytics unavailable.')
    }
  }
})
```

## 📋 Aufwand-Schätzung

### Phase 1: Basic Setup Wizard (1-2 Wochen)

- ✅ CLI Tool mit `inquirer`
- ✅ Template-System für `.env` files
- ✅ Conditional imports in Server Utils
- ✅ README Generator mit custom docs

**Komplexität**: ⭐⭐⚫⚫⚫ (Mittel)

### Phase 2: Dynamic Docker Compose (1 Woche)

- ✅ Handlebars Templates
- ✅ Generator Script
- ✅ Validation beim Start
- ✅ Health Checks

**Komplexität**: ⭐⭐⚫⚫⚫ (Mittel)

### Phase 3: Conditional Prisma Clients (2-3 Wochen)

- ⚠️ Prisma Schema Conditionals (schwierig!)
- ⚠️ Client Generation nur für aktive DBs
- ⚠️ TypeScript Types conditional
- ⚠️ Import-Errors bei fehlenden Clients verhindern

**Komplexität**: ⭐⭐⭐⭐⚫ (Hoch - Prisma unterstützt das nicht nativ!)

### Phase 4: Installation-as-a-Service (3-4 Wochen)

- 🔧 Web-basierter Setup Wizard (Nuxt UI)
- 🔧 Database Connection Testing
- 🔧 Migration Runner mit Progress
- 🔧 Automatic `.env` Generation
- 🔧 Docker Container Startup

**Komplexität**: ⭐⭐⭐⭐⭐ (Sehr Hoch - Full-Stack Tool)

## 🎯 Empfohlener Ansatz

### Option A: CLI Setup Wizard (REALISTISCH)

**Aufwand**: 2-3 Wochen
**Features**:

- Interactive CLI mit `inquirer`
- Template-basierte File Generation
- Docker Compose Generator
- Validation Scripts

**Vorteile**:

- ✅ Machbar mit Standard-Tools
- ✅ Kein Custom Prisma-Hacking nötig
- ✅ Developer-friendly
- ✅ Gut dokumentierbar

**Nachteile**:

- ❌ Keine Runtime-Umschaltung
- ❌ Setup nur beim Init

### Option B: Web-basierter Installer (KOMPLEX)

**Aufwand**: 6-8 Wochen
**Features**:

- Full Web UI für Setup
- Live Database Testing
- Automatic Docker Setup
- Migration Monitor

**Vorteile**:

- ✅ User-friendly für Non-Devs
- ✅ Visual Feedback
- ✅ Error Handling

**Nachteile**:

- ❌ Sehr hoher Aufwand
- ❌ Extra Security-Layer nötig
- ❌ Wartung aufwändig

### Option C: Keep It Simple (JETZT)

**Aufwand**: 1-2 Tage
**Features**:

- ✅ Bessere Documentation
- ✅ Clear Warnings
- ✅ Example `.env` Files
- ✅ Docker Profiles

**Vorteile**:

- ✅ Sofort umsetzbar
- ✅ Keine Breaking Changes
- ✅ Fokus auf Docs

**Empfehlung**: START HERE! 👈

## 🚀 Quick Win: Docker Profiles

**Sofort umsetzbar** ohne großen Refactor:

```yaml
# docker-compose.yml
version: '3.8'
services:
  postgres:
    # Always runs

  mysql:
    profiles: ['migration'] # Only with --profile migration

  mongo:
    profiles: ['analytics'] # Only with --profile analytics

  redis:
    profiles: ['cache'] # Only with --profile cache
```

**Usage**:

```bash
# Nur PostgreSQL
docker-compose up -d

# Mit MySQL für Migration
docker-compose --profile migration up -d

# Full Stack
docker-compose --profile migration --profile analytics --profile cache up -d
```

**Aufwand**: 30 Minuten! ✅

## 📝 Nächste Schritte

### Sofort (Diese Woche)

1. ✅ Warnungen in alle MD-Files (DONE!)
2. ✅ Docker Profiles implementieren
3. ✅ `.env.example` mit Kommentaren verbessern
4. ✅ README mit "Quick Start" für verschiedene Setups

### Kurzfristig (Nächster Monat)

1. ⚠️ CLI Setup Wizard Prototyp
2. ⚠️ Template System für Configs
3. ⚠️ Validation Scripts

### Langfristig (Q1 2026)

1. 🔮 Web-basierter Installer (optional)
2. 🔮 Prisma Multi-Client Optimization
3. 🔮 Marketplace für Plugins

## 💡 Fazit

**Für JETZT**: Docker Profiles + Bessere Docs = **80% der Lösung mit 5% Aufwand**!

**Für SPÄTER**: CLI Wizard = **Professional Setup Experience**

**Für die ZUKUNFT**: Web Installer = **Enterprise Feature** (wenn Budget vorhanden)

---

**Status**: 📝 Konzept-Phase
**Ziel**: Einfacherer Einstieg ohne Komplexität zu verlieren
**Priorität**: Medium (nach i18n + Core Features)
