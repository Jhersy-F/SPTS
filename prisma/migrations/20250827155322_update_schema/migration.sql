/*
  Warnings:

  - You are about to drop the column `subject` on the `upload` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `upload` DROP COLUMN `subject`,
    ADD COLUMN `subjectID` INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE `Subject` (
    `subjectID` INTEGER NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(255) NOT NULL,

    PRIMARY KEY (`subjectID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin` (
    `adminID` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `Admin_username_key`(`username`),
    PRIMARY KEY (`adminID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
