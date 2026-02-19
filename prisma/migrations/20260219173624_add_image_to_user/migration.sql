/*
  Warnings:

  - You are about to drop the column `image` on the `books` table. All the data in the column will be lost.
  - You are about to drop the column `releaseDate` on the `books` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "books" DROP COLUMN "image",
DROP COLUMN "releaseDate",
ADD COLUMN     "coverSource" TEXT,
ADD COLUMN     "coverUrl" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "image" TEXT;
