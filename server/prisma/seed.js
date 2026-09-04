export const seedCustomers = [
  { id: 'c1', name: 'Ahmed Nuur', phone: '+252 61 234 5567', isRukun: true, notes: 'VIP Regular' },
  { id: 'c2', name: 'Faadumo Cali', phone: '+252 61 887 2210', isRukun: false, notes: 'Pays weekly' },
  { id: 'c3', name: 'Cabdi Warsame', phone: '+252 63 445 9080', isRukun: true, notes: 'Monthly settlement' },
  { id: 'c4', name: 'Hodan Ismaaciil', phone: '+252 61 300 4412', isRukun: false, notes: '' },
  { id: 'c5', name: 'Yuusuf Maxamed', phone: '+252 61 774 1188', isRukun: true, notes: 'Bakery supplier' },
  { id: 'c6', name: 'Sagal Xasan', phone: '+252 62 119 6733', isRukun: false, notes: 'Call before closing' },
  { id: 'c7', name: 'Liibaan Cabdulle', phone: '+252 61 552 0491', isRukun: true, notes: 'Office team' },
  { id: 'c8', name: 'Nasteexo Jaamac', phone: '+252 61 908 3376', isRukun: false, notes: "Owner's guest" }
];

export const seedRecords = [
  { id: 'r1', customerId: 'c1', foodDescription: 'Bariis + Hilib Ari', amount: 8, paidAmount: 5, remainingAmount: 3, status: 'PARTIAL', dueDate: '2026-09-02', dueTime: '18:00', notes: 'Lunch' },
  { id: 'r2', customerId: 'c1', foodDescription: 'Basto + Casiir', amount: 12, paidAmount: 0, remainingAmount: 12, status: 'OVERDUE', dueDate: '2026-08-29', dueTime: '19:00', notes: '' },
  { id: 'r3', customerId: 'c1', foodDescription: "Bariis + Hilib Lo'aad", amount: 10, paidAmount: 0, remainingAmount: 10, status: 'UNPAID', dueDate: '2026-09-08', dueTime: '18:00', notes: '' },
  { id: 'r4', customerId: 'c2', foodDescription: 'Suqaar + Sabaayad', amount: 9, paidAmount: 9, remainingAmount: 0, status: 'PAID', dueDate: '', dueTime: '', notes: '' },
  { id: 'r5', customerId: 'c2', foodDescription: 'Canjeero + Shaah', amount: 4, paidAmount: 4, remainingAmount: 0, status: 'PAID', dueDate: '', dueTime: '', notes: '' },
  { id: 'r6', customerId: 'c3', foodDescription: 'Digaag + Bariis', amount: 11, paidAmount: 3, remainingAmount: 8, status: 'OVERDUE', dueDate: '2026-08-28', dueTime: '20:00', notes: 'Promised after payday' },
  { id: 'r7', customerId: 'c3', foodDescription: 'Sambuus + Casiir', amount: 5, paidAmount: 0, remainingAmount: 5, status: 'UNPAID', dueDate: '2026-09-10', dueTime: '13:00', notes: 'Takeaway' },
  { id: 'r8', customerId: 'c4', foodDescription: 'Malawax + Shaah', amount: 4, paidAmount: 0, remainingAmount: 4, status: 'OVERDUE', dueDate: '2026-09-01', dueTime: '18:00', notes: '' },
  { id: 'r9', customerId: 'c5', foodDescription: 'Hilib Shiilan + Bariis', amount: 14, paidAmount: 14, remainingAmount: 0, status: 'PAID', dueDate: '', dueTime: '', notes: '' },
  { id: 'r10', customerId: 'c5', foodDescription: 'Basto Hilib', amount: 9, paidAmount: 4, remainingAmount: 5, status: 'UNPAID', dueDate: '2026-09-09', dueTime: '17:30', notes: '' },
  { id: 'r11', customerId: 'c6', foodDescription: 'Suqaar + Casiir', amount: 10, paidAmount: 0, remainingAmount: 10, status: 'OVERDUE', dueDate: '2026-08-27', dueTime: '18:00', notes: 'Call before closing' },
  { id: 'r12', customerId: 'c6', foodDescription: 'Bariis + Kalluun', amount: 12, paidAmount: 6, remainingAmount: 6, status: 'PARTIAL', dueDate: '2026-09-11', dueTime: '19:00', notes: '' },
  { id: 'r13', customerId: 'c7', foodDescription: 'Canjeero + Beer', amount: 7, paidAmount: 7, remainingAmount: 0, status: 'PAID', dueDate: '', dueTime: '', notes: '' },
  { id: 'r14', customerId: 'c8', foodDescription: 'Digaag Duban', amount: 13, paidAmount: 0, remainingAmount: 13, status: 'UNPAID', dueDate: '2026-09-07', dueTime: '18:00', notes: "Owner's guest" }
];

export const seedPayments = [
  { id: 'p1', customerId: 'c1', creditRecordId: 'r1', amount: 5, notes: 'Cash' },
  { id: 'p2', customerId: 'c3', creditRecordId: 'r6', amount: 3, notes: 'Cash' },
  { id: 'p3', customerId: 'c5', creditRecordId: 'r10', amount: 4, notes: 'EVC Plus' },
  { id: 'p4', customerId: 'c6', creditRecordId: 'r12', amount: 6, notes: 'EVC Plus' }
];

export const seedProfile = {
  id: 'profile_default',
  restaurantName: 'Sahafi Restaurant',
  phone: '+252 61 555 0100',
  address: 'KM4, Maka Al-Mukarama, Mogadishu, Somalia',
  currency: '$',
  defaultLanguage: 'so',
  logo: ''
};

async function main() {
  console.log('Seeding Sahafi Rent Book PostgreSQL database via Prisma...');

  // Upsert profile
  await prisma.restaurantProfile.upsert({
    where: { id: seedProfile.id },
    update: seedProfile,
    create: seedProfile
  });

  // Seed customers
  for (const c of seedCustomers) {
    await prisma.customer.upsert({
      where: { id: c.id },
      update: { name: c.name, phone: c.phone, isRukun: c.isRukun, notes: c.notes },
      create: c
    });
  }

  // Seed credit records
  for (const r of seedRecords) {
    await prisma.creditRecord.upsert({
      where: { id: r.id },
      update: {
        foodDescription: r.foodDescription,
        amount: r.amount,
        paidAmount: r.paidAmount,
        remainingAmount: r.remainingAmount,
        status: r.status,
        dueDate: r.dueDate,
        dueTime: r.dueTime,
        notes: r.notes
      },
      create: {
        id: r.id,
        customerId: r.customerId,
        foodDescription: r.foodDescription,
        amount: r.amount,
        paidAmount: r.paidAmount,
        remainingAmount: r.remainingAmount,
        status: r.status,
        dueDate: r.dueDate,
        dueTime: r.dueTime,
        notes: r.notes
      }
    });
  }

  // Seed payments
  for (const p of seedPayments) {
    await prisma.payment.upsert({
      where: { id: p.id },
      update: { amount: p.amount, notes: p.notes },
      create: {
        id: p.id,
        customerId: p.customerId,
        creditRecordId: p.creditRecordId,
        amount: p.amount,
        notes: p.notes
      }
    });
  }

  console.log('Database successfully seeded!');
}

export async function runPrismaSeed() {
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();
  try {
    await main(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

if (process.argv[1]?.endsWith('seed.js')) {
  runPrismaSeed().catch(console.error);
}
