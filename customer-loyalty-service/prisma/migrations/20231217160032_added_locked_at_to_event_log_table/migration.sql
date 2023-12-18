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
    "customerId" TEXT,
    "orderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lockedAt" DATETIME,
    CONSTRAINT "EventLog_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "EventLog_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_EventLog" ("createdAt", "customerId", "entityName", "eventName", "eventTime", "id", "orderId", "payload", "sequence") SELECT "createdAt", "customerId", "entityName", "eventName", "eventTime", "id", "orderId", "payload", "sequence" FROM "EventLog";
DROP TABLE "EventLog";
ALTER TABLE "new_EventLog" RENAME TO "EventLog";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
