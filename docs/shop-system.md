# Shop System (Products)

Das Shop System ermöglicht die Verwaltung und Anzeige von Produkten mit E-Commerce-Funktionen.

## Übersicht

Das Products/Shop System besteht aus:

- **Backend**: REST APIs für Product-Management
- **Frontend**: Shop-Übersichts- und Produktdetailseiten
- **Service Layer**: Datenbankoperationen und Geschäftslogik
- **Prisma Integration**: Datenbankmodell mit PostgreSQL

## Datenbankstruktur

### Product Model

Das Product-Modell in `prisma/postgres-cms/schema.prisma`:

```prisma
model Product {
  id             String             @id @default(cuid())
  title          String
  slug           String             @unique
  description    String?
  price          Float
  currency       String             @default("EUR")
  stock          Int                @default(0)
  vendorId       String
  vendor         User               @relation(fields: [vendorId], references: [id])
  metas          ProductMeta[]
  translations   ProductTranslation[]
  createdAt      DateTime           @default(now())
  updatedAt      DateTime           @updatedAt

  @@map("products")
}
```

**Wichtige Felder:**

- `title`: Produktname
- `slug`: URL-freundlicher Name
- `description`: Produktbeschreibung (optional)
- `price`: Preis als Float
- `currency`: Währung (Standard: EUR)
- `stock`: Lagerbestand
- `vendorId`: Referenz auf User (Anbieter)
- `vendor`: Beziehung zum Anbieter
- `metas`: Zusätzliche Metadaten
- `translations`: Mehrsprachige Inhalte

### Related Models

- `ProductMeta`: Metadaten (Featured Images, etc.)
- `ProductTranslation`: Mehrsprachige Übersetzungen
- `User`: Anbieter/Vendor-Informationen

## API Endpoints

### 1. Alle Produkte abrufen

```
GET /api/products
```

**Response:**

```json
{
  "statusCode": 200,
  "data": [
    {
      "id": "cuid123",
      "title": "Produktname",
      "slug": "produktname",
      "description": "Beschreibung",
      "price": 99.99,
      "currency": "EUR",
      "stock": 10,
      "vendorId": "vendor123",
      "vendor": {
        "id": "vendor123",
        "displayName": "Anbieter Name"
      },
      "featuredImage": "https://example.com/image.webp",
      "createdAt": "2025-10-29T17:00:00Z",
      "updatedAt": "2025-10-29T17:00:00Z"
    }
  ],
  "message": "Products erfolgreich abgerufen"
}
```

### 2. Einzelnes Produkt abrufen

```
GET /api/products/[slug]
```

**Parameter:**

- `slug`: URL-Slug des Produkts

**Response:**

```json
{
  "statusCode": 200,
  "data": {
    "id": "cuid123",
    "title": "Produktname",
    "slug": "produktname",
    "description": "Detaillierte Beschreibung",
    "price": 99.99,
    "currency": "EUR",
    "stock": 10,
    "vendorId": "vendor123",
    "vendor": {
      "id": "vendor123",
      "displayName": "Anbieter Name"
    },
    "featuredImage": "https://example.com/image.webp",
    "createdAt": "2025-10-29T17:00:00Z",
    "updatedAt": "2025-10-29T17:00:00Z"
  },
  "message": "Product erfolgreich abgerufen"
}
```

**Error Response (404):**

```json
{
  "statusCode": 404,
  "message": "Product nicht gefunden"
}
```

## Service Layer

### ProductService (`server/services/product.service.ts`)

**Interface: ProductWithVendor**

```typescript
interface ProductWithVendor {
  id: string
  title: string
  slug: string
  description: string | null
  price: number
  currency: string
  stock: number
  vendorId: string
  vendor: {
    id: string
    displayName: string
  }
  featuredImage: string | null
  createdAt: Date
  updatedAt: Date
}
```

**Methoden:**

#### `getAllProducts()`

- Holt alle Produkte mit Vendor-Information
- Extrahiert Featured Images aus Metas
- Sortiert nach Erstellungsdatum (neueste zuerst)

#### `getProductBySlug(slug: string)`

- Holt einzelnes Produkt per Slug
- Inkludiert Vendor-Beziehung und Metas
- Extrahiert Featured Image
- Gibt `null` zurück wenn nicht gefunden

**Featured Image Extraktion:**

```typescript
const featuredImageMeta = product.metas?.find((meta) => meta.key === 'featured_image')
const featuredImage = featuredImageMeta?.value || null
```

## Frontend Pages

### 1. Shop Übersicht (`/app/pages/products/index.vue`)

**Features:**

- **Responsive Grid**: 1-4 Spalten je nach Bildschirmgröße
- **Product Cards**: Bild, Titel, Preis, Lagerstand
- **Loading State**: Skeleton-Animation
- **Error State**: Benutzerfreundliche Fehlermeldung
- **Empty State**: Anzeige wenn keine Produkte vorhanden
- **Stock Badges**: Grün für "Auf Lager", Rot für "Ausverkauft"
- **Price Formatting**: Lokalisierte Währungsanzeige
- **Add to Cart**: Toast-Benachrichtigung (Platzhalter)

**URL:** `http://localhost:4000/products`

**Komponenten:**

- `UCard`: Product Cards
- `UButton`: Aktions-Buttons
- `UBadge`: Stock-Status
- `UIcon`: Icons
- Loading/Error States

### 2. Product Detail (`/app/pages/products/[slug].vue`)

**Features:**

- **Breadcrumb Navigation**: Home → Shop → Produktname
- **Product Image**: Featured Image mit Fallback
- **Product Info**: Titel, Preis, Lagerstand, Vendor
- **Meta Information**: Anbieter, Erstellungsdatum, SKU, Währung
- **Action Buttons**: Warenkorb, Merkliste, Teilen
- **Description**: Produktbeschreibung (HTML-Tags entfernt)
- **Share Functionality**: Native Web Share API + Clipboard Fallback
- **SEO Meta Tags**: Dynamische Meta-Informationen
- **404 Handling**: Automatische Weiterleitung wenn Produkt nicht existiert

**URL:** `http://localhost:4000/products/[slug]`

**Share Funktionen:**

```typescript
const shareProduct = async () => {
  if (navigator.share) {
    // Native Web Share API
    await navigator.share({
      title: product.title,
      text: product.description,
      url: window.location.href
    })
  } else {
    // Fallback: Clipboard
    await navigator.clipboard.writeText(window.location.href)
  }
}
```

## Internationalization (i18n)

**Verwendete Übersetzungsschlüssel:**

```javascript
// Shop Übersicht
$t('shop.title', 'Shop')
$t('shop.subtitle', 'Entdecken Sie unser Sortiment...')
$t('shop.productCount', '{count} Produkte verfügbar')
$t('shop.inStock', 'Auf Lager')
$t('shop.outOfStock', 'Ausverkauft')
$t('shop.addToCart', 'In Warenkorb')
$t('shop.viewProduct', 'Ansehen')

// Product Detail
$t('product.vendor', 'Anbieter')
$t('product.stock', 'Lager: {count}')
$t('product.addToCart', 'In den Warenkorb')
$t('product.wishlist', 'Merkliste')
$t('product.share', 'Teilen')
$t('product.description', 'Produktbeschreibung')

// Error States
$t('shop.error.title', 'Shop not available')
$t('product.error.title', 'Produkt nicht gefunden')
```

## Styling & UX

**Design System:**

- **Tailwind CSS**: Utility-first CSS Framework
- **Nuxt UI**: Vue 3 Komponenten-Bibliothek
- **Dark Mode**: Vollständig unterstützt
- **Responsive**: Mobile-first Design
- **Accessibility**: ARIA-Labels und semantisches HTML

**Color Scheme:**

- `success`: Grün für "Auf Lager" und positive Aktionen
- `error`: Rot für "Ausverkauft" und Fehler
- `primary`: Hauptfarbe für Call-to-Action Buttons
- `neutral`: Grau für sekundäre Aktionen

## Aktuelle Einschränkungen

1. **Keine Produkte in DB**: System ist vorbereitet, aber Datenbank ist leer
2. **Cart Funktionalität**: Nur Toast-Benachrichtigungen (TODO)
3. **Wishlist Funktionalität**: Nur Toast-Benachrichtigungen (TODO)
4. **Payment Integration**: Nicht implementiert
5. **Inventory Management**: Keine Admin-Oberfläche
6. **Product Categories**: Nicht implementiert
7. **Product Reviews**: Nicht implementiert
8. **Product Variations**: Nicht implementiert

## Zukünftige Erweiterungen

1. **Warenkorb System**: LocalStorage + Pinia Store
2. **Checkout Process**: Bestellformular und Payment
3. **Admin Interface**: CRUD-Operationen für Produkte
4. **Product Categories**: Kategorisierung und Filter
5. **Search & Filter**: Volltext-Suche und Filteroptionen
6. **Product Reviews**: Bewertungssystem
7. **Related Products**: Produktempfehlungen
8. **Inventory Alerts**: Benachrichtigungen bei niedrigem Lagerstand

## Testing

**API Tests:**

```bash
# Alle Produkte
curl http://localhost:4000/api/products

# Einzelnes Produkt (404 erwartet)
curl http://localhost:4000/api/products/test-product
```

**Frontend Tests:**

```bash
# Shop Übersicht
curl -I http://localhost:4000/products

# Product Detail (404 erwartet)
curl -I http://localhost:4000/products/test-product
```

**Empty State Handling:**

- Shop zeigt "Keine Produkte verfügbar" Meldung
- Weiterleitung zu Kontakt und Startseite
- Benutzerfreundliche Platzhalter

## Integration

Das Shop System integriert sich nahtlos in das bestehende Nuxt CMS:

- **Prisma Schema**: PostgreSQL CMS Datenbank
- **API Struktur**: Konsistent mit Articles/Pages/Portfolios
- **Service Pattern**: Einheitliche Servicearchitektur
- **Frontend Pattern**: Gleiche Struktur wie Portfolio-Seiten
- **Menu Integration**: Bereit für Hauptmenü-Verlinkung

**Beispiel Menu Item:**

```json
{
  "title": "Shop",
  "route": "/products",
  "icon": "shopping-bag"
}
```
