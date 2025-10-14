-- CreateEnum
CREATE TYPE "SalaryFrequency" AS ENUM ('daily', 'weekly', 'biweekly', 'monthly');

-- CreateEnum
CREATE TYPE "BorderZone" AS ENUM ('fronteriza', 'no_fronteriza');

-- CreateEnum
CREATE TYPE "GratificationType" AS ENUM ('days', 'pesos');

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

