-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('ACTIVE', 'INVITED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('BIRTHDAY', 'ANNIVERSARY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "ChannelType" AS ENUM ('EMAIL', 'SMS');

-- CreateEnum
CREATE TYPE "SendStatus" AS ENUM ('PENDING', 'QUEUED', 'SENT', 'DELIVERED', 'FAILED', 'BOUNCED');

-- CreateEnum
CREATE TYPE "LinkPurpose" AS ENUM ('SELF_UPDATE', 'MEMBER_INVITE', 'GROUP_OPEN', 'HELPER_PROPOSE');

-- CreateEnum
CREATE TYPE "ProposalStatus" AS ENUM ('PENDING', 'APPROVED', 'DENIED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('ONE_TAP_TREAT', 'POT_CONTRIBUTION');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'FULFILLED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PotStatus" AS ENUM ('OPEN', 'CLOSED', 'FULFILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ContributionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifiedAt" TIMESTAMP(3),
    "phone" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "phoneVerifiedAt" TIMESTAMP(3),
    "defaultTimezone" TEXT NOT NULL DEFAULT 'UTC',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "groups" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "defaultTimezone" TEXT NOT NULL DEFAULT 'UTC',
    "quietHours" JSONB,
    "leapDayPolicy" TEXT NOT NULL DEFAULT 'FEB_28',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT,
    "contactId" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL DEFAULT 'MEMBER',
    "status" "MembershipStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "timezone" TEXT,
    "photoUrl" TEXT,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "type" "EventType" NOT NULL,
    "title" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "yearKnown" BOOLEAN NOT NULL DEFAULT true,
    "repeat" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reminder_rules" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "offsets" INTEGER[],
    "channels" JSONB NOT NULL,
    "sendHour" INTEGER NOT NULL DEFAULT 9,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminder_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_sends" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "offset" INTEGER NOT NULL,
    "channel" "ChannelType" NOT NULL,
    "dueAtUtc" TIMESTAMP(3) NOT NULL,
    "status" "SendStatus" NOT NULL DEFAULT 'PENDING',
    "idempotencyKey" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3),
    "failedAt" TIMESTAMP(3),
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_sends_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "send_logs" (
    "id" TEXT NOT NULL,
    "scheduledSendId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerMessageId" TEXT,
    "status" "SendStatus" NOT NULL,
    "error" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "send_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppressions" (
    "id" TEXT NOT NULL,
    "channel" "ChannelType" NOT NULL,
    "identifier" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suppressions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "groupId" TEXT,
    "method" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "diffJson" JSONB,
    "rolledBackAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wish_wall_messages" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "authorName" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "emoji" TEXT,
    "moderatedAt" TIMESTAMP(3),
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wish_wall_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invite_links" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "membershipId" TEXT,
    "tokenHash" TEXT NOT NULL,
    "purpose" "LinkPurpose" NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "passcode" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invite_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proposed_changes" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "proposedBy" TEXT NOT NULL,
    "changesJson" JSONB NOT NULL,
    "status" "ProposalStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "proposed_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nudge_circles" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "members" TEXT[],
    "deadlineHour" INTEGER NOT NULL DEFAULT 18,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nudge_circles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nudge_acks" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "ackedBy" TEXT NOT NULL,
    "ackedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "nudge_acks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "celebrantContactId" TEXT NOT NULL,
    "type" "OrderType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "stripePaymentIntentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "refundedAt" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_items" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,

    CONSTRAINT "order_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pots" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "celebrantContactId" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "goalAmount" INTEGER,
    "deadlineAtUtc" TIMESTAMP(3) NOT NULL,
    "status" "PotStatus" NOT NULL DEFAULT 'OPEN',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "fulfilledAt" TIMESTAMP(3),

    CONSTRAINT "pots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pot_contributions" (
    "id" TEXT NOT NULL,
    "potId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL,
    "status" "ContributionStatus" NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pot_contributions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");

-- CreateIndex
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- CreateIndex
CREATE INDEX "sessions_token_idx" ON "sessions"("token");

-- CreateIndex
CREATE INDEX "sessions_expiresAt_idx" ON "sessions"("expiresAt");

-- CreateIndex
CREATE INDEX "accounts_userId_idx" ON "accounts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE INDEX "verification_codes_userId_type_idx" ON "verification_codes"("userId", "type");

-- CreateIndex
CREATE INDEX "verification_codes_expiresAt_idx" ON "verification_codes"("expiresAt");

-- CreateIndex
CREATE INDEX "groups_ownerId_idx" ON "groups"("ownerId");

-- CreateIndex
CREATE INDEX "groups_ownerId_createdAt_idx" ON "groups"("ownerId", "createdAt");

-- CreateIndex
CREATE INDEX "groups_deletedAt_idx" ON "groups"("deletedAt");

-- CreateIndex
CREATE INDEX "memberships_groupId_idx" ON "memberships"("groupId");

-- CreateIndex
CREATE INDEX "memberships_userId_idx" ON "memberships"("userId");

-- CreateIndex
CREATE INDEX "memberships_groupId_userId_idx" ON "memberships"("groupId", "userId");

-- CreateIndex
CREATE INDEX "memberships_groupId_status_idx" ON "memberships"("groupId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "memberships_groupId_contactId_key" ON "memberships"("groupId", "contactId");

-- CreateIndex
CREATE INDEX "contacts_email_idx" ON "contacts"("email");

-- CreateIndex
CREATE INDEX "contacts_phone_idx" ON "contacts"("phone");

-- CreateIndex
CREATE INDEX "contacts_deletedAt_idx" ON "contacts"("deletedAt");

-- CreateIndex
CREATE INDEX "events_contactId_idx" ON "events"("contactId");

-- CreateIndex
CREATE INDEX "events_contactId_type_idx" ON "events"("contactId", "type");

-- CreateIndex
CREATE INDEX "events_date_idx" ON "events"("date");

-- CreateIndex
CREATE INDEX "events_deletedAt_idx" ON "events"("deletedAt");

-- CreateIndex
CREATE INDEX "reminder_rules_groupId_idx" ON "reminder_rules"("groupId");

-- CreateIndex
CREATE UNIQUE INDEX "scheduled_sends_idempotencyKey_key" ON "scheduled_sends"("idempotencyKey");

-- CreateIndex
CREATE INDEX "scheduled_sends_dueAtUtc_status_idx" ON "scheduled_sends"("dueAtUtc", "status");

-- CreateIndex
CREATE INDEX "scheduled_sends_status_dueAtUtc_idx" ON "scheduled_sends"("status", "dueAtUtc");

-- CreateIndex
CREATE INDEX "scheduled_sends_eventId_idx" ON "scheduled_sends"("eventId");

-- CreateIndex
CREATE INDEX "scheduled_sends_eventId_targetDate_idx" ON "scheduled_sends"("eventId", "targetDate");

-- CreateIndex
CREATE INDEX "scheduled_sends_idempotencyKey_idx" ON "scheduled_sends"("idempotencyKey");

-- CreateIndex
CREATE INDEX "scheduled_sends_status_idx" ON "scheduled_sends"("status");

-- CreateIndex
CREATE INDEX "send_logs_scheduledSendId_idx" ON "send_logs"("scheduledSendId");

-- CreateIndex
CREATE INDEX "send_logs_provider_status_idx" ON "send_logs"("provider", "status");

-- CreateIndex
CREATE INDEX "send_logs_createdAt_idx" ON "send_logs"("createdAt");

-- CreateIndex
CREATE INDEX "suppressions_identifier_channel_idx" ON "suppressions"("identifier", "channel");

-- CreateIndex
CREATE INDEX "suppressions_channel_idx" ON "suppressions"("channel");

-- CreateIndex
CREATE UNIQUE INDEX "suppressions_identifier_channel_key" ON "suppressions"("identifier", "channel");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_createdAt_idx" ON "audit_logs"("actorId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_groupId_idx" ON "audit_logs"("groupId");

-- CreateIndex
CREATE INDEX "audit_logs_entity_createdAt_idx" ON "audit_logs"("entity", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "wish_wall_messages_eventId_idx" ON "wish_wall_messages"("eventId");

-- CreateIndex
CREATE INDEX "wish_wall_messages_createdAt_idx" ON "wish_wall_messages"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "invite_links_tokenHash_key" ON "invite_links"("tokenHash");

-- CreateIndex
CREATE INDEX "invite_links_groupId_idx" ON "invite_links"("groupId");

-- CreateIndex
CREATE INDEX "invite_links_tokenHash_idx" ON "invite_links"("tokenHash");

-- CreateIndex
CREATE INDEX "invite_links_expiresAt_idx" ON "invite_links"("expiresAt");

-- CreateIndex
CREATE INDEX "proposed_changes_contactId_idx" ON "proposed_changes"("contactId");

-- CreateIndex
CREATE INDEX "proposed_changes_proposedBy_idx" ON "proposed_changes"("proposedBy");

-- CreateIndex
CREATE INDEX "proposed_changes_status_createdAt_idx" ON "proposed_changes"("status", "createdAt");

-- CreateIndex
CREATE INDEX "nudge_circles_eventId_idx" ON "nudge_circles"("eventId");

-- CreateIndex
CREATE INDEX "nudge_acks_eventId_targetDate_idx" ON "nudge_acks"("eventId", "targetDate");

-- CreateIndex
CREATE UNIQUE INDEX "orders_stripePaymentIntentId_key" ON "orders"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "orders_buyerId_idx" ON "orders"("buyerId");

-- CreateIndex
CREATE INDEX "orders_buyerId_createdAt_idx" ON "orders"("buyerId", "createdAt");

-- CreateIndex
CREATE INDEX "orders_status_createdAt_idx" ON "orders"("status", "createdAt");

-- CreateIndex
CREATE INDEX "orders_stripePaymentIntentId_idx" ON "orders"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "order_items_orderId_idx" ON "order_items"("orderId");

-- CreateIndex
CREATE INDEX "pots_eventId_idx" ON "pots"("eventId");

-- CreateIndex
CREATE INDEX "pots_status_deadlineAtUtc_idx" ON "pots"("status", "deadlineAtUtc");

-- CreateIndex
CREATE INDEX "pots_createdBy_idx" ON "pots"("createdBy");

-- CreateIndex
CREATE UNIQUE INDEX "pot_contributions_stripePaymentIntentId_key" ON "pot_contributions"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "pot_contributions_potId_idx" ON "pot_contributions"("potId");

-- CreateIndex
CREATE INDEX "pot_contributions_buyerId_idx" ON "pot_contributions"("buyerId");

-- CreateIndex
CREATE INDEX "pot_contributions_status_idx" ON "pot_contributions"("status");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_codes" ADD CONSTRAINT "verification_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "groups" ADD CONSTRAINT "groups_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reminder_rules" ADD CONSTRAINT "reminder_rules_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scheduled_sends" ADD CONSTRAINT "scheduled_sends_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "send_logs" ADD CONSTRAINT "send_logs_scheduledSendId_fkey" FOREIGN KEY ("scheduledSendId") REFERENCES "scheduled_sends"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wish_wall_messages" ADD CONSTRAINT "wish_wall_messages_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invite_links" ADD CONSTRAINT "invite_links_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposed_changes" ADD CONSTRAINT "proposed_changes_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "proposed_changes" ADD CONSTRAINT "proposed_changes_proposedBy_fkey" FOREIGN KEY ("proposedBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nudge_circles" ADD CONSTRAINT "nudge_circles_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_celebrantContactId_fkey" FOREIGN KEY ("celebrantContactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pots" ADD CONSTRAINT "pots_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pots" ADD CONSTRAINT "pots_celebrantContactId_fkey" FOREIGN KEY ("celebrantContactId") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pot_contributions" ADD CONSTRAINT "pot_contributions_potId_fkey" FOREIGN KEY ("potId") REFERENCES "pots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pot_contributions" ADD CONSTRAINT "pot_contributions_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
