-- Add usuarioId to Compra (who registered the purchase)
ALTER TABLE `Compra` ADD COLUMN `usuarioId` INTEGER NULL;
CREATE INDEX `Compra_usuarioId_fkey` ON `Compra`(`usuarioId`);
ALTER TABLE `Compra` ADD CONSTRAINT `Compra_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Remove observacion from Retiro
ALTER TABLE `Retiro` DROP COLUMN `observacion`;
