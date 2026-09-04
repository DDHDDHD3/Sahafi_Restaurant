import { db } from '../config/db.js';
import { round2, calculateRecordStatus, isRecordOverdue } from './creditRecordService.js';

export const reportService = {
  async getMonthlyReport(monthKey) {
    const isAllTime = !monthKey || monthKey === 'all';
    const allRecords = await db.getRecords();
    const allPayments = await db.getPayments();
    const customers = await db.getCustomers();

    // Available months
    const availableMonths = Array.from(
      new Set(
        allRecords
          .map(r => (r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 7) : (r.date || '').slice(0, 7)))
          .concat(allPayments.map(p => (p.paymentDate ? new Date(p.paymentDate).toISOString().slice(0, 7) : (p.date || '').slice(0, 7))))
          .filter(Boolean)
      )
    ).sort().reverse();

    const selectedMonth = isAllTime ? 'all' : (monthKey || availableMonths[0] || new Date().toISOString().slice(0, 7));

    // Filter by month
    const records = isAllTime
      ? allRecords
      : allRecords.filter(r => {
          const dateStr = r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 7) : (r.date || '').slice(0, 7);
          return dateStr === selectedMonth;
        });

    const payments = isAllTime
      ? allPayments
      : allPayments.filter(p => {
          const dateStr = p.paymentDate ? new Date(p.paymentDate).toISOString().slice(0, 7) : (p.date || '').slice(0, 7);
          return dateStr === selectedMonth;
        });

    const total = round2(records.reduce((sum, r) => sum + Number(r.amount), 0));
    const collected = round2(records.reduce((sum, r) => sum + Number(r.paidAmount), 0));
    const outstanding = round2(total - collected);
    const collectionRate = total > 0 ? Math.round((collected / total) * 100) : 0;

    const mix = { PAID: 0, PARTIAL: 0, UNPAID: 0, OVERDUE: 0 };
    records.forEach(r => {
      const st = calculateRecordStatus(r.amount, r.paidAmount, r.dueDate, r.dueTime);
      mix[st] = (mix[st] || 0) + 1;
    });

    const customerIds = Array.from(new Set(records.map(r => r.customerId)));
    const customerBreakdown = customerIds.map(id => {
      const cust = customers.find(c => c.id === id) || { id, name: 'Unknown', phone: '', isRukun: false };
      const cRecs = records.filter(r => r.customerId === id);
      const consumed = round2(cRecs.reduce((sum, r) => sum + Number(r.amount), 0));
      const paid = round2(cRecs.reduce((sum, r) => sum + Number(r.paidAmount), 0));
      const remaining = round2(consumed - paid);
      const overdue = cRecs.filter(r => Number(r.amount) - Number(r.paidAmount) > 0.001 && isRecordOverdue(r.dueDate, r.dueTime));

      return {
        customer: cust,
        consumed,
        paid,
        remaining,
        recordCount: cRecs.length,
        status: remaining <= 0.001 ? 'PAID' : (overdue.length ? 'OVERDUE' : (paid > 0.001 ? 'PARTIAL' : 'UNPAID'))
      };
    }).sort((a, b) => b.remaining - a.remaining);

    return {
      selectedMonth,
      availableMonths,
      total,
      collected,
      outstanding,
      collectionRate,
      mix,
      records: records.map(r => ({
        ...r,
        amount: Number(r.amount),
        paidAmount: Number(r.paidAmount),
        remainingAmount: round2(Number(r.amount) - Number(r.paidAmount)),
        status: calculateRecordStatus(r.amount, r.paidAmount, r.dueDate, r.dueTime),
        date: r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : (r.date || '')
      })),
      payments: payments.map(p => ({
        ...p,
        amount: Number(p.amount),
        date: p.paymentDate ? new Date(p.paymentDate).toISOString().slice(0, 10) : (p.date || '')
      })),
      customerBreakdown
    };
  },

  async getCustomerReport(customerId) {
    const customer = await db.getCustomerById(customerId);
    if (!customer) {
      throw new Error('Customer not found');
    }

    const records = (customer.creditRecords || []).map(r => ({
      ...r,
      amount: Number(r.amount),
      paidAmount: Number(r.paidAmount),
      remainingAmount: round2(Number(r.amount) - Number(r.paidAmount)),
      status: calculateRecordStatus(r.amount, r.paidAmount, r.dueDate, r.dueTime),
      date: r.createdAt ? new Date(r.createdAt).toISOString().slice(0, 10) : (r.date || '')
    }));

    const payments = (customer.payments || []).map(p => ({
      ...p,
      amount: Number(p.amount),
      date: p.paymentDate ? new Date(p.paymentDate).toISOString().slice(0, 10) : (p.date || '')
    }));

    const totalConsumed = round2(records.reduce((sum, r) => sum + r.amount, 0));
    const totalPaid = round2(records.reduce((sum, r) => sum + r.paidAmount, 0));
    const remaining = round2(totalConsumed - totalPaid);

    return {
      customer: {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        notes: customer.notes,
        isRukun: customer.isRukun,
        createdAt: customer.createdAt
      },
      records,
      payments,
      summary: {
        totalConsumed,
        totalPaid,
        remaining,
        status: remaining <= 0.001 ? 'PAID' : (records.some(r => r.status === 'OVERDUE') ? 'OVERDUE' : (totalPaid > 0 ? 'PARTIAL' : 'UNPAID'))
      }
    };
  }
};
