import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Seed Nigerian banks
  const banks = [
    { name: 'Access Bank', code: '044' },
    { name: 'Guaranty Trust Bank', code: '058' },
    { name: 'United Bank for Africa', code: '033' },
    { name: 'Zenith Bank', code: '057' },
    { name: 'First Bank of Nigeria', code: '011' },
    { name: 'Fidelity Bank', code: '070' },
    { name: 'Ecobank Nigeria', code: '050' },
    { name: 'Diamond Bank', code: '063' },
    { name: 'Polaris Bank', code: '076' },
    { name: 'Union Bank of Nigeria', code: '032' },
    { name: 'Stanbic IBTC Bank', code: '221' },
    { name: 'Sterling Bank', code: '232' },
    { name: 'Wema Bank', code: '035' },
    { name: 'Unity Bank', code: '215' },
    { name: 'Keystone Bank', code: '082' },
  ];

  console.log('Seeding banks...');
  for (const bank of banks) {
    await prisma.bank.upsert({
      where: { code: bank.code },
      update: {},
      create: {
        name: bank.name,
        code: bank.code,
        country: 'NG',
      },
    });
  }

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Seeded ${banks.length} banks`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });