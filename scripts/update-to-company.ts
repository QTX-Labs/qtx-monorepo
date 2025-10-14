import { ContactType, ContactRecord, PrismaClient } from '../packages/database/src';

const prisma = new PrismaClient();

async function updateToCompany() {
  try {
    const result = await prisma.contact.updateMany({
      where: {
        type: ContactType.EMISOR,
        organizationId: '3230b39b-f1c9-4575-bbc2-773e753bd343' // ForHuman
      },
      data: {
        record: ContactRecord.COMPANY
      }
    });

    console.log(`✓ Updated ${result.count} EMISOR contacts to COMPANY record type`);
  } catch (error) {
    console.error('Error updating contacts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updateToCompany();
