-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('create', 'update', 'delete');

-- CreateEnum
CREATE TYPE "ActorType" AS ENUM ('system', 'member', 'api');

-- CreateEnum
CREATE TYPE "ContactRecord" AS ENUM ('person', 'company');

-- CreateEnum
CREATE TYPE "ContactStage" AS ENUM ('lead', 'qualified', 'opportunity', 'proposal', 'inNegotiation', 'lost', 'won');

-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('emisor', 'receptor');

-- CreateEnum
CREATE TYPE "ContactTaskStatus" AS ENUM ('open', 'completed');

-- CreateEnum
CREATE TYPE "DayOfWeek" AS ENUM ('sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday');

-- CreateEnum
CREATE TYPE "FeedbackCategory" AS ENUM ('suggestion', 'problem', 'question');

-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('pending', 'accepted', 'revoked');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('member', 'admin');

-- CreateEnum
CREATE TYPE "WebhookTrigger" AS ENUM ('contactCreated', 'contactUpdated', 'contactDeleted');

-- CreateEnum
CREATE TYPE "SalaryFrequency" AS ENUM ('daily', 'weekly', 'biweekly', 'monthly');

-- CreateEnum
CREATE TYPE "BorderZone" AS ENUM ('fronteriza', 'no_fronteriza');

-- CreateEnum
CREATE TYPE "GratificationType" AS ENUM ('days', 'pesos');

-- CreateTable
CREATE TABLE "Account" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
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

    CONSTRAINT "PK_Account" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "description" VARCHAR(70) NOT NULL,
    "hashedKey" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_ApiKey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthenticatorApp" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "accountName" VARCHAR(255) NOT NULL,
    "issuer" VARCHAR(255) NOT NULL,
    "secret" VARCHAR(255) NOT NULL,
    "recoveryCodes" VARCHAR(1024) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_AuthenticatorApp" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChangeEmailRequest" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "valid" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_ChangeEmailRequest" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "record" "ContactRecord" NOT NULL DEFAULT 'person',
    "type" "ContactType",
    "image" VARCHAR(2048),
    "name" VARCHAR(255) NOT NULL,
    "businessName" VARCHAR(255),
    "email" VARCHAR(255),
    "address" VARCHAR(255),
    "fiscalAddress" VARCHAR(500),
    "fiscalPostalCode" VARCHAR(16),
    "rfc" VARCHAR(13),
    "businessActivity" TEXT,
    "taxRegime" VARCHAR(255),
    "phone" VARCHAR(32),
    "stage" "ContactStage" NOT NULL DEFAULT 'lead',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Contact" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactActivity" (
    "id" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "actionType" "ActionType" NOT NULL,
    "actorId" VARCHAR(255) NOT NULL,
    "actorType" "ActorType" NOT NULL,
    "metadata" JSONB,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_ContactActivity" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactComment" (
    "id" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "text" VARCHAR(2000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_ContactComment" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactImage" (
    "id" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "data" BYTEA,
    "contentType" VARCHAR(255),
    "hash" VARCHAR(64),

    CONSTRAINT "PK_ContactImage" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactNote" (
    "id" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "text" VARCHAR(8000),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_ContactNote" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactPageVisit" (
    "id" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "userId" UUID,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_ContactPageVisit" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactTag" (
    "id" UUID NOT NULL,
    "text" VARCHAR(128) NOT NULL,

    CONSTRAINT "PK_ContactTag" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContactTask" (
    "id" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(8000),
    "status" "ContactTaskStatus" NOT NULL DEFAULT 'open',
    "dueDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_ContactTask" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favorite" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "contactId" UUID NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PK_Favorite" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID,
    "category" "FeedbackCategory" NOT NULL DEFAULT 'suggestion',
    "message" VARCHAR(4000) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Feedback" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invitation" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "token" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'member',
    "status" "InvitationStatus" NOT NULL DEFAULT 'pending',
    "lastSentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Invitation" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'member',
    "isOwner" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_Membership" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "subject" VARCHAR(128),
    "content" VARCHAR(8000) NOT NULL,
    "link" VARCHAR(2000),
    "seenAt" TIMESTAMP(3),
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Notification" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "organizationId" UUID NOT NULL,
    "status" VARCHAR(64) NOT NULL,
    "provider" VARCHAR(32) NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "currency" VARCHAR(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Order" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "priceAmount" DOUBLE PRECISION,
    "type" TEXT,
    "model" TEXT,

    CONSTRAINT "PK_OrderItem" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "logo" VARCHAR(2048),
    "name" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255),
    "phone" VARCHAR(32),
    "email" VARCHAR(255),
    "website" VARCHAR(2000),
    "linkedInProfile" VARCHAR(2000),
    "instagramProfile" VARCHAR(2000),
    "youTubeChannel" VARCHAR(2000),
    "xProfile" VARCHAR(2000),
    "tikTokProfile" VARCHAR(2000),
    "facebookPage" VARCHAR(2000),
    "billingCustomerId" TEXT,
    "billingEmail" VARCHAR(255),
    "billingLine1" VARCHAR(255),
    "billingLine2" VARCHAR(255),
    "billingCountry" VARCHAR(3),
    "billingPostalCode" VARCHAR(16),
    "billingCity" VARCHAR(255),
    "billingState" VARCHAR(255),

    CONSTRAINT "PK_Organization" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationLogo" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "data" BYTEA,
    "contentType" VARCHAR(255),
    "hash" VARCHAR(64),

    CONSTRAINT "PK_OrganizationLogo" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResetPasswordRequest" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_ResetPasswordRequest" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" UUID NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" UUID NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Session" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "organizationId" UUID NOT NULL,
    "status" VARCHAR(64) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "provider" VARCHAR(32) NOT NULL,
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "currency" VARCHAR(3) NOT NULL,
    "periodStartsAt" TIMESTAMPTZ(6) NOT NULL,
    "periodEndsAt" TIMESTAMPTZ(6) NOT NULL,
    "trialStartsAt" TIMESTAMPTZ(6),
    "trialEndsAt" TIMESTAMPTZ(6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Subscription" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionItem" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "productId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "priceAmount" DOUBLE PRECISION,
    "interval" TEXT NOT NULL,
    "intervalCount" INTEGER NOT NULL,
    "type" TEXT,
    "model" TEXT,

    CONSTRAINT "PK_SubscriptionItem" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "image" VARCHAR(2048),
    "name" VARCHAR(64) NOT NULL,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "password" VARCHAR(60),
    "lastLogin" TIMESTAMP(3),
    "phone" VARCHAR(32),
    "locale" VARCHAR(8) NOT NULL DEFAULT 'en-US',
    "completedOnboarding" BOOLEAN NOT NULL DEFAULT false,
    "enabledContactsNotifications" BOOLEAN NOT NULL DEFAULT false,
    "enabledInboxNotifications" BOOLEAN NOT NULL DEFAULT false,
    "enabledWeeklySummary" BOOLEAN NOT NULL DEFAULT false,
    "enabledNewsletter" BOOLEAN NOT NULL DEFAULT false,
    "enabledProductUpdates" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_User" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserImage" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "data" BYTEA,
    "contentType" VARCHAR(255),
    "hash" VARCHAR(64),

    CONSTRAINT "PK_UserImage" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Webhook" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "url" VARCHAR(2000) NOT NULL,
    "triggers" "WebhookTrigger"[],
    "secret" VARCHAR(1024),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Webhook" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkHours" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "dayOfWeek" "DayOfWeek" NOT NULL DEFAULT 'sunday',

    CONSTRAINT "PK_WorkHours" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkTimeSlot" (
    "id" UUID NOT NULL,
    "workHoursId" UUID NOT NULL,
    "start" TIME(0) NOT NULL,
    "end" TIME(0) NOT NULL,

    CONSTRAINT "PK_WorkTimeSlot" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "fullName" VARCHAR(255) NOT NULL,
    "rfc" VARCHAR(13),
    "curp" VARCHAR(18),
    "email" VARCHAR(255),
    "phone" VARCHAR(32),
    "address" VARCHAR(500),
    "hireDate" DATE,
    "terminationDate" DATE,
    "currentSalary" DECIMAL(12,2),
    "salaryFrequency" "SalaryFrequency",
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Employee" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finiquito" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "employeeId" UUID,
    "userId" UUID NOT NULL,
    "employeeName" VARCHAR(255) NOT NULL,
    "empresaName" VARCHAR(255) NOT NULL,
    "empresaRFC" VARCHAR(13),
    "clientName" VARCHAR(255) NOT NULL,
    "hireDate" DATE NOT NULL,
    "terminationDate" DATE NOT NULL,
    "salary" DECIMAL(12,2) NOT NULL,
    "salaryFrequency" "SalaryFrequency" NOT NULL,
    "borderZone" "BorderZone" NOT NULL DEFAULT 'no_fronteriza',
    "fiscalDailySalary" DECIMAL(12,2) NOT NULL,
    "realDailySalary" DECIMAL(12,2) NOT NULL,
    "integratedDailySalary" DECIMAL(12,2) NOT NULL,
    "pendingWorkDays" INTEGER NOT NULL DEFAULT 0,
    "aguinaldoDays" INTEGER NOT NULL DEFAULT 15,
    "vacationDays" INTEGER NOT NULL DEFAULT 12,
    "vacationPremiumPercentage" DECIMAL(5,4) NOT NULL DEFAULT 0.25,
    "pendingVacationDays" INTEGER NOT NULL DEFAULT 0,
    "gratificationDays" DECIMAL(12,4),
    "gratificationPesos" DECIMAL(12,2),
    "severanceMonths" INTEGER NOT NULL DEFAULT 0,
    "severanceDaysPerYear" INTEGER NOT NULL DEFAULT 0,
    "severanceTotalFiscal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "severanceTotalReal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "seniorityPremiumFiscal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "seniorityPremiumReal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fiscalAguinaldoFactor" DECIMAL(12,4) NOT NULL,
    "fiscalAguinaldoAmount" DECIMAL(12,2) NOT NULL,
    "fiscalVacationFactor" DECIMAL(12,4) NOT NULL,
    "fiscalVacationAmount" DECIMAL(12,2) NOT NULL,
    "fiscalVacationPremiumFactor" DECIMAL(12,4) NOT NULL,
    "fiscalVacationPremiumAmount" DECIMAL(12,2) NOT NULL,
    "fiscalPendingVacationAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fiscalPendingPremiumAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fiscalWorkedDaysAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fiscalTotalPerceptions" DECIMAL(12,2) NOT NULL,
    "realAguinaldoFactor" DECIMAL(12,4) NOT NULL,
    "realAguinaldoAmount" DECIMAL(12,2) NOT NULL,
    "realVacationFactor" DECIMAL(12,4) NOT NULL,
    "realVacationAmount" DECIMAL(12,2) NOT NULL,
    "realVacationPremiumFactor" DECIMAL(12,4) NOT NULL,
    "realVacationPremiumAmount" DECIMAL(12,2) NOT NULL,
    "realPendingVacationAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "realPendingPremiumAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "realWorkedDaysAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "realGratificationAmount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "realTotalPerceptions" DECIMAL(12,2) NOT NULL,
    "fiscalISR" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fiscalIMSS" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fiscalSubsidy" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fiscalInfonavit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fiscalOtherDeductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fiscalTotalDeductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "realISR" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "realIMSS" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "realSubsidy" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "realInfonavit" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "realOtherDeductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "realTotalDeductions" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "fiscalNetAmount" DECIMAL(12,2) NOT NULL,
    "realNetAmount" DECIMAL(12,2) NOT NULL,
    "totalToPay" DECIMAL(12,2) NOT NULL,
    "daysWorked" INTEGER NOT NULL,
    "yearsWorked" DECIMAL(8,4) NOT NULL,
    "daysFactor" DECIMAL(5,2) NOT NULL DEFAULT 30.4,
    "daysFactorModified" BOOLEAN NOT NULL DEFAULT false,
    "daysFactorModificationReason" TEXT,
    "pdfUrl" VARCHAR(2048),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PK_Finiquito" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FiniquitoAttachment" (
    "id" UUID NOT NULL,
    "finiquitoId" UUID NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "fileUrl" VARCHAR(2048) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "mimeType" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PK_FiniquitoAttachment" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ContactToContactTag" (
    "A" UUID NOT NULL,
    "B" UUID NOT NULL,

    CONSTRAINT "_ContactToContactTag_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "IX_Account_userId" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_hashedKey_key" ON "ApiKey"("hashedKey");

-- CreateIndex
CREATE INDEX "IX_ApiKey_organizationId" ON "ApiKey"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthenticatorApp_userId_key" ON "AuthenticatorApp"("userId");

-- CreateIndex
CREATE INDEX "IX_AuthenticatorApp_userId" ON "AuthenticatorApp"("userId");

-- CreateIndex
CREATE INDEX "IX_ChangeEmailRequest_userId" ON "ChangeEmailRequest"("userId");

-- CreateIndex
CREATE INDEX "IX_Contact_organizationId" ON "Contact"("organizationId");

-- CreateIndex
CREATE INDEX "IX_ContactActivity_contactId" ON "ContactActivity"("contactId");

-- CreateIndex
CREATE INDEX "IX_ContactActivity_occurredAt" ON "ContactActivity"("occurredAt");

-- CreateIndex
CREATE INDEX "IX_ContactComment_contactId" ON "ContactComment"("contactId");

-- CreateIndex
CREATE INDEX "IX_ContactComment_userId" ON "ContactComment"("userId");

-- CreateIndex
CREATE INDEX "IX_ContactImage_contactId" ON "ContactImage"("contactId");

-- CreateIndex
CREATE INDEX "IX_ContactNote_contactId" ON "ContactNote"("contactId");

-- CreateIndex
CREATE INDEX "IX_ContactNote_userId" ON "ContactNote"("userId");

-- CreateIndex
CREATE INDEX "IX_ContactPageVisit_contactId" ON "ContactPageVisit"("contactId");

-- CreateIndex
CREATE INDEX "IX_ContactPageVisit_userId" ON "ContactPageVisit"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ContactTag_text_key" ON "ContactTag"("text");

-- CreateIndex
CREATE INDEX "IX_ContactTask_contactId" ON "ContactTask"("contactId");

-- CreateIndex
CREATE INDEX "IX_Favorite_userId" ON "Favorite"("userId");

-- CreateIndex
CREATE INDEX "IX_Favorite_contactId" ON "Favorite"("contactId");

-- CreateIndex
CREATE INDEX "IX_Feedback_organizationId" ON "Feedback"("organizationId");

-- CreateIndex
CREATE INDEX "IX_Feedback_userId" ON "Feedback"("userId");

-- CreateIndex
CREATE INDEX "IX_Invitation_organizationId" ON "Invitation"("organizationId");

-- CreateIndex
CREATE INDEX "IX_Invitation_token" ON "Invitation"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_organizationId_userId_key" ON "Membership"("organizationId", "userId");

-- CreateIndex
CREATE INDEX "IX_Notification_userId" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "IX_Order_organizationId" ON "Order"("organizationId");

-- CreateIndex
CREATE INDEX "IX_OrderItem_orderId" ON "OrderItem"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_slug_key" ON "Organization"("slug");

-- CreateIndex
CREATE INDEX "IX_Organization_billingCustomerId" ON "Organization"("billingCustomerId");

-- CreateIndex
CREATE INDEX "IX_OrganizationLogo_organizationId" ON "OrganizationLogo"("organizationId");

-- CreateIndex
CREATE INDEX "IX_ResetPasswordRequest_email" ON "ResetPasswordRequest"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "IX_Session_userId" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "IX_Subscription_organizationId" ON "Subscription"("organizationId");

-- CreateIndex
CREATE INDEX "IX_SubscriptionItem_subscriptionId" ON "SubscriptionItem"("subscriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "IX_UserImage_userId" ON "UserImage"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE INDEX "IX_Webhook_organizationId" ON "Webhook"("organizationId");

-- CreateIndex
CREATE INDEX "IX_WorkHours_organizationId" ON "WorkHours"("organizationId");

-- CreateIndex
CREATE INDEX "IX_WorkTimeSlot_workHoursId" ON "WorkTimeSlot"("workHoursId");

-- CreateIndex
CREATE INDEX "IX_Employee_organizationId" ON "Employee"("organizationId");

-- CreateIndex
CREATE INDEX "IX_Employee_fullName" ON "Employee"("fullName");

-- CreateIndex
CREATE INDEX "IX_Employee_rfc" ON "Employee"("rfc");

-- CreateIndex
CREATE INDEX "IX_Finiquito_organizationId" ON "Finiquito"("organizationId");

-- CreateIndex
CREATE INDEX "IX_Finiquito_employeeId" ON "Finiquito"("employeeId");

-- CreateIndex
CREATE INDEX "IX_Finiquito_userId" ON "Finiquito"("userId");

-- CreateIndex
CREATE INDEX "IX_Finiquito_terminationDate" ON "Finiquito"("terminationDate");

-- CreateIndex
CREATE INDEX "IX_Finiquito_employeeName" ON "Finiquito"("employeeName");

-- CreateIndex
CREATE INDEX "IX_FiniquitoAttachment_finiquitoId" ON "FiniquitoAttachment"("finiquitoId");

-- CreateIndex
CREATE INDEX "_ContactToContactTag_B_index" ON "_ContactToContactTag"("B");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApiKey" ADD CONSTRAINT "ApiKey_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthenticatorApp" ADD CONSTRAINT "AuthenticatorApp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangeEmailRequest" ADD CONSTRAINT "ChangeEmailRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactActivity" ADD CONSTRAINT "ContactActivity_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactComment" ADD CONSTRAINT "ContactComment_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactComment" ADD CONSTRAINT "ContactComment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactNote" ADD CONSTRAINT "ContactNote_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactNote" ADD CONSTRAINT "ContactNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPageVisit" ADD CONSTRAINT "ContactPageVisit_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactPageVisit" ADD CONSTRAINT "ContactPageVisit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContactTask" ADD CONSTRAINT "ContactTask_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favorite" ADD CONSTRAINT "Favorite_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionItem" ADD CONSTRAINT "SubscriptionItem_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Webhook" ADD CONSTRAINT "Webhook_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkHours" ADD CONSTRAINT "WorkHours_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkTimeSlot" ADD CONSTRAINT "WorkTimeSlot_workHoursId_fkey" FOREIGN KEY ("workHoursId") REFERENCES "WorkHours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finiquito" ADD CONSTRAINT "Finiquito_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finiquito" ADD CONSTRAINT "Finiquito_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finiquito" ADD CONSTRAINT "Finiquito_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FiniquitoAttachment" ADD CONSTRAINT "FiniquitoAttachment_finiquitoId_fkey" FOREIGN KEY ("finiquitoId") REFERENCES "Finiquito"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactToContactTag" ADD CONSTRAINT "_ContactToContactTag_A_fkey" FOREIGN KEY ("A") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ContactToContactTag" ADD CONSTRAINT "_ContactToContactTag_B_fkey" FOREIGN KEY ("B") REFERENCES "ContactTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

