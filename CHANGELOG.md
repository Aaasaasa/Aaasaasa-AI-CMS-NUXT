# Changelog

All notable changes to the NuxtWP Multilang Theme project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-10-29 - WordPress Migration & Content APIs

### 🚀 Added

#### WordPress Migration System
- **Complete WordPress Migration**: Successfully migrated WordPress content to PostgreSQL CMS
- **Term Relationships Migration**: Added support for category/tag relationships (224 connections migrated)
- **Portfolio Support**: Full Avada Portfolio post type migration with custom taxonomies
- **WebP Image Optimization**: Featured images with progressive WebP conversion (33% complete)
- **Multi-Content Type Support**: Articles, Pages, Portfolios with full translation support

#### Content Management APIs
- **Articles API**: `/api/articles` with categories/tags, featured images, translations (37 articles)
- **Pages API**: `/api/pages` with hierarchy, menu order, featured images (12 pages) 
- **Portfolios API**: `/api/portfolios` with portfolio categories/tags, featured images (10 projects)
- **Term System**: 191 terms with 224 content relationships across all content types
- **Service Layer**: Business logic abstraction for all content types

#### Database Enhancements
- **Term Relationships**: Advanced category/tag system with flexible content connections
- **Multi-Language Content**: Full translation support for all content types
- **Featured Images**: WebP-optimized image system with relative path handling
- **Metadata Support**: Complete meta fields for all content types

### 📊 Migration Results
- **37 Articles** with 141 category/tag relationships
- **12 Pages** with full content hierarchy
- **10 Portfolio Projects** with 83 category/tag relationships  
- **191 Terms** (categories, tags, portfolio taxonomies)
- **224 Term Relationships** connecting content with taxonomies
- **WebP Conversion**: 33% of featured images converted to WebP format

## [1.0.0] - 2025-10-29 - Major Release

### 🚀 Added

#### Core Framework & Architecture
- **Nuxt 4.1.3**: Upgraded to latest stable Nuxt version with full TypeScript ES modules support
- **Modern Layout System**: Implemented responsive layout architecture with sidebar navigation
- **AppSidebar Component**: Professional sidebar with mobile overlay and desktop panel modes
- **AppFooter Component**: Modern footer with author attribution (Aleksandar Stajic) and CMS-ready structure
- **Multi-Database Support**: PostgreSQL (CMS), MySQL (WordPress), MongoDB (Analytics) integration
- **Yarn Package Management**: Migrated from mixed npm/pnpm to consistent Yarn workflow

#### UI & Components
- **Responsive Sidebar Navigation**: Mobile hamburger menu + desktop panel toggle
- **Modern Layout Components**: AppSidebar and AppFooter with professional design
- **CSS Variable System**: Custom Tailwind CSS variables for theme switching
- **Consolidated CSS**: Refactored from @apply directives to native CSS for better performance
- **Mobile-First Design**: Complete responsive design with breakpoint optimization

#### Database & Backend
- **Multi-Schema Prisma Setup**: Separated schemas for CMS, WordPress, and analytics
- **Automated Client Generation**: Script-based Prisma client generation for all databases
- **Migration System**: Structured database migration workflow
- **Prisma Studio Integration**: Visual database management interface
- **Docker Multi-Service**: PostgreSQL, MySQL, MongoDB, Redis, Adminer containers

#### Internationalization
- **7 Language Support**: English, German, Serbian, Spanish, French, Italian, Russian
- **Smart Locale Detection**: Advanced browser and cookie-based language detection
- **SEO-Optimized Routing**: Prefix-based routing with proper hreflang tags
- **Translation Management**: Organized translation files with validation

#### Authentication & Security
- **Complete Auth System**: Login, logout, session management, and protected routes
- **Admin Dashboard**: Separate admin application with role-based access
- **Security Headers**: Production-ready CORS, CSP, HSTS, and security configurations
- **Rate Limiting**: Configurable request throttling (150 req/5min default)

#### Development Experience
- **GitHub Actions CI/CD**: Automated linting, testing, and deployment workflows
- **Comprehensive Testing**: Vitest unit tests and Playwright E2E tests with coverage
- **Code Quality**: ESLint, Prettier, Commitlint with Husky hooks
- **Type Safety**: Strict TypeScript configuration with comprehensive type coverage
- **Hot Reload**: Full component and TypeScript hot reloading

### 🔧 Changed

#### Package Management Migration
- **npm → Yarn**: Complete migration from mixed package managers to Yarn
- **Script Consistency**: Updated all package.json scripts to use Yarn
- **CI/CD Updates**: GitHub Actions workflows converted to Yarn
- **Lock File**: Migrated from package-lock.json to yarn.lock

#### CSS Architecture Overhaul  
- **@apply Removal**: Eliminated all Tailwind @apply directives causing conflicts
- **Native CSS**: Converted to native CSS with CSS variables for theme support
- **Performance Optimization**: Reduced CSS bundle size and improved load times
- **Variable System**: Implemented CSS custom properties for theme switching

#### Layout System Modernization
- **UFooter → AppFooter**: Replaced basic footer with comprehensive modern footer
- **Sidebar Integration**: Added sidebar functionality to default layout
- **Mobile Navigation**: Improved mobile navigation with overlay and touch interactions
- **Admin Layout**: Separate layout system for admin dashboard

### 🐛 Fixed

#### Critical CSS Issues
- **bg-background Error**: Resolved "Cannot apply unknown utility class" errors
- **CSS Variable Conflicts**: Fixed Tailwind CSS variable compatibility issues
- **Admin Component Styling**: Fixed CSS errors in all admin components
- **Theme Switching**: Resolved dark/light theme CSS variable inheritance

#### Component Resolution
- **Auto-Import Issues**: Fixed Vue component auto-import problems with explicit imports
- **Layout Component Loading**: Resolved AppSidebar and AppFooter loading issues
- **Type Definitions**: Fixed TypeScript errors in layout components

#### Database Configuration
- **Multi-Client Generation**: Fixed Prisma client generation for multiple databases
- **Migration Conflicts**: Resolved schema migration conflicts between databases
- **Connection Pooling**: Optimized database connection management

### 📚 Documentation

#### Comprehensive Updates
- **README.md**: Complete rewrite with modern features, installation, and architecture
- **Project Structure**: Detailed directory structure with component explanations
- **Tech Stack**: Updated technology stack documentation with versions
- **Configuration Guide**: Environment setup and customization instructions

#### Developer Documentation
- **API Documentation**: Comprehensive API endpoint documentation
- **Component Architecture**: Design patterns and component usage guidelines
- **Database Patterns**: Multi-database design and migration patterns
- **Security Patterns**: Implementation guide for security features

### 🚧 Migration Notes

#### Breaking Changes
- **Package Manager**: Projects must migrate from npm/pnpm to Yarn
- **CSS Classes**: Some Tailwind classes replaced with CSS variables
- **Layout Structure**: Default layout now includes sidebar - may affect existing pages
- **Database URLs**: Environment variables updated for multi-database support

#### Upgrade Path
```bash
# 1. Install Yarn if not present
npm install -g yarn

# 2. Remove old lock files
rm package-lock.json pnpm-lock.yaml

# 3. Install dependencies with Yarn
yarn install

# 4. Update scripts in package.json
# Scripts now use 'yarn' instead of 'npm run'

# 5. Regenerate Prisma clients
yarn prisma:generate

# 6. Update environment variables
# Add new database URLs for multi-database setup
```

---

## [0.9.0] - 2025-07-23 - Foundation Release

### Initial Features
- Nuxt 4.0.1 foundation with TypeScript support
- Basic Prisma PostgreSQL integration  
- Simple authentication system
- Initial internationalization setup
- Docker development environment
- Basic testing infrastructure
- ESLint and Prettier configuration

### Dependencies
- Initial dependency setup with npm
- Renovate configuration for automated updates
- GitHub Actions basic CI/CD pipeline
- HAProxy and PostgreSQL deployment configuration

---

## Version History

- **v1.0.0** (2025-10-29): Major release with modern layout, multi-database, Yarn migration
- **v0.9.0** (2025-07-23): Foundation release with basic Nuxt 4 setup

## 0.0.0 (2025-07-23)

* chore: add MIT license ([d2f2281](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/d2f2281))
* chore: remove test file ([d926263](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/d926263))
* chore(deps): update appleboy/ssh-action action to v1.2.2 ([af965ae](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/af965ae))
* chore(deps): update dependency @nuxt/eslint to v1.7.0 ([c3650a4](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/c3650a4))
* chore(deps): update docker/build-push-action action to v6.18.0 ([5cccafd](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/5cccafd))
* chore(deps): update docker/login-action action to v3.4.0 ([f9cea5b](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/f9cea5b))
* chore(deps): update docker/setup-buildx-action action to v3.11.1 ([58a7f02](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/58a7f02))
* chore(deps): update haproxy docker tag to v2.9 ([aa6bab9](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/aa6bab9))
* chore(deps): update haproxy docker tag to v3 ([61fdf5d](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/61fdf5d))
* chore(deps): update postgres docker tag to v17 ([42381fe](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/42381fe))
* chore(deps): update softprops/action-gh-release action to v2.3.2 ([8941aff](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/8941aff))
* feat: add server configuration for HAProxy and PostgreSQL deployment ([4e4bbe7](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/4e4bbe7))
* feat: add test file for commitlint validation ([2da82e2](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/2da82e2))
* feat: configure comprehensive testing infrastructure ([7c2af1b](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/7c2af1b))
* feat: initial project setup ([19eb2eb](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/19eb2eb))
* feat: migrate to Nuxt 4 with enhanced project structure ([6389754](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/6389754))
* feat: update Nuxt to version 4.0.1 ([e6e832d](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/e6e832d))
* fix(deps): update dependency @nuxtjs/i18n to v10.0.1 ([5323bca](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/5323bca))
* Add renovate.json ([7554749](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/7554749))
* docs: enhance README with comprehensive project documentation ([4cc382f](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/4cc382f))
* docs: update issue templates ([7cd235f](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/7cd235f))
* test: validate commitlint hook is working ([f965067](https://github.com/WilliamFontaine/nuxt-boilerplate/commit/f965067))



