-- CreateEnum
CREATE TYPE "Role" AS ENUM ('GUEST', 'SUBSCRIBER', 'CONTRIBUTOR', 'AUTHOR', 'EDITOR', 'ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED', 'TRASH');

-- CreateTable
CREATE TABLE "cms_users" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SUBSCRIBER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_user_meta" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "cms_user_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_pages" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "authorId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "menuOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_page_translations" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "lang" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,

    CONSTRAINT "cms_page_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_page_meta" (
    "id" SERIAL NOT NULL,
    "pageId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "cms_page_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_articles" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "authorId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_article_translations" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "lang" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,

    CONSTRAINT "cms_article_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_article_meta" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "cms_article_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_portfolios" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'DRAFT',
    "authorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_portfolios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_portfolio_translations" (
    "id" SERIAL NOT NULL,
    "portfolioId" INTEGER NOT NULL,
    "lang" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,

    CONSTRAINT "cms_portfolio_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_portfolio_meta" (
    "id" SERIAL NOT NULL,
    "portfolioId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "cms_portfolio_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_products" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "stock" INTEGER NOT NULL DEFAULT 0,
    "vendorId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_product_translations" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "lang" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "cms_product_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_product_meta" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "cms_product_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_comments" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "pageId" INTEGER,
    "articleId" INTEGER,
    "portfolioId" INTEGER,
    "productId" INTEGER,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_comment_meta" (
    "id" SERIAL NOT NULL,
    "commentId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "cms_comment_meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_terms" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cms_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_term_taxonomies" (
    "id" SERIAL NOT NULL,
    "termId" INTEGER NOT NULL,
    "taxonomy" TEXT NOT NULL,
    "description" TEXT,
    "parentId" INTEGER,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cms_term_taxonomies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_term_relationships" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER,
    "pageId" INTEGER,
    "portfolioId" INTEGER,
    "productId" INTEGER,
    "termTaxonomyId" INTEGER NOT NULL,

    CONSTRAINT "cms_term_relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_menus" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_cookie_categories" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_cookie_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_cookie_category_translations" (
    "id" SERIAL NOT NULL,
    "cookieCategoryId" INTEGER NOT NULL,
    "lang" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "cms_cookie_category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_cookies" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT,
    "duration" TEXT,
    "purpose" TEXT NOT NULL,
    "provider" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_cookies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_cookie_translations" (
    "id" SERIAL NOT NULL,
    "cookieId" INTEGER NOT NULL,
    "lang" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "provider" TEXT,

    CONSTRAINT "cms_cookie_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_cookie_policies" (
    "id" SERIAL NOT NULL,
    "version" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "validFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_cookie_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_cookie_policy_translations" (
    "id" SERIAL NOT NULL,
    "cookiePolicyId" INTEGER NOT NULL,
    "lang" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "bannerText" TEXT NOT NULL,
    "acceptText" TEXT NOT NULL DEFAULT 'Accept All',
    "rejectText" TEXT NOT NULL DEFAULT 'Reject All',
    "settingsText" TEXT NOT NULL DEFAULT 'Cookie Settings',

    CONSTRAINT "cms_cookie_policy_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_cookie_consents" (
    "id" TEXT NOT NULL,
    "userId" INTEGER,
    "categories" JSONB NOT NULL,
    "policyVersion" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_cookie_consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "cms_settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "cms_users_login_key" ON "cms_users"("login");

-- CreateIndex
CREATE UNIQUE INDEX "cms_users_email_key" ON "cms_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cms_pages_slug_key" ON "cms_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cms_page_translations_pageId_lang_key" ON "cms_page_translations"("pageId", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "cms_articles_slug_key" ON "cms_articles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cms_article_translations_articleId_lang_key" ON "cms_article_translations"("articleId", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "cms_portfolios_slug_key" ON "cms_portfolios"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cms_portfolio_translations_portfolioId_lang_key" ON "cms_portfolio_translations"("portfolioId", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "cms_products_slug_key" ON "cms_products"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cms_product_translations_productId_lang_key" ON "cms_product_translations"("productId", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "cms_terms_slug_key" ON "cms_terms"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cms_menus_slug_key" ON "cms_menus"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cms_cookie_categories_key_key" ON "cms_cookie_categories"("key");

-- CreateIndex
CREATE UNIQUE INDEX "cms_cookie_category_translations_cookieCategoryId_lang_key" ON "cms_cookie_category_translations"("cookieCategoryId", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "cms_cookie_translations_cookieId_lang_key" ON "cms_cookie_translations"("cookieId", "lang");

-- CreateIndex
CREATE UNIQUE INDEX "cms_cookie_policies_version_key" ON "cms_cookie_policies"("version");

-- CreateIndex
CREATE UNIQUE INDEX "cms_cookie_policy_translations_cookiePolicyId_lang_key" ON "cms_cookie_policy_translations"("cookiePolicyId", "lang");

-- AddForeignKey
ALTER TABLE "cms_user_meta" ADD CONSTRAINT "cms_user_meta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cms_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_pages" ADD CONSTRAINT "cms_pages_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "cms_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_pages" ADD CONSTRAINT "cms_pages_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "cms_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_page_translations" ADD CONSTRAINT "cms_page_translations_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "cms_pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_page_meta" ADD CONSTRAINT "cms_page_meta_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "cms_pages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_articles" ADD CONSTRAINT "cms_articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "cms_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_articles" ADD CONSTRAINT "cms_articles_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "cms_articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_article_translations" ADD CONSTRAINT "cms_article_translations_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "cms_articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_article_meta" ADD CONSTRAINT "cms_article_meta_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "cms_articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_portfolios" ADD CONSTRAINT "cms_portfolios_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "cms_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_portfolio_translations" ADD CONSTRAINT "cms_portfolio_translations_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "cms_portfolios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_portfolio_meta" ADD CONSTRAINT "cms_portfolio_meta_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "cms_portfolios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_products" ADD CONSTRAINT "cms_products_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "cms_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_product_translations" ADD CONSTRAINT "cms_product_translations_productId_fkey" FOREIGN KEY ("productId") REFERENCES "cms_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_product_meta" ADD CONSTRAINT "cms_product_meta_productId_fkey" FOREIGN KEY ("productId") REFERENCES "cms_products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_comments" ADD CONSTRAINT "cms_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cms_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_comments" ADD CONSTRAINT "cms_comments_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "cms_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_comments" ADD CONSTRAINT "cms_comments_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "cms_articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_comments" ADD CONSTRAINT "cms_comments_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "cms_portfolios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_comments" ADD CONSTRAINT "cms_comments_productId_fkey" FOREIGN KEY ("productId") REFERENCES "cms_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_comment_meta" ADD CONSTRAINT "cms_comment_meta_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "cms_comments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_term_taxonomies" ADD CONSTRAINT "cms_term_taxonomies_termId_fkey" FOREIGN KEY ("termId") REFERENCES "cms_terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_term_taxonomies" ADD CONSTRAINT "cms_term_taxonomies_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "cms_term_taxonomies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_term_relationships" ADD CONSTRAINT "cms_term_relationships_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "cms_articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_term_relationships" ADD CONSTRAINT "cms_term_relationships_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "cms_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_term_relationships" ADD CONSTRAINT "cms_term_relationships_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "cms_portfolios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_term_relationships" ADD CONSTRAINT "cms_term_relationships_productId_fkey" FOREIGN KEY ("productId") REFERENCES "cms_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_term_relationships" ADD CONSTRAINT "cms_term_relationships_termTaxonomyId_fkey" FOREIGN KEY ("termTaxonomyId") REFERENCES "cms_term_taxonomies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_cookie_category_translations" ADD CONSTRAINT "cms_cookie_category_translations_cookieCategoryId_fkey" FOREIGN KEY ("cookieCategoryId") REFERENCES "cms_cookie_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_cookies" ADD CONSTRAINT "cms_cookies_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "cms_cookie_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_cookie_translations" ADD CONSTRAINT "cms_cookie_translations_cookieId_fkey" FOREIGN KEY ("cookieId") REFERENCES "cms_cookies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_cookie_policy_translations" ADD CONSTRAINT "cms_cookie_policy_translations_cookiePolicyId_fkey" FOREIGN KEY ("cookiePolicyId") REFERENCES "cms_cookie_policies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_cookie_consents" ADD CONSTRAINT "cms_cookie_consents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "cms_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
