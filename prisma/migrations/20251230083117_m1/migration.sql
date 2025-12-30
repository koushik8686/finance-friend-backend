/*
  Warnings:

  - You are about to drop the column `createdAT` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `updatdAT` on the `User` table. All the data in the column will be lost.
  - Added the required column `updatdAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "createdAT",
DROP COLUMN "updatdAT",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatdAt" TIMESTAMP(3) NOT NULL;
