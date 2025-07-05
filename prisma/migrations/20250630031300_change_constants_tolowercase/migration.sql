/*
  Warnings:

  - The values [MONTHLY,YEARLY] on the enum `PERIOD` will be removed. If these variants are still used in the database, this will fail.
  - The values [CLIENT,COACH] on the enum `ROLE` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PERIOD_new" AS ENUM ('monthly', 'yearly');
ALTER TABLE "SubscriptionPlan" ALTER COLUMN "period" TYPE "PERIOD_new" USING ("period"::text::"PERIOD_new");
ALTER TYPE "PERIOD" RENAME TO "PERIOD_old";
ALTER TYPE "PERIOD_new" RENAME TO "PERIOD";
DROP TYPE "PERIOD_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "ROLE_new" AS ENUM ('client', 'coach');
ALTER TABLE "Account" ALTER COLUMN "role" TYPE "ROLE_new" USING ("role"::text::"ROLE_new");
ALTER TYPE "ROLE" RENAME TO "ROLE_old";
ALTER TYPE "ROLE_new" RENAME TO "ROLE";
DROP TYPE "ROLE_old";
COMMIT;

-- DropEnum
DROP TYPE "PROVIDER";
