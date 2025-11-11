/*
  Warnings:

  - The values [PENDING,REJECTED] on the enum `FriendStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FriendStatus_new" AS ENUM ('SENT', 'ACCEPTED', 'RECIEVED');
ALTER TABLE "public"."friends" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "friends" ALTER COLUMN "status" TYPE "FriendStatus_new" USING ("status"::text::"FriendStatus_new");
ALTER TYPE "FriendStatus" RENAME TO "FriendStatus_old";
ALTER TYPE "FriendStatus_new" RENAME TO "FriendStatus";
DROP TYPE "public"."FriendStatus_old";
COMMIT;

-- AlterTable
ALTER TABLE "friends" ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;
