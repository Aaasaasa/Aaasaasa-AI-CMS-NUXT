-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('GUEST', 'SUBSCRIBER', 'CONTRIBUTOR', 'AUTHOR', 'EDITOR', 'ADMIN', 'SUPERADMIN');

-- CreateEnum
CREATE TYPE "public"."Status" AS ENUM ('DRAFT', 'PENDING', 'PUBLISHED', 'ARCHIVED', 'TRASH');

-- CreateEnum
CREATE TYPE "public"."ContentType" AS ENUM ('POST', 'PAGE', 'ARTICLE', 'PORTFOLIO', 'MEDIA');

-- CreateTable
CREATE TABLE "public"."cms_users" (
    "id" SERIAL NOT NULL,
    "login" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "role" "public"."Role" NOT NULL DEFAULT 'SUBSCRIBER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "registeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cms_articles" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "guid" TEXT,
    "status" "public"."Status" NOT NULL DEFAULT 'DRAFT',
    "type" "public"."ContentType" NOT NULL DEFAULT 'ARTICLE',
    "authorId" INTEGER NOT NULL,
    "parentId" INTEGER,
    "menuOrder" INTEGER NOT NULL DEFAULT 0,
    "language" TEXT NOT NULL,
    "title" JSONB NOT NULL,
    "content" JSONB NOT NULL,
    "excerpt" JSONB,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cms_metas" (
    "id" SERIAL NOT NULL,
    "objectId" INTEGER NOT NULL,
    "objectType" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "cms_metas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cms_comments" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "userId" INTEGER,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cms_terms" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "group" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cms_terms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cms_term_taxonomies" (
    "id" SERIAL NOT NULL,
    "termId" INTEGER NOT NULL,
    "taxonomy" TEXT NOT NULL,
    "description" JSONB,
    "parentId" INTEGER,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "cms_term_taxonomies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cms_term_relationships" (
    "articleId" INTEGER NOT NULL,
    "termTaxonomyId" INTEGER NOT NULL,

    CONSTRAINT "cms_term_relationships_pkey" PRIMARY KEY ("articleId","termTaxonomyId")
);

-- CreateTable
CREATE TABLE "public"."cms_media" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "alt" TEXT,
    "title" TEXT,
    "type" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cms_seo" (
    "id" SERIAL NOT NULL,
    "objectId" INTEGER NOT NULL,
    "objectType" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "keywords" TEXT,
    "openGraph" JSONB,
    "twitter" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_seo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cms_revisions" (
    "id" SERIAL NOT NULL,
    "articleId" INTEGER NOT NULL,
    "authorId" INTEGER,
    "content" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cms_revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cms_menus" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" JSONB NOT NULL,
    "items" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."cms_settings" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "cms_settings_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "public"."_ArticleMedia" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ArticleMedia_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "cms_users_login_key" ON "public"."cms_users"("login");

-- CreateIndex
CREATE UNIQUE INDEX "cms_users_email_key" ON "public"."cms_users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "cms_articles_slug_key" ON "public"."cms_articles"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cms_terms_slug_key" ON "public"."cms_terms"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "cms_menus_slug_key" ON "public"."cms_menus"("slug");

-- CreateIndex
CREATE INDEX "_ArticleMedia_B_index" ON "public"."_ArticleMedia"("B");

-- AddForeignKey
ALTER TABLE "public"."cms_articles" ADD CONSTRAINT "cms_articles_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."cms_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cms_articles" ADD CONSTRAINT "cms_articles_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."cms_articles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cms_metas" ADD CONSTRAINT "article_meta" FOREIGN KEY ("objectId") REFERENCES "public"."cms_articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cms_metas" ADD CONSTRAINT "user_meta" FOREIGN KEY ("objectId") REFERENCES "public"."cms_users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cms_metas" ADD CONSTRAINT "comment_meta" FOREIGN KEY ("objectId") REFERENCES "public"."cms_comments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cms_comments" ADD CONSTRAINT "cms_comments_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."cms_articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cms_comments" ADD CONSTRAINT "cms_comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."cms_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cms_term_taxonomies" ADD CONSTRAINT "cms_term_taxonomies_termId_fkey" FOREIGN KEY ("termId") REFERENCES "public"."cms_terms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cms_term_taxonomies" ADD CONSTRAINT "cms_term_taxonomies_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."cms_term_taxonomies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cms_term_relationships" ADD CONSTRAINT "cms_term_relationships_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."cms_articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cms_term_relationships" ADD CONSTRAINT "cms_term_relationships_termTaxonomyId_fkey" FOREIGN KEY ("termTaxonomyId") REFERENCES "public"."cms_term_taxonomies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cms_revisions" ADD CONSTRAINT "cms_revisions_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."cms_articles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."cms_revisions" ADD CONSTRAINT "cms_revisions_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."cms_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ArticleMedia" ADD CONSTRAINT "_ArticleMedia_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."cms_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_ArticleMedia" ADD CONSTRAINT "_ArticleMedia_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."cms_media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
