import { seedCustomers, seedRecords, seedPayments, seedProfile } from '../../prisma/seed.js';

let prisma = null;
let usePrisma = false;

// Check if DATABASE_URL is available
if (process.env.DATABASE_URL && !process.env.DATABASE_URL.includes('placeholder')) {
  try {
    const pkg = await import('@prisma/client');
    const PrismaClientClass = pkg.PrismaClient || pkg.default?.PrismaClient;
    if (PrismaClientClass) {
      prisma = new PrismaClientClass();
      usePrisma = true;
      console.log('[DB] Initialized Prisma Client with PostgreSQL DATABASE_URL');
    }
  } catch (err) {
    console.warn('[DB] Prisma initialization warning, using in-memory fallback adapter:', err.message);
    usePrisma = false;
  }
} else {
  console.log('[DB] No DATABASE_URL provided. Operating in-memory with seed data.');
}

// In-Memory fallback store with seeded records for instant preview and local testing
let memoryDb = {
  profile: { ...seedProfile },
  customers: JSON.parse(JSON.stringify(seedCustomers)),
  records: JSON.parse(JSON.stringify(seedRecords)),
  payments: JSON.parse(JSON.stringify(seedPayments))
};

export const getPrisma = () => prisma;
export const isUsingPrisma = () => usePrisma;

export const db = {
  // Profiles
  async getProfile() {
    if (usePrisma) {
      try {
        let p = await prisma.restaurantProfile.findFirst();
        if (!p) {
          p = await prisma.restaurantProfile.create({ data: seedProfile });
        }
        return p;
      } catch (e) {
        console.warn('[DB Fallback] getProfile error, falling back to memory:', e.message);
      }
    }
    return memoryDb.profile;
  },

  async updateProfile(data) {
    if (usePrisma) {
      try {
        const cur = await this.getProfile();
        return await prisma.restaurantProfile.update({
          where: { id: cur.id },
          data
        });
      } catch (e) {
        console.warn('[DB Fallback] updateProfile error, falling back to memory:', e.message);
      }
    }
    memoryDb.profile = { ...memoryDb.profile, ...data, updatedAt: new Date() };
    return memoryDb.profile;
  },

  // Customers
  async getCustomers() {
    if (usePrisma) {
      try {
        return await prisma.customer.findMany({
          include: {
            creditRecords: true,
            payments: true
          },
          orderBy: { createdAt: 'desc' }
        });
      } catch (e) {
        console.warn('[DB Fallback] getCustomers error:', e.message);
      }
    }
    return memoryDb.customers.map(c => ({
      ...c,
      creditRecords: memoryDb.records.filter(r => r.customerId === c.id),
      payments: memoryDb.payments.filter(p => p.customerId === c.id)
    }));
  },

  async getCustomerById(id) {
    if (usePrisma) {
      try {
        return await prisma.customer.findUnique({
          where: { id },
          include: {
            creditRecords: { orderBy: { createdAt: 'desc' } },
            payments: { orderBy: { paymentDate: 'desc' } }
          }
        });
      } catch (e) {
        console.warn('[DB Fallback] getCustomerById error:', e.message);
      }
    }
    const c = memoryDb.customers.find(c => c.id === id);
    if (!c) return null;
    return {
      ...c,
      creditRecords: memoryDb.records.filter(r => r.customerId === id).sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0)),
      payments: memoryDb.payments.filter(p => p.customerId === id).sort((a, b) => new Date(b.paymentDate || 0) - new Date(a.paymentDate || 0))
    };
  },

  async createCustomer(data) {
    if (usePrisma) {
      try {
        return await prisma.customer.create({ data });
      } catch (e) {
        console.warn('[DB Fallback] createCustomer error:', e.message);
      }
    }
    const newCust = {
      id: 'c' + Date.now(),
      name: data.name,
      phone: data.phone || '',
      notes: data.notes || '',
      isRukun: !!data.isRukun,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryDb.customers.push(newCust);
    return newCust;
  },

  async updateCustomer(id, data) {
    if (usePrisma) {
      try {
        return await prisma.customer.update({
          where: { id },
          data
        });
      } catch (e) {
        console.warn('[DB Fallback] updateCustomer error:', e.message);
      }
    }
    const idx = memoryDb.customers.findIndex(c => c.id === id);
    if (idx === -1) return null;
    memoryDb.customers[idx] = { ...memoryDb.customers[idx], ...data, updatedAt: new Date() };
    return memoryDb.customers[idx];
  },

  async deleteCustomer(id) {
    if (usePrisma) {
      try {
        return await prisma.customer.delete({ where: { id } });
      } catch (e) {
        console.warn('[DB Fallback] deleteCustomer error:', e.message);
      }
    }
    memoryDb.customers = memoryDb.customers.filter(c => c.id !== id);
    memoryDb.records = memoryDb.records.filter(r => r.customerId !== id);
    memoryDb.payments = memoryDb.payments.filter(p => p.customerId !== id);
    return { id };
  },

  // Credit Records
  async getRecords(filter = {}) {
    if (usePrisma) {
      try {
        const where = {};
        if (filter.customerId) where.customerId = filter.customerId;
        if (filter.status) where.status = filter.status;
        return await prisma.creditRecord.findMany({
          where,
          include: { customer: true },
          orderBy: { createdAt: 'desc' }
        });
      } catch (e) {
        console.warn('[DB Fallback] getRecords error:', e.message);
      }
    }
    let res = memoryDb.records.map(r => ({
      ...r,
      customer: memoryDb.customers.find(c => c.id === r.customerId) || { name: 'Unknown' }
    }));
    if (filter.customerId) res = res.filter(r => r.customerId === filter.customerId);
    if (filter.status) res = res.filter(r => r.status === filter.status);
    return res;
  },

  async getRecordById(id) {
    if (usePrisma) {
      try {
        return await prisma.creditRecord.findUnique({
          where: { id },
          include: { customer: true, payments: true }
        });
      } catch (e) {
        console.warn('[DB Fallback] getRecordById error:', e.message);
      }
    }
    const r = memoryDb.records.find(r => r.id === id);
    if (!r) return null;
    return {
      ...r,
      customer: memoryDb.customers.find(c => c.id === r.customerId) || { name: 'Unknown' },
      payments: memoryDb.payments.filter(p => p.creditRecordId === id)
    };
  },

  async createRecord(data) {
    if (usePrisma) {
      try {
        return await prisma.creditRecord.create({
          data,
          include: { customer: true }
        });
      } catch (e) {
        console.warn('[DB Fallback] createRecord error:', e.message);
      }
    }
    const newRecord = {
      id: 'r' + Date.now(),
      customerId: data.customerId,
      foodDescription: data.foodDescription,
      amount: Number(data.amount),
      paidAmount: Number(data.paidAmount || 0),
      remainingAmount: Number(data.remainingAmount),
      status: data.status,
      dueDate: data.dueDate || '',
      dueTime: data.dueTime || '',
      notes: data.notes || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    memoryDb.records.push(newRecord);
    return {
      ...newRecord,
      customer: memoryDb.customers.find(c => c.id === newRecord.customerId)
    };
  },

  async updateRecord(id, data) {
    if (usePrisma) {
      try {
        return await prisma.creditRecord.update({
          where: { id },
          data,
          include: { customer: true }
        });
      } catch (e) {
        console.warn('[DB Fallback] updateRecord error:', e.message);
      }
    }
    const idx = memoryDb.records.findIndex(r => r.id === id);
    if (idx === -1) return null;
    memoryDb.records[idx] = {
      ...memoryDb.records[idx],
      ...data,
      amount: data.amount !== undefined ? Number(data.amount) : memoryDb.records[idx].amount,
      paidAmount: data.paidAmount !== undefined ? Number(data.paidAmount) : memoryDb.records[idx].paidAmount,
      remainingAmount: data.remainingAmount !== undefined ? Number(data.remainingAmount) : memoryDb.records[idx].remainingAmount,
      updatedAt: new Date()
    };
    return {
      ...memoryDb.records[idx],
      customer: memoryDb.customers.find(c => c.id === memoryDb.records[idx].customerId)
    };
  },

  async deleteRecord(id) {
    if (usePrisma) {
      try {
        return await prisma.creditRecord.delete({ where: { id } });
      } catch (e) {
        console.warn('[DB Fallback] deleteRecord error:', e.message);
      }
    }
    memoryDb.records = memoryDb.records.filter(r => r.id !== id);
    memoryDb.payments = memoryDb.payments.filter(p => p.creditRecordId !== id);
    return { id };
  },

  // Payments
  async getPayments(filter = {}) {
    if (usePrisma) {
      try {
        const where = {};
        if (filter.customerId) where.customerId = filter.customerId;
        return await prisma.payment.findMany({
          where,
          include: { customer: true, creditRecord: true },
          orderBy: { paymentDate: 'desc' }
        });
      } catch (e) {
        console.warn('[DB Fallback] getPayments error:', e.message);
      }
    }
    let res = memoryDb.payments.map(p => ({
      ...p,
      customer: memoryDb.customers.find(c => c.id === p.customerId) || { name: 'Unknown' },
      creditRecord: memoryDb.records.find(r => r.id === p.creditRecordId)
    }));
    if (filter.customerId) res = res.filter(p => p.customerId === filter.customerId);
    return res;
  },

  async createPayment(data) {
    if (usePrisma) {
      try {
        return await prisma.payment.create({
          data,
          include: { customer: true, creditRecord: true }
        });
      } catch (e) {
        console.warn('[DB Fallback] createPayment error:', e.message);
      }
    }
    const newPayment = {
      id: 'p' + Date.now(),
      customerId: data.customerId,
      creditRecordId: data.creditRecordId || null,
      amount: Number(data.amount),
      paymentDate: data.paymentDate || new Date(),
      notes: data.notes || 'Cash',
      createdAt: new Date()
    };
    memoryDb.payments.push(newPayment);
    return {
      ...newPayment,
      customer: memoryDb.customers.find(c => c.id === newPayment.customerId),
      creditRecord: memoryDb.records.find(r => r.id === newPayment.creditRecordId)
    };
  },

  async deletePayment(id) {
    if (usePrisma) {
      try {
        return await prisma.payment.delete({ where: { id } });
      } catch (e) {
        console.warn('[DB Fallback] deletePayment error:', e.message);
      }
    }
    memoryDb.payments = memoryDb.payments.filter(p => p.id !== id);
    return { id };
  },

  // Reset to seed data
  async resetToDemo() {
    memoryDb = {
      profile: { ...seedProfile },
      customers: JSON.parse(JSON.stringify(seedCustomers)),
      records: JSON.parse(JSON.stringify(seedRecords)),
      payments: JSON.parse(JSON.stringify(seedPayments))
    };
    return true;
  }
};
