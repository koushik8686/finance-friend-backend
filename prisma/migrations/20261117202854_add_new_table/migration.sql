-- AlterTable
ALTER TABLE "Records" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Events" (
    "id" SERIAL NOT NULL,
    "sender" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "body" JSONB NOT NULL,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("id")
);
