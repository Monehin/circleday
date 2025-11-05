/*
  Warnings:

  - Added the required column `recipientUserId` to the `scheduled_sends` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('PERSONAL', 'TEAM');

-- AlterTable
ALTER TABLE "events" ADD COLUMN     "isGroupEvent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "groups" ADD COLUMN     "type" "GroupType" NOT NULL DEFAULT 'PERSONAL';

-- AlterTable
ALTER TABLE "scheduled_sends" ADD COLUMN     "recipientUserId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "scheduled_sends_recipientUserId_idx" ON "scheduled_sends"("recipientUserId");

-- AddForeignKey
ALTER TABLE "scheduled_sends" ADD CONSTRAINT "scheduled_sends_recipientUserId_fkey" FOREIGN KEY ("recipientUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
