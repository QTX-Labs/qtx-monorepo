-- CreateEnum
CREATE TYPE "ContactType" AS ENUM ('emisor', 'receptor');

-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "type" "ContactType",
ADD COLUMN     "businessName" VARCHAR(255),
ADD COLUMN     "fiscalAddress" VARCHAR(500),
ADD COLUMN     "fiscalPostalCode" VARCHAR(16),
ADD COLUMN     "rfc" VARCHAR(13),
ADD COLUMN     "businessActivity" TEXT,
ADD COLUMN     "taxRegime" VARCHAR(255);
