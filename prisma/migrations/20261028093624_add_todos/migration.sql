-- CreateTable
CREATE TABLE "todos" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "todos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "todos_createdAt_idx" ON "todos"("createdAt");
