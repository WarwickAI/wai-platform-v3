/*
  Warnings:

  - You are about to drop the column `url` on the `File` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[uuid]` on the table `File` will be added. If there are existing duplicate values, this will fail.
  - The required column `uuid` was added to the `File` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "url",
ADD COLUMN     "uuid" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "File_uuid_key" ON "File"("uuid");
