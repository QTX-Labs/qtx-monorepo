import * as XLSX from 'xlsx';
import { ContactType, PrismaClient } from '../packages/database/src';
import { join } from 'path';

const prisma = new PrismaClient();

async function loadCompanies() {
  try {
    // Get organizationId from command line args or use first organization
    let organizationId = process.argv[2];

    if (!organizationId) {
      const firstOrg = await prisma.organization.findFirst({
        select: { id: true, name: true }
      });

      if (!firstOrg) {
        console.error('No organization found. Please create an organization first.');
        return;
      }

      organizationId = firstOrg.id;
      console.log(`Using organization: ${firstOrg.name} (${organizationId})`);
    }

    // Read the Excel file
    const filePath = join(__dirname, '..', 'RSs.xlsx');
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`Found ${data.length} companies to import`);
    console.log('Sample row:', data[0]);

    // Process each row
    let imported = 0;
    let skipped = 0;

    for (const row of data as any[]) {
      // Map Excel columns to Contact fields (note: Excel has "Razon social" not "Razón social")
      const businessName = row['Razon social']?.toString().trim().substring(0, 255);
      const fiscalAddress = row['Dirección fiscal']?.toString().trim().substring(0, 500);
      const fiscalPostalCode = row['C.P. fiscal']?.toString().trim().substring(0, 16);
      const rfc = row['RFC']?.toString().trim().substring(0, 13);
      const businessActivity = row['Giro']?.toString().trim(); // Text field, no limit
      const taxRegime = row['Régimen fiscal']?.toString().trim().substring(0, 255);

      // Skip if no business name or RFC
      if (!businessName || !rfc) {
        console.log(`Skipping row - missing business name or RFC`);
        skipped++;
        continue;
      }

      // Check if already exists
      const existing = await prisma.contact.findFirst({
        where: {
          rfc: rfc,
          type: ContactType.EMISOR
        }
      });

      if (existing) {
        console.log(`Company ${businessName} (${rfc}) already exists, skipping`);
        skipped++;
        continue;
      }

      // Create contact
      await prisma.contact.create({
        data: {
          type: ContactType.EMISOR,
          businessName,
          name: businessName, // Use business name as commercial name initially
          fiscalAddress,
          fiscalPostalCode,
          rfc,
          businessActivity,
          taxRegime,
          organizationId
        }
      });

      console.log(`✓ Imported ${businessName} (${rfc})`);
      imported++;
    }

    console.log('\n=== Import Summary ===');
    console.log(`Total rows: ${data.length}`);
    console.log(`Imported: ${imported}`);
    console.log(`Skipped: ${skipped}`);

  } catch (error) {
    console.error('Error loading companies:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

loadCompanies();
