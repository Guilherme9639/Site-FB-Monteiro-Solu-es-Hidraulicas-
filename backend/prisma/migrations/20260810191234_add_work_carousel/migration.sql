-- CreateTable
CREATE TABLE "WorkCarouselConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "mode" TEXT NOT NULL DEFAULT 'CUSTOM',
    "selectedProjectId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkCarouselConfig_selectedProjectId_fkey" FOREIGN KEY ("selectedProjectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkCarouselImage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "configId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "description" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkCarouselImage_configId_fkey" FOREIGN KEY ("configId") REFERENCES "WorkCarouselConfig" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "WorkCarouselConfig_selectedProjectId_idx" ON "WorkCarouselConfig"("selectedProjectId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkCarouselImage_storageKey_key" ON "WorkCarouselImage"("storageKey");

-- CreateIndex
CREATE INDEX "WorkCarouselImage_configId_displayOrder_idx" ON "WorkCarouselImage"("configId", "displayOrder");

-- CreateIndex
CREATE INDEX "WorkCarouselImage_configId_isVisible_idx" ON "WorkCarouselImage"("configId", "isVisible");
