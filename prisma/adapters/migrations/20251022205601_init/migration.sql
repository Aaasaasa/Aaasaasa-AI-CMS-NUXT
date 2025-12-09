/*
  Warnings:

  - You are about to drop the column `content` on the `cms_articles` table. All the data in the column will be lost.
  - You are about to drop the column `excerpt` on the `cms_articles` table. All the data in the column will be lost.
  - You are about to drop the column `guid` on the `cms_articles` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `cms_articles` table. All the data in the column will be lost.
  - You are about to drop the column `menuOrder` on the `cms_articles` table. All the data in the column will be lost.
  - You are about to drop the column `publishedAt` on the `cms_articles` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `cms_articles` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `cms_articles` table. All the data in the column will be lost.
  - The primary key for the `cms_term_relationships` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the `_ArticleMedia` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cms_media` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cms_metas` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cms_revisions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cms_seo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_ArticleMedia" DROP CONSTRAINT "_ArticleMedia_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_ArticleMedia" DROP CONSTRAINT "_ArticleMedia_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."cms_comments" DROP CONSTRAINT "cms_comments_articleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."cms_metas" DROP CONSTRAINT "article_meta";

-- DropForeignKey
ALTER TABLE "public"."cms_metas" DROP CONSTRAINT "comment_meta";

-- DropForeignKey
ALTER TABLE "public"."cms_metas" DROP CONSTRAINT "user_meta";

-- DropForeignKey
ALTER TABLE "public"."cms_revisions" DROP CONSTRAINT "cms_revisions_articleId_fkey";

-- DropForeignKey
ALTER TABLE "public"."cms_revisions" DROP CONSTRAINT "cms_revisions_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."cms_term_relationships" DROP CONSTRAINT "cms_term_relationships_articleId_fkey";

-- AlterTable
ALTER TABLE "cms_articles" DROP COLUMN "content",
DROP COLUMN "excerpt",
DROP COLUMN "guid",
DROP COLUMN "language",
DROP COLUMN "menuOrder",
DROP COLUMN "publishedAt",
DROP COLUMN "title",
DROP COLUMN "type";

-- AlterTable
ALTER TABLE "cms_comments" ADD COLUMN     "pageId" INTEGER,
ADD COLUMN     "portfolioId" INTEGER,
ADD COLUMN     "productId" INTEGER,
ALTER COLUMN "articleId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "cms_menus" ALTER COLUMN "name" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "cms_term_relationships" DROP CONSTRAINT "cms_term_relationships_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD COLUMN     "pageId" INTEGER,
ADD COLUMN     "portfolioId" INTEGER,
ADD COLUMN     "productId" INTEGER,
ALTER COLUMN "articleId" DROP NOT NULL,
ADD CONSTRAINT "cms_term_relationships_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "cms_term_taxonomies" ALTER COLUMN "description" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "cms_terms" ALTER COLUMN "name" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "public"."_ArticleMedia";

-- DropTable
DROP TABLE "public"."cms_media";

-- DropTable
DROP TABLE "public"."cms_metas";

-- DropTable
DROP TABLE "public"."cms_revisions";

-- DropTable
DROP TABLE "public"."cms_seo";

-- DropEnum
DROP TYPE "public"."ContentType";

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
CREATE TABLE "cms_comment_meta" (
    "id" SERIAL NOT NULL,
    "commentId" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "cms_comment_meta_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cms_pages_slug_key" ON "cms_pages"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cms_page_translations_pageId_lang_key" ON "cms_page_translations"("pageId", "lang");

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
ALTER TABLE "cms_term_relationships" ADD CONSTRAINT "cms_term_relationships_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "cms_articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_term_relationships" ADD CONSTRAINT "cms_term_relationships_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "cms_pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_term_relationships" ADD CONSTRAINT "cms_term_relationships_portfolioId_fkey" FOREIGN KEY ("portfolioId") REFERENCES "cms_portfolios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_term_relationships" ADD CONSTRAINT "cms_term_relationships_productId_fkey" FOREIGN KEY ("productId") REFERENCES "cms_products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
