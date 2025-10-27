/*
  Warnings:

  - A unique constraint covering the columns `[instructorSubjectId,name]` on the table `Section` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `instructorsubject` DROP FOREIGN KEY `InstructorSubject_instructorId_fkey`;

-- DropForeignKey
ALTER TABLE `instructorsubject` DROP FOREIGN KEY `InstructorSubject_subjectId_fkey`;

-- DropForeignKey
ALTER TABLE `section` DROP FOREIGN KEY `Section_instructorSubjectId_fkey`;

-- DropIndex
DROP INDEX `InstructorSubject_instructorId_fkey` ON `instructorsubject`;

-- DropIndex
DROP INDEX `InstructorSubject_subjectId_fkey` ON `instructorsubject`;

-- DropIndex
DROP INDEX `Section_instructorSubjectId_fkey` ON `section`;

-- AlterTable
ALTER TABLE `instructorsubject` MODIFY `year` VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Section_instructorSubjectId_name_key` ON `Section`(`instructorSubjectId`, `name`);
