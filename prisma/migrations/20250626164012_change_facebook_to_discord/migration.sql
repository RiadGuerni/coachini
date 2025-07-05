/*
  Warnings:

  - You are about to drop the column `facebookId` on the `Account` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[discordId]` on the table `Account` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Account_facebookId_key";

-- AlterTable
ALTER TABLE "Account" DROP COLUMN "facebookId",
ADD COLUMN     "discordId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Account_discordId_key" ON "Account"("discordId");
