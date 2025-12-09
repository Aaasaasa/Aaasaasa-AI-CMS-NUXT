# 🎬 Live Demo & Screenshots

> **Coming Soon!** Hosted demo instance in progress.

## 🖼️ Screenshots

### **Homepage - Multilingual**

![Homepage Screenshot](../public/images/screenshots/homepage.png)
_Responsive design with language switcher, modern sidebar navigation_

### **Admin Dashboard**

![Admin Dashboard](../public/images/screenshots/admin-dashboard.png)
_Full-featured CMS admin panel with analytics_

### **Blog System**

![Blog System](../public/images/screenshots/blog.png)
_WordPress-like article management with categories and tags_

### **Language Switcher**

![Language Switcher](../public/images/screenshots/language-switcher.png)
_7 languages with smart detection_

### **Mobile Responsive**

![Mobile View](../public/images/screenshots/mobile.png)
_Mobile-first design, perfect on all devices_

---

## 🌐 Live Demo

**🚧 Coming Soon**

A live demo instance will be available at:

- **Frontend**: `https://demo.nuxtwp-cms.dev`
- **Admin**: `https://demo.nuxtwp-cms.dev/admin`
- **API Docs**: `https://demo.nuxtwp-cms.dev/api/docs`

**Test Credentials** (when available):

- **Admin**: `demo@example.com` / `DemoPassword123`
- **Editor**: `editor@example.com` / `EditorPass123`
- **Viewer**: `viewer@example.com` / `ViewerPass123`

---

## 📹 Video Walkthrough

**🎥 Coming Soon**

Planned video content:

1. **Quick Start Guide** (5 min) - Installation and setup
2. **Feature Overview** (10 min) - Core CMS features
3. **WordPress Migration** (15 min) - Step-by-step migration guide
4. **Customization Tutorial** (20 min) - Building custom features
5. **Deployment Guide** (10 min) - Production deployment

---

## 🧪 Try It Yourself

**Local Installation** (5 minutes):

```bash
git clone https://github.com/Aaasaasa/nuxt-wp-multilang-theme.git
cd nuxt-wp-multilang-theme
docker compose up -d postgres redis
yarn install
yarn prisma:generate
yarn prisma:migrate
yarn dev
```

Visit `http://localhost:3000` and explore! 🚀

---

## 📊 Interactive Features Demo

### **Multi-Database in Action**

```bash
# PostgreSQL: Content Management
curl http://localhost:3000/api/articles

# Redis: Check cached data
docker exec -it nuxt_redis redis-cli
> KEYS *

# MongoDB: Analytics (when enabled)
docker exec -it nuxt_mongo mongosh
> use analytics
> db.pageViews.find()
```

### **Internationalization Demo**

```bash
# Visit different language URLs
http://localhost:3000/en/about  # English
http://localhost:3000/de/about  # German
http://localhost:3000/sr/about  # Serbian
http://localhost:3000/es/about  # Spanish
```

### **API Documentation**

```bash
# Swagger/OpenAPI (when enabled)
http://localhost:3000/api/docs

# Available endpoints:
GET  /api/articles
GET  /api/articles/:id
GET  /api/categories
GET  /api/pages
GET  /api/portfolios
```

---

## 🎨 Customization Examples

### **Change Theme Colors**

```css
/* tailwind.config.cjs */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#your-brand-color',
        secondary: '#your-secondary-color'
      }
    }
  }
}
```

### **Add Custom Component**

```vue
<!-- app/components/features/MyFeature.vue -->
<template>
  <div class="my-feature">
    <h2>{{ $t('myFeature.title') }}</h2>
    <p>{{ $t('myFeature.description') }}</p>
  </div>
</template>
```

### **Create Custom API Endpoint**

```typescript
// server/api/custom/myendpoint.get.ts
export default defineEventHandler(async (event) => {
  const data = await prismaCms.myTable.findMany()
  return { data }
})
```

---

## 💼 Enterprise Demo Request

**Need a customized demo** for your specific use case?

📧 **Contact**: [GitHub @Aaasaasa](https://github.com/Aaasaasa)

I can prepare a **tailored demonstration** showing:

- ✅ Your specific industry requirements
- ✅ Custom feature implementations
- ✅ Integration with your existing systems
- ✅ Scalability for your user base
- ✅ Security compliance (GDPR, HIPAA, etc.)

**Available for consulting** to discuss your project needs!

---

**[← Back to Main README](../README.md)**
