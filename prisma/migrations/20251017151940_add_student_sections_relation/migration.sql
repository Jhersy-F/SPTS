/*
  Warnings:

  - Added the required column `semester` to the `InstructorSubject` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `InstructorSubject` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `instructorsubject` ADD COLUMN `semester` VARCHAR(50) NOT NULL,
    ADD COLUMN `year` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Section` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `instructorSubjectInstructorId` INTEGER NOT NULL,
    `instructorSubjectSubjectId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Section_instructorSubjectInstructorId_instructorSubjectSubje_key`(`instructorSubjectInstructorId`, `instructorSubjectSubjectId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `StudentSection` (
    `sectionId` INTEGER NOT NULL,
    `studentId` INTEGER NOT NULL,

    PRIMARY KEY (`sectionId`, `studentId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
