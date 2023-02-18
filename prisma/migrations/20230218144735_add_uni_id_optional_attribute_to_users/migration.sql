/*
  Warnings:

  - A unique constraint covering the columns `[UniID]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "UniID" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_UniID_key" ON "User"("UniID");
