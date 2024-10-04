/*
  Warnings:

  - Added the required column `name` to the `Auth` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Auth" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'Customer'
);
INSERT INTO "new_Auth" ("email", "id", "password", "type") SELECT "email", "id", "password", "type" FROM "Auth";
DROP TABLE "Auth";
ALTER TABLE "new_Auth" RENAME TO "Auth";
CREATE UNIQUE INDEX "Auth_email_key" ON "Auth"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
