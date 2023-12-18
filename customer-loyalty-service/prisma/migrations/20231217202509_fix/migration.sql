/*
  Warnings:

  - You are about to drop the column `points` on the `Order` table. All the data in the column will be lost.
  - The primary key for the `EventLog` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "totalOrderAmount" INTEGER,
    "customerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" DATETIME,
    "returnedAt" DATETIME,
    CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("createdAt", "customerId", "deletedAt", "id", "returnedAt", "totalOrderAmount") SELECT "createdAt", "customerId", "deletedAt", "id", "returnedAt", "totalOrderAmount" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE TABLE "new_EventLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventTime" DATETIME NOT NULL,
    "eventName" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "payload" TEXT NOT NULL,
    "customerId" TEXT,
    "orderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" DATETIME
);
INSERT INTO "new_EventLog" ("createdAt", "customerId", "entityName", "eventName", "eventTime", "id", "lockedAt", "orderId", "payload", "processed", "sequence") SELECT "createdAt", "customerId", "entityName", "eventName", "eventTime", "id", "lockedAt", "orderId", "payload", "processed", "sequence" FROM "EventLog";
DROP TABLE "EventLog";
ALTER TABLE "new_EventLog" RENAME TO "EventLog";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
