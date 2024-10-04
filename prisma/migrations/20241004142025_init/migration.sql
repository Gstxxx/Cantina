/*
  Warnings:

  - You are about to drop the column `created_at` on the `ProductPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `deleted_at` on the `ProductPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `ProductPurchase` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "Auth" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ProductPurchase" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "productId" INTEGER NOT NULL,
    "purchaseRecordId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    CONSTRAINT "ProductPurchase_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ProductPurchase_purchaseRecordId_fkey" FOREIGN KEY ("purchaseRecordId") REFERENCES "PurchaseRecord" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ProductPurchase" ("id", "productId", "purchaseRecordId", "quantity") SELECT "id", "productId", "purchaseRecordId", "quantity" FROM "ProductPurchase";
DROP TABLE "ProductPurchase";
ALTER TABLE "new_ProductPurchase" RENAME TO "ProductPurchase";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Auth_email_key" ON "Auth"("email");
