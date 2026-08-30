-- CreateTable
CREATE TABLE "Records" (
    "id" SERIAL NOT NULL,
    "pkg" TEXT NOT NULL,
    "amount" TEXT NOT NULL,
    "when" BIGINT NOT NULL,
    "screen" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Records_pkey" PRIMARY KEY ("id")
);
