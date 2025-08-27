-- AlterTable
ALTER TABLE `admin` MODIFY `username` VARCHAR(255) NOT NULL DEFAULT 'admin',
    MODIFY `password` VARCHAR(255) NOT NULL DEFAULT 'admin';
