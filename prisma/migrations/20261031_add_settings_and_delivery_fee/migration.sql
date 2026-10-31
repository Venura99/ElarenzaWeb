-- CreateTable
CREATE TABLE "Setting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN "deliveryFee" REAL NOT NULL DEFAULT 0;
