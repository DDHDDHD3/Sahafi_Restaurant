import { db } from '../config/db.js';
import { round2, calculateRecordStatus } from './creditRecordService.js';

export const paymentService = {
  async listPayments(filter = {}) {
    return await db.getPayments(filter);
  },

  async recordPayment(payload) {
    const customerId = payload.customerId;
    const paymentAmount = round2(payload.amount);
    const paymentNote = (payload.notes || payload.note || 'Cash').trim();
    const paymentDate = payload.paymentDate ? new Date(payload.paymentDate) : new Date();

    if (!customerId) {
      throw new Error('CustomerId is required');
    }
    if (paymentAmount <= 0) {
      throw new Error('Payment amount must be greater than zero');
    }

    const customer = await db.getCustomerById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    // Get all open credit records for this customer
    const records = await db.getRecords({ customerId });
    const openRecords = records
      .filter(r => Number(r.amount) - Number(r.paidAmount) > 0.001)
      .sort((a, b) => {
        // Sort by dueDate first (soonest first), then by createdAt
        if (a.dueDate && b.dueDate) {
          const diff = new Date(a.dueDate + 'T' + (a.dueTime || '00:00')).getTime() -
                       new Date(b.dueDate + 'T' + (b.dueTime || '00:00')).getTime();
          if (diff !== 0) return diff;
        } else if (a.dueDate) {
          return -1;
        } else if (b.dueDate) {
          return 1;
        }
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      });

    const totalRemaining = round2(openRecords.reduce((sum, r) => sum + (Number(r.amount) - Number(r.paidAmount)), 0));

    // Rule: Never allow payment greater than remaining balance
    if (paymentAmount > totalRemaining + 0.001) {
      throw new Error(`Payment ($${paymentAmount}) cannot exceed remaining balance ($${totalRemaining})`);
    }

    let remainingToApply = paymentAmount;
    const updatedRecords = [];
    let mainCreditRecordId = null;

    // Distribute payment across open records
    for (const rec of openRecords) {
      if (remainingToApply <= 0.001) break;
      const recRemaining = round2(Number(rec.amount) - Number(rec.paidAmount));
      const take = Math.min(recRemaining, remainingToApply);
      const newPaid = round2(Number(rec.paidAmount) + take);
      const newRemaining = round2(Number(rec.amount) - newPaid);
      const newStatus = calculateRecordStatus(rec.amount, newPaid, rec.dueDate, rec.dueTime);

      const updated = await db.updateRecord(rec.id, {
        paidAmount: newPaid,
        remainingAmount: newRemaining,
        status: newStatus
      });

      updatedRecords.push(updated);
      if (!mainCreditRecordId) mainCreditRecordId = rec.id;
      remainingToApply = round2(remainingToApply - take);
    }

    // Create Payment log entry
    const payment = await db.createPayment({
      customerId,
      creditRecordId: mainCreditRecordId,
      amount: paymentAmount,
      paymentDate,
      notes: paymentNote
    });

    // Re-query customer to get updated balance
    const updatedCustomer = await db.getCustomerById(customerId);
    const newTotalRemaining = round2(
      (updatedCustomer.creditRecords || []).reduce((sum, r) => sum + (Number(r.amount) - Number(r.paidAmount)), 0)
    );

    return {
      payment,
      appliedAmount: paymentAmount,
      remainingBalance: newTotalRemaining,
      updatedRecords,
      isFullyPaid: newTotalRemaining <= 0.001
    };
  },

  async deletePayment(id) {
    return await db.deletePayment(id);
  }
};
