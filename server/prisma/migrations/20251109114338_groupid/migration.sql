/*
  Warnings:

  - You are about to drop the column `invite_link` on the `groups` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[group_id]` on the table `groups` will be added. If there are existing duplicate values, this will fail.
  - The required column `group_id` was added to the `groups` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "groups_invite_link_key";

-- DropIndex
DROP INDEX "notifications_created_at_idx";

-- DropIndex
DROP INDEX "notifications_is_read_idx";

-- DropIndex
DROP INDEX "notifications_type_idx";

-- AlterTable
ALTER TABLE "groups" DROP COLUMN "invite_link",
ADD COLUMN     "group_id" UUID NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "groups_group_id_key" ON "groups"("group_id");
