-- AlterTable
ALTER TABLE "general_settings" ADD COLUMN     "maintenance" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "support_settings" ADD COLUMN     "maintenance" BOOLEAN NOT NULL DEFAULT false;
