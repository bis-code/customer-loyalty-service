/*
  Warnings:

  - You are about to drop the column `customerId` on the `EventLog` table. All the data in the column will be lost.
  - You are about to drop the column `orderId` on the `EventLog` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EventLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "eventTime" DATETIME NOT NULL,
    "eventName" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "payload" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" DATETIME
);
INSERT INTO "new_EventLog" ("createdAt", "entityName", "eventName", "eventTime", "id", "lockedAt", "payload", "processed", "sequence") SELECT "createdAt", "entityName", "eventName", "eventTime", "id", "lockedAt", "payload", "processed", "sequence" FROM "EventLog";
DROP TABLE "EventLog";
ALTER TABLE "new_EventLog" RENAME TO "EventLog";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
