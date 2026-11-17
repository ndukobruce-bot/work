DROP INDEX "Task_listingOrder_key";
ALTER TABLE "Task" RENAME COLUMN "listingOrder" TO "listingOrder";
CREATE UNIQUE INDEX "Task_listingOrder_key" ON "Task"("listingOrder");
ALTER TABLE "Task" DROP COLUMN "isDemo";
ALTER TABLE "User" DROP COLUMN "isShared";
ALTER TABLE "User" ADD COLUMN "accountStatus" TEXT NOT NULL DEFAULT 'ACTIVE';
