-- CreateTable
CREATE TABLE `InstructorSubject` (
    `instructorId` INTEGER NOT NULL,
    `subjectId` INTEGER NOT NULL,
    `assignedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`instructorId`, `subjectId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
