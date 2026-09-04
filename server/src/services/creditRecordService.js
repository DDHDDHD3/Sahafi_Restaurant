import { db } from '../config/db.js';

export const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

export const isRecordOverdue = (dueDate, dueTime) => {
  if (!dueDate) return false;
  try {
    const dueString = dueDate + (dueTime ? 'T' + dueTime + ':00' : 'T23:59:59');
    return new Date(dueString).getTime() < Date.now();
  } catch (e) {
    return false;
  }
};

export const calculateRecordStatus = (amount, paidAmount, dueDate, dueTime) => {
  const amt = round2(amount);
  const paid = round2(paidAmount);
  const rem = round2(amt - paid);

  if (rem <= 0.001) {
    return 'PAID';
  }
  if (isRecordOverdue(dueDate, dueTime)) {
    return 'OVERDUE';
  }
  if (paid > 0.001) {
    return 'PARTIAL';
  }
  return 'UNPAID';
};

export const creditRecordService = {
  async listRecords(filter = {}) {
    const records = await db.getRecords(filter);
    // dynamically sync overdue statuses
    return records.map(r => {
      const currentStatus = calculateRecordStatus(r.amount, r.paidAmount, r.dueDate, r.dueTime);
      return {
        ...r,
        amount: Number(r.amount),
        paidAmount: Number(r.paidAmount),
        remainingAmount: round2(Number(r.amount) - Number(r.paidAmount)),
        status: currentStatus
      };
    });
  },

  async getRecordById(id) {
    const r = await db.getRecordById(id);
    if (!r) return null;
    return {
      ...r,
      amount: Number(r.amount),
      paidAmount: Number(r.paidAmount),
      remainingAmount: round2(Number(r.amount) - Number(r.paidAmount)),
      status: calculateRecordStatus(r.amount, r.paidAmount, r.dueDate, r.dueTime)
    };
  },

  async createRecord(payload) {
    const amount = round2(payload.amount);
    if (amount <= 0) {
      throw new Error('Amount must be greater than zero');
    }

    const paidAmount = Math.min(round2(payload.paidAmount || 0), amount);
    const remainingAmount = round2(amount - paidAmount);
    const status = calculateRecordStatus(amount, paidAmount, payload.dueDate, payload.dueTime);

    // If customerId is not provided, look up or create customer by name
    let customerId = payload.customerId;
    if (!customerId && payload.customerName) {
      const customers = await db.getCustomers();
      let cust = customers.find(c => c.name.toLowerCase() === payload.customerName.trim().toLowerCase());
      if (!cust) {
        cust = await db.createCustomer({
          name: payload.customerName.trim(),
          phone: payload.phone || '',
          notes: '',
          isRukun: !!payload.isRukun
        });
      }
      customerId = cust.id;
    }

    if (!customerId) {
      throw new Error('CustomerId or CustomerName is required');
    }

    const record = await db.createRecord({
      customerId,
      foodDescription: (payload.foodDescription || payload.food || '').trim(),
      amount,
      paidAmount,
      remainingAmount,
      status,
      dueDate: payload.dueDate || '',
      dueTime: payload.dueTime || '',
      notes: payload.notes || payload.note || ''
    });

    // If initial payment was made with the record, create the payment entry
    if (paidAmount > 0) {
      await db.createPayment({
        customerId,
        creditRecordId: record.id,
        amount: paidAmount,
        notes: 'Initial payment with order',
        paymentDate: new Date()
      });
    }

    return record;
  },

  async updateRecord(id, payload) {
    const existing = await db.getRecordById(id);
    if (!existing) {
      throw new Error('Credit record not found');
    }

    const amount = payload.amount !== undefined ? round2(payload.amount) : Number(existing.amount);
    const paidAmount = payload.paidAmount !== undefined ? Math.min(round2(payload.paidAmount), amount) : Number(existing.paidAmount);
    const remainingAmount = round2(amount - paidAmount);
    const dueDate = payload.dueDate !== undefined ? payload.dueDate : existing.dueDate;
    const dueTime = payload.dueTime !== undefined ? payload.dueTime : existing.dueTime;
    const status = calculateRecordStatus(amount, paidAmount, dueDate, dueTime);

    return await db.updateRecord(id, {
      foodDescription: payload.foodDescription !== undefined ? payload.foodDescription.trim() : existing.foodDescription,
      amount,
      paidAmount,
      remainingAmount,
      status,
      dueDate,
      dueTime,
      notes: payload.notes !== undefined ? payload.notes : existing.notes
    });
  },

  async deleteRecord(id) {
    return await db.deleteRecord(id);
  }
};
