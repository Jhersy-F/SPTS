-- CreateTable
CREATE TABLE `InstructorSubject_new` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `instructorId` INTEGER NOT NULL,
    `subjectId` INTEGER NOT NULL,
    `semester` VARCHAR(50) NOT NULL,
    `year` INTEGER NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Copy data
INSERT INTO `InstructorSubject_new` (`instructorId`, `subjectId`, `semester`, `year`, `assignedAt`)
SELECT `instructorId`, `subjectId`, `semester`, `year`, `assignedAt`
FROM `InstructorSubject`;

-- CreateTable
CREATE TABLE `Section_new` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `instructorSubjectId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Copy data with join to get instructorSubject id
INSERT INTO `Section_new` (`id`, `name`, `instructorSubjectId`, `createdAt`, `updatedAt`)
SELECT s.`id`, s.`name`, ins.`id` as `instructorSubjectId`, s.`createdAt`, s.`updatedAt`
FROM `Section` s
JOIN `InstructorSubject_new` ins 
  ON s.`instructorSubjectInstructorId` = ins.`instructorId` 
  AND s.`instructorSubjectSubjectId` = ins.`subjectId`;

-- Drop old tables
DROP TABLE `Section`;
DROP TABLE `InstructorSubject`;

-- Rename new tables
RENAME TABLE `InstructorSubject_new` TO `InstructorSubject`;
RENAME TABLE `Section_new` TO `Section`;

-- Add foreign key constraints
ALTER TABLE `Section` ADD CONSTRAINT `Section_instructorSubjectId_fkey` FOREIGN KEY (`instructorSubjectId`) REFERENCES `InstructorSubject`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `InstructorSubject` ADD CONSTRAINT `InstructorSubject_instructorId_fkey` FOREIGN KEY (`instructorId`) REFERENCES `Instructor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `InstructorSubject` ADD CONSTRAINT `InstructorSubject_subjectId_fkey` FOREIGN KEY (`subjectId`) REFERENCES `Subject`(`subjectID`) ON DELETE RESTRICT ON UPDATE CASCADE;