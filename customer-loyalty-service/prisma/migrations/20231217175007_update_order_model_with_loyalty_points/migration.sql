-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_LoyaltyPoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "points" INTEGER NOT NULL,
    "spent" INTEGER NOT NULL,
    "consumed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "deletedAt" DATETIME,
    "customerId" TEXT NOT NULL,
    "orderId" TEXT,
    CONSTRAINT "LoyaltyPoint_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LoyaltyPoint_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LoyaltyPoint" ("consumed", "createdAt", "customerId", "deletedAt", "expiresAt", "id", "points", "spent") SELECT "consumed", "createdAt", "customerId", "deletedAt", "expiresAt", "id", "points", "spent" FROM "LoyaltyPoint";
DROP TABLE "LoyaltyPoint";
ALTER TABLE "new_LoyaltyPoint" RENAME TO "LoyaltyPoint";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
