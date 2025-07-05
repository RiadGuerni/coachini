/*
  Warnings:

  - You are about to drop the column `email` on the `Client` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `Coach` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Account` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Client_email_key";

-- DropIndex
DROP INDEX "Coach_email_key";

-- AlterTable
ALTER TABLE "Account" ADD COLUMN     "email" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "email";

-- AlterTable
ALTER TABLE "Coach" DROP COLUMN "email";

-- CreateIndex
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
