# 🚀 Content APIs Documentation

Comprehensive guide to the Content Management APIs with full WordPress migration integration.

## 📊 Overview

The Content API system provides RESTful endpoints for all content types with full multilingual support, term relationships, and media management.

### Available APIs

| Endpoint          | Status     | Content Count | Features                                                       |
| ----------------- | ---------- | ------------- | -------------------------------------------------------------- |
| `/api/articles`   | ✅ Active  | 37 items      | Categories/Tags (141 relations), Featured Images, Translations |
| `/api/pages`      | ✅ Active  | 12 items      | Hierarchy, Menu Order, Featured Images                         |
| `/api/portfolios` | ✅ Active  | 10 items      | Portfolio Categories/Tags (83 relations), Featured Images      |
| `/api/products`   | 🔄 Planned | 0 items       | E-commerce integration (schema ready)                          |

## 📝 Articles API

### Endpoint: `GET /api/articles`

Returns all published articles with full translation and relationship data.

#### Response Example

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "jetbrains-ide-babun-settings-bash",
      "status": "PUBLISHED",
      "authorId": 1,
      "createdAt": "2025-10-29T15:30:00Z",
      "updatedAt": "2025-10-29T15:30:00Z",
      "author": {
        "id": 1,
        "displayName": "rooth8233"
      },
      "translations": [
        {
          "id": 1,
          "language": "de",
          "title": "JetBrains IDE Babun Settings Bash",
          "content": "Complete article content...",
          "excerpt": "Article excerpt..."
        }
      ],
      "featuredImage": "/uploads/2024/jetbrains-ide.webp",
      "terms": [
        {
          "termTaxonomy": {
            "taxonomy": "category",
            "term": {
              "name": "Allgemein",
              "slug": "allgemein"
            }
          }
        },
        {
          "termTaxonomy": {
            "taxonomy": "post_tag",
            "term": {
              "name": "technology",
              "slug": "technology"
            }
          }
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 37,
    "hasMore": true
  }
}
```

#### Features

- **141 Term Relationships**: Articles connected to categories and tags
- **Featured Images**: WebP-optimized images with relative paths
- **Translations**: Full multilingual content support (primarily German)
- **Author Information**: Complete user attribution
- **SEO-Ready**: Excerpts and structured data

## 📄 Pages API

### Endpoint: `GET /api/pages`

Returns all published pages with hierarchical structure and menu ordering.

#### Response Example

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "about-us",
      "status": "PUBLISHED",
      "authorId": 1,
      "parentId": null,
      "menuOrder": 1,
      "createdAt": "2025-10-29T15:30:00Z",
      "author": {
        "id": 1,
        "displayName": "rooth8233"
      },
      "translations": [
        {
          "id": 1,
          "language": "de",
          "title": "Über uns",
          "content": "Page content...",
          "excerpt": "Page summary..."
        }
      ],
      "featuredImage": "/uploads/2024/about-us.webp",
      "children": [
        {
          "id": 2,
          "slug": "team",
          "menuOrder": 1,
          "translations": [
            {
              "language": "de",
              "title": "Unser Team"
            }
          ]
        }
      ]
    }
  ],
  "count": 12
}
```

#### Features

- **Hierarchical Structure**: Parent-child page relationships
- **Menu Ordering**: Sortable page ordering for navigation
- **12 Pages Total**: Complete site structure
- **No Categories**: Pages typically don't use category/tag system
- **Featured Images**: WebP-optimized page headers

## 🎨 Portfolios API

### Endpoint: `GET /api/portfolios`

Returns all portfolio projects with specialized taxonomies and project metadata.

#### Response Example

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "slug": "responsive-web-design-project",
      "status": "PUBLISHED",
      "authorId": 1,
      "createdAt": "2025-10-29T15:30:00Z",
      "author": {
        "id": 1,
        "displayName": "rooth8233"
      },
      "translations": [
        {
          "id": 1,
          "language": "de",
          "title": "Responsive Web Design Projekt",
          "content": "Project description...",
          "excerpt": "Project summary..."
        }
      ],
      "featuredImage": "/uploads/2024/portfolio-project.webp",
      "terms": [
        {
          "termTaxonomy": {
            "taxonomy": "portfolio_category",
            "term": {
              "name": "Web Development",
              "slug": "web-development"
            }
          }
        },
        {
          "termTaxonomy": {
            "taxonomy": "portfolio_tags",
            "term": {
              "name": "responsive",
              "slug": "responsive"
            }
          }
        }
      ],
      "metas": [
        {
          "key": "project_url",
          "value": "https://example.com"
        },
        {
          "key": "technologies",
          "value": "HTML5, CSS3, JavaScript, Vue.js"
        }
      ]
    }
  ],
  "count": 10
}
```

#### Features

- **83 Term Relationships**: Portfolio projects connected to specialized categories/tags
- **Project Metadata**: Custom fields for project URLs, technologies, etc.
- **10 Projects Total**: Professional portfolio showcase
- **Specialized Taxonomies**: `portfolio_category` and `portfolio_tags`
- **Featured Images**: WebP-optimized project previews

## 🔗 Term Relationships System

### Overview

Advanced category/tag system with 224 total relationships connecting content with taxonomies.

### Relationship Distribution

| Content Type | Relationship Count | Primary Taxonomies                     |
| ------------ | ------------------ | -------------------------------------- |
| Articles     | 141 relationships  | `category`, `post_tag`                 |
| Pages        | 0 relationships    | None (by design)                       |
| Portfolios   | 83 relationships   | `portfolio_category`, `portfolio_tags` |

### Taxonomy Types

```json
{
  "taxonomies": {
    "category": {
      "count": "~50",
      "description": "Blog article categories",
      "usedBy": ["articles"]
    },
    "post_tag": {
      "count": "~100",
      "description": "Blog article tags",
      "usedBy": ["articles"]
    },
    "portfolio_category": {
      "count": "~20",
      "description": "Portfolio project categories",
      "usedBy": ["portfolios"]
    },
    "portfolio_tags": {
      "count": "~20",
      "description": "Portfolio project tags",
      "usedBy": ["portfolios"]
    }
  }
}
```

## 📸 Media Management

### WebP Optimization

**Current Status**: 33% of featured images converted to WebP format

#### Image Processing Pipeline

1. **WordPress Import**: Original JPG/PNG images imported
2. **WebP Detection**: Check if WebP version exists
3. **Progressive Conversion**: Convert remaining images to WebP
4. **Relative Paths**: All images use `/uploads/YYYY/filename.webp` format

#### Example Image URLs

```json
{
  "originalPath": "http://wordpress.site/wp-content/uploads/2024/01/image.jpg",
  "convertedPath": "/uploads/2024/image.webp",
  "fallbackPath": "/uploads/2024/image.jpg"
}
```

## 🛠️ Service Layer Architecture

### Business Logic Separation

Each content type has dedicated service classes:

- `server/services/article.service.ts`
- `server/services/page.service.ts`
- `server/services/portfolio.service.ts`

#### Example Service Usage

```typescript
// server/api/articles/index.get.ts
import { ArticleService } from '~/server/services/article.service'

export default defineEventHandler(async (event) => {
  try {
    const articles = await ArticleService.getAllArticles()
    return createSuccessResponse(articles)
  } catch (error) {
    return createErrorResponse(error)
  }
})
```

### Service Features

- **Consistent Error Handling**: Standardized error responses
- **Author Population**: Automatic author relationship loading
- **Translation Support**: Multiple language content loading
- **Term Relationships**: Category/tag relationship loading
- **Featured Images**: WebP-optimized image path handling

## 🔄 Future Enhancements

### Products API (Planned)

```typescript
// Planned: server/api/products/index.get.ts
interface ProductResponse {
  id: number
  slug: string
  sku: string
  price: number
  salePrice?: number
  stockQuantity: number
  translations: ProductTranslation[]
  categories: TermRelationship[]
  images: ProductImage[]
  variations?: ProductVariation[]
}
```

### Enhanced Features (Roadmap)

- **Search API**: Full-text search across all content types
- **Filtering**: Advanced filtering by categories, tags, dates
- **Pagination**: Cursor-based pagination for large datasets
- **Caching**: Redis-based API response caching
- **Rate Limiting**: API usage rate limiting
- **Content Versioning**: Draft/published content versioning

## 📝 Usage Examples

### Frontend Integration

```vue
<template>
  <div>
    <article v-for="article in articles" :key="article.id">
      <h2>{{ getTranslation(article, 'title') }}</h2>
      <img :src="article.featuredImage" :alt="getTranslation(article, 'title')" />
      <div class="tags">
        <span v-for="term in article.terms" :key="term.termTaxonomy.term.slug">
          {{ term.termTaxonomy.term.name }}
        </span>
      </div>
    </article>
  </div>
</template>

<script setup>
const { data: articles } = await $fetch('/api/articles')

function getTranslation(content, field, lang = 'de') {
  const translation = content.translations.find((t) => t.language === lang)
  return translation?.[field] || ''
}
</script>
```

### API Testing

```bash
# Test Articles API
curl -X GET "http://localhost:3000/api/articles" | jq '.data[0].translations[0].title'

# Test Pages API
curl -X GET "http://localhost:3000/api/pages" | jq '.data | length'

# Test Portfolios API
curl -X GET "http://localhost:3000/api/portfolios" | jq '.data[0].terms | length'
```

## 🔍 Troubleshooting

### Common Issues

**1. Missing Translations**

```bash
# Check if content has translations
SELECT COUNT(*) FROM "ArticleTranslation" WHERE "language" = 'de';
```

**2. Term Relationships Not Loading**

```bash
# Verify term relationships exist
SELECT COUNT(*) FROM "TermRelationship" WHERE "articleId" IS NOT NULL;
```

**3. Featured Images 404**

```bash
# Check WebP conversion status
ls public/uploads/2024/*.webp | wc -l
```

### Performance Optimization

- **Database Indexing**: Prisma creates optimal indexes automatically
- **Eager Loading**: All relationships loaded in single queries
- **Image Optimization**: WebP format reduces bandwidth by ~30%
- **Caching Headers**: APIs include appropriate cache headers

## 📚 Related Documentation

- [WordPress Migration Guide](./wordpress-migration.md) - Complete migration process
- [Database Patterns](./database-patterns.md) - Database schema and relationships
- [API Documentation](./api.md) - General API information and authentication
