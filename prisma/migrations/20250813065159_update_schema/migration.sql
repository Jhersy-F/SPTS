/*
  Warnings:

  - You are about to drop the column `email` on the `instructor` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `Instructor` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `Instructor` table without a default value. This is not possible if the table is not empty.
  - Added the required column `instructor` to the `Upload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `subject` to the `Upload` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Upload` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Instructor_email_key` ON `instructor`;

-- AlterTable
ALTER TABLE `instructor` DROP COLUMN `email`,
    ADD COLUMN `username` VARCHAR(255) NOT NULL;

-- AlterTable
ALTER TABLE `upload` ADD COLUMN `instructor` VARCHAR(255) NOT NULL,
    ADD COLUMN `subject` VARCHAR(255) NOT NULL,
    ADD COLUMN `type` VARCHAR(100) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Instructor_username_key` ON `Instructor`(`username`);
