# API Documentation

Auto-generated documentation via swagger-jsdoc.

## 🚀 Access

**Development**: Visit `http://localhost:3000/api/docs/ui` during development for interactive documentation.

**⚠️ Development only** (403 in production)

## 🔐 Authentication Endpoints

**Implementation**: See `server/api/auth/` for complete authentication endpoint implementations including registration, login, logout, and password reset.

## � Content Endpoints

### Articles API

- **GET** `/api/articles` - Liste aller Artikel mit Übersetzungen
- **GET** `/api/articles/[slug]` - Einzelner Artikel nach Slug
- Features: Kategorien/Tags, Featured Images, Übersetzungen, Metadaten

### Pages API

- **GET** `/api/pages` - Liste aller Seiten mit Übersetzungen
- **GET** `/api/pages/[slug]` - Einzelne Seite nach Slug
- Features: Hierarchie (parent/children), Menu Order, Featured Images

### Portfolios API

- **GET** `/api/portfolios` - Liste aller Portfolio-Projekte
- **GET** `/api/portfolios/[slug]` - Portfolio-Projekt nach Slug
- Features: Portfolio-Kategorien/Tags, Featured Images, Projekt-Metadaten

### 🔄 Geplant: Products API

- **GET** `/api/products` - E-Commerce Produkte
- Status: Schema vorhanden, API in Entwicklung

## �🛡️ Protected Routes

All API routes except authentication and public endpoints require authentication:

- **Protected:** POST/PUT/DELETE operations on all content
- **Public:** GET operations on content, authentication endpoints, documentation

Authentication is handled automatically by the global auth middleware.

## 📊 API Response Format

### Standard Response (mit Übersetzungen)

```json
{
  "id": 1,
  "slug": "example-article",
  "status": "PUBLISHED",
  "createdAt": "2025-10-29T...",
  "author": {
    "id": 1,
    "displayName": "Admin User"
  },
  "translations": [
    {
      "id": 1,
      "language": "de",
      "title": "Beispiel Artikel",
      "content": "...",
      "excerpt": "..."
    }
  ],
  "featuredImage": "/uploads/2024/image.webp",
  "terms": [
    {
      "term": { "name": "Technology", "slug": "technology" },
      "taxonomy": { "taxonomy": "post_tag" }
    }
  ]
}
```

## 📝 Adding an endpoint

**Implementation**: See existing API routes in `server/api/` for OpenAPI comment patterns and endpoint structure examples.

## ✅ Benefits

- ✅ **Auto-generated** from code
- ✅ **Always synchronized**
- ✅ **Zero maintenance**
- ✅ **Secure** (dev only)
