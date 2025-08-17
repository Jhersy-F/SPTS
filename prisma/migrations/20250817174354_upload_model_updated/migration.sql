/*
  Warnings:

  - You are about to drop the column `instructor` on the `upload` table. All the data in the column will be lost.
  - Added the required column `instructorID` to the `Upload` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `upload` DROP COLUMN `instructor`,
    ADD COLUMN `instructorID` INTEGER NOT NULL;
