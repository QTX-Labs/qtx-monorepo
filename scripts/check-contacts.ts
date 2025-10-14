import { PrismaClient, ContactType } from '../packages/database/src';

const prisma = new PrismaClient();

async function checkContacts() {
  try {
    const contacts = await prisma.contact.findMany({
      where: {
        type: ContactType.EMISOR,
        organizationId: '3230b39b-f1c9-4575-bbc2-773e753bd343' // ForHuman
      },
      select: {
        id: true,
        name: true,
        businessName: true,
        rfc: true,
        type: true,
        record: true
      }
    });

    console.log('EMISOR Contacts in ForHuman:');
    console.log(JSON.stringify(contacts, null, 2));
  } catch (error) {
    console.error('Error checking contacts:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

checkContacts();
