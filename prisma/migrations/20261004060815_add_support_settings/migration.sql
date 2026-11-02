/*
  Warnings:

  - You are about to drop the column `maintenance` on the `support_settings` table. All the data in the column will be lost.
  - You are about to drop the `support_tickets` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "support_settings" DROP COLUMN "maintenance";

-- DropTable
DROP TABLE "support_tickets";

-- DropEnum
DROP TYPE "TicketPriority";

-- DropEnum
DROP TYPE "TicketStatus";
