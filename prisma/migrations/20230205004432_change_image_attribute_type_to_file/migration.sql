/*
  Warnings:

  - The values [Image] on the enum `AttributeType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AttributeType_new" AS ENUM ('Text', 'Number', 'Boolean', 'Markdown', 'Date', 'Location', 'DatabaseBaseType', 'DatabaseViewType', 'Database', 'Columns', 'User', 'Users', 'SurveyQuestions', 'DatabaseSort', 'File');
ALTER TABLE "Attribute" ALTER COLUMN "type" TYPE "AttributeType_new" USING ("type"::text::"AttributeType_new");
ALTER TYPE "AttributeType" RENAME TO "AttributeType_old";
ALTER TYPE "AttributeType_new" RENAME TO "AttributeType";
DROP TYPE "AttributeType_old";
COMMIT;
