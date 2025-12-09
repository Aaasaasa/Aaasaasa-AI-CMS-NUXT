-- AlterTable
ALTER TABLE "cms_article_meta" ADD COLUMN     "mediaId" INTEGER;

-- AlterTable
ALTER TABLE "cms_page_meta" ADD COLUMN     "mediaId" INTEGER;

-- AlterTable
ALTER TABLE "cms_portfolio_meta" ADD COLUMN     "mediaId" INTEGER;

-- CreateTable
CREATE TABLE "cms_media" (
    "id" SERIAL NOT NULL,
    "wpAttachmentId" INTEGER,
    "filename" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSize" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "alt" TEXT,
    "caption" TEXT,
    "title" TEXT,
    "uploadedBy" INTEGER,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cms_media_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cms_media_sizes" (
    "id" SERIAL NOT NULL,
    "mediaId" INTEGER NOT NULL,
    "sizeName" TEXT NOT NULL,
    "filePath" TEXT NOT NULL,
    "width" INTEGER NOT NULL,
    "height" INTEGER NOT NULL,
    "fileSize" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cms_media_sizes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "cms_media_wpAttachmentId_key" ON "cms_media"("wpAttachmentId");

-- CreateIndex
CREATE INDEX "cms_media_wpAttachmentId_idx" ON "cms_media"("wpAttachmentId");

-- CreateIndex
CREATE INDEX "cms_media_filePath_idx" ON "cms_media"("filePath");

-- CreateIndex
CREATE INDEX "cms_media_filename_idx" ON "cms_media"("filename");

-- CreateIndex
CREATE INDEX "cms_media_mimeType_idx" ON "cms_media"("mimeType");

-- CreateIndex
CREATE INDEX "cms_media_sizes_mediaId_idx" ON "cms_media_sizes"("mediaId");

-- CreateIndex
CREATE INDEX "cms_media_sizes_sizeName_idx" ON "cms_media_sizes"("sizeName");

-- CreateIndex
CREATE UNIQUE INDEX "cms_media_sizes_mediaId_sizeName_key" ON "cms_media_sizes"("mediaId", "sizeName");

-- AddForeignKey
ALTER TABLE "cms_page_meta" ADD CONSTRAINT "cms_page_meta_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "cms_media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_article_meta" ADD CONSTRAINT "cms_article_meta_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "cms_media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_portfolio_meta" ADD CONSTRAINT "cms_portfolio_meta_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "cms_media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cms_media_sizes" ADD CONSTRAINT "cms_media_sizes_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "cms_media"("id") ON DELETE CASCADE ON UPDATE CASCADE;
