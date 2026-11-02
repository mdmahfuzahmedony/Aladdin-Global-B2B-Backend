-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "nidBackDocumentUrl" TEXT,
ADD COLUMN     "nidFrontDocumentUrl" TEXT,
ALTER COLUMN "nidDocumentUrl" DROP NOT NULL;
