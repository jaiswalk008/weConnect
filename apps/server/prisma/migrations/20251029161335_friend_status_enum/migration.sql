/*
  Warnings:

  - The values [RECIEVED] on the enum `FriendStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "FriendStatus_new" AS ENUM ('SENT', 'ACCEPTED', 'RECEIVED');
ALTER TABLE "friends" ALTER COLUMN "status" TYPE "FriendStatus_new" USING ("status"::text::"FriendStatus_new");
ALTER TYPE "FriendStatus" RENAME TO "FriendStatus_old";
ALTER TYPE "FriendStatus_new" RENAME TO "FriendStatus";
DROP TYPE "public"."FriendStatus_old";
COMMIT;
