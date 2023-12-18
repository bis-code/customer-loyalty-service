-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EventLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
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
