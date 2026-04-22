/*
  Warnings:

  - You are about to drop the column `passwordHash` on the `Usuario` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nombre]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `password` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Articulo` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Usuario` DROP COLUMN `passwordHash`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `password` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Usuario_nombre_key` ON `Usuario`(`nombre`);
