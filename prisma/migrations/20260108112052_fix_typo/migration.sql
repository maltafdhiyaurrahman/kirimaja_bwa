/*
  Warnings:

  - You are about to drop the column `destination_longtitude` on the `shipment_details` table. All the data in the column will be lost.
  - You are about to drop the column `longtitude` on the `user_addresses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `shipment_details` DROP COLUMN `destination_longtitude`,
    ADD COLUMN `destination_longitude` DOUBLE NULL;

-- AlterTable
ALTER TABLE `user_addresses` DROP COLUMN `longtitude`,
    ADD COLUMN `longitude` DOUBLE NULL;
