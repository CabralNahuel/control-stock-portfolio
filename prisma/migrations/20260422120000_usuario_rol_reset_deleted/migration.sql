-- Campos de Usuario presentes en schema.prisma pero ausentes en migraciones anteriores
ALTER TABLE `Usuario`
    ADD COLUMN `rol` VARCHAR(191) NOT NULL DEFAULT 'EMPLEADO',
    ADD COLUMN `resetToken` VARCHAR(191) NULL,
    ADD COLUMN `resetTokenExpires` DATETIME(3) NULL,
    ADD COLUMN `passwordUpdatedAt` DATETIME(3) NULL,
    ADD COLUMN `deletedAt` DATETIME(3) NULL;
