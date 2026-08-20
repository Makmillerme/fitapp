-- CreateEnum
CREATE TYPE "ContactNoteKind" AS ENUM ('PROGRESS', 'GENERAL');

-- CreateTable
CREATE TABLE "ContactNote" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "kind" "ContactNoteKind" NOT NULL,
    "templateKey" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContactNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContactNote_contactId_kind_updatedAt_idx" ON "ContactNote"("contactId", "kind", "updatedAt");

-- Partial unique: one template per client (multiple free notes with NULL templateKey allowed)
CREATE UNIQUE INDEX "ContactNote_contactId_templateKey_key" ON "ContactNote"("contactId", "templateKey") WHERE "templateKey" IS NOT NULL;

-- AddForeignKey
ALTER TABLE "ContactNote" ADD CONSTRAINT "ContactNote_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;
