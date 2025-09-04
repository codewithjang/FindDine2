/*
  Warnings:

  - You are about to drop the column `name` on the `restaurant` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `restaurant` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[email]` on the table `Restaurant` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `foodType` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restaurantName` to the `Restaurant` table without a default value. This is not possible if the table is not empty.
  - Made the column `phone` on table `restaurant` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `Restaurant_name_key` ON `restaurant`;

-- AlterTable
ALTER TABLE `restaurant` DROP COLUMN `name`,
    DROP COLUMN `website`,
    ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `facilities` JSON NULL,
    ADD COLUMN `foodType` VARCHAR(191) NOT NULL,
    ADD COLUMN `latitude` DOUBLE NULL,
    ADD COLUMN `lifestyles` JSON NULL,
    ADD COLUMN `locationStyles` JSON NULL,
    ADD COLUMN `longitude` DOUBLE NULL,
    ADD COLUMN `nearbyPlaces` VARCHAR(191) NULL,
    ADD COLUMN `password` VARCHAR(191) NOT NULL,
    ADD COLUMN `paymentOptions` JSON NULL,
    ADD COLUMN `photos` JSON NULL,
    ADD COLUMN `priceRange` INTEGER NULL,
    ADD COLUMN `restaurantName` VARCHAR(191) NOT NULL,
    ADD COLUMN `serviceOptions` JSON NULL,
    ADD COLUMN `startingPrice` INTEGER NULL,
    MODIFY `phone` VARCHAR(191) NOT NULL,
    MODIFY `description` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Restaurant_email_key` ON `Restaurant`(`email`);
