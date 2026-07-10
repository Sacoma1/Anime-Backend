/*
  Warnings:

  - A unique constraint covering the columns `[nickname]` on the table `Users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nickname` to the `Users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Users` ADD COLUMN `nickname` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Users_nickname_key` ON `Users`(`nickname`);
