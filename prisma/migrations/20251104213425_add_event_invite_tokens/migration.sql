-- CreateTable
CREATE TABLE "event_invite_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "event_invite_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "event_invite_tokens_token_key" ON "event_invite_tokens"("token");

-- CreateIndex
CREATE INDEX "event_invite_tokens_token_idx" ON "event_invite_tokens"("token");

-- CreateIndex
CREATE INDEX "event_invite_tokens_contactId_idx" ON "event_invite_tokens"("contactId");

-- CreateIndex
CREATE INDEX "event_invite_tokens_expiresAt_idx" ON "event_invite_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "event_invite_tokens_createdBy_idx" ON "event_invite_tokens"("createdBy");

-- AddForeignKey
ALTER TABLE "event_invite_tokens" ADD CONSTRAINT "event_invite_tokens_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_invite_tokens" ADD CONSTRAINT "event_invite_tokens_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
