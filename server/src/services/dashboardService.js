import { db } from '../config/db.js';
import { round2, calculateRecordStatus, isRecordOverdue } from './creditRecordService.js';

export const dashboardService = {
  async getSummary() {
    const customers = await db.getCustomers();
    const records = await db.getRecords();

    const totalConsumed = round2(records.reduce((sum, r) => sum + Number(r.amount), 0));
    const totalCollected = round2(records.reduce((sum, r) => sum + Number(r.paidAmount), 0));
    const totalRemaining = round2(totalConsumed - totalCollected);
    const collectionRate = totalConsumed > 0 ? Math.round((totalCollected / totalConsumed) * 100) : 0;

    const statusCounts = {
      PAID: 0,
      PARTIAL: 0,
      UNPAID: 0,
      OVERDUE: 0
    };

    records.forEach(r => {
      const st = calculateRecordStatus(r.amount, r.paidAmount, r.dueDate, r.dueTime);
      if (statusCounts[st] !== undefined) {
        statusCounts[st]++;
      }
    });

    // Customer accounts summary
    const accounts = customers.map(c => {
      const cRecs = records.filter(r => r.customerId === c.id);
      const consumed = round2(cRecs.reduce((sum, r) => sum + Number(r.amount), 0));
      const paid = round2(cRecs.reduce((sum, r) => sum + Number(r.paidAmount), 0));
      const remaining = round2(consumed - paid);
      const overdueRecs = cRecs.filter(r => Number(r.amount) - Number(r.paidAmount) > 0.001 && isRecordOverdue(r.dueDate, r.dueTime));
      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        isRukun: c.isRukun,
        consumed,
        paid,
        remaining,
        overdueCount: overdueRecs.length,
        status: remaining <= 0.001 ? 'PAID' : (overdueRecs.length ? 'OVERDUE' : (paid > 0.001 ? 'PARTIAL' : 'UNPAID'))
      };
    });

    const activeDebtors = accounts.filter(a => a.remaining > 0.001);
    const settledCustomers = accounts.filter(a => a.remaining <= 0.001);

    // Upcoming records
    const upcomingRecords = records
      .filter(r => Number(r.amount) - Number(r.paidAmount) > 0.001 && r.dueDate)
      .map(r => ({
        ...r,
        amount: Number(r.amount),
        paidAmount: Number(r.paidAmount),
        remainingAmount: round2(Number(r.amount) - Number(r.paidAmount)),
        status: calculateRecordStatus(r.amount, r.paidAmount, r.dueDate, r.dueTime),
        customerName: r.customer ? r.customer.name : 'Unknown'
      }))
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 8);

    return {
      totalConsumed,
      totalCollected,
      totalRemaining,
      collectionRate,
      statusCounts,
      totalTransactions: records.length,
      totalCustomers: customers.length,
      debtorsCount: activeDebtors.length,
      settledCount: settledCustomers.length,
      topDebtors: activeDebtors.sort((a, b) => b.remaining - a.remaining).slice(0, 6),
      upcomingRecords
    };
  },

  async getOverdueSummary() {
    const records = await db.getRecords();
    const overdueRecords = records
      .filter(r => Number(r.amount) - Number(r.paidAmount) > 0.001 && isRecordOverdue(r.dueDate, r.dueTime))
      .map(r => ({
        ...r,
        amount: Number(r.amount),
        paidAmount: Number(r.paidAmount),
        remainingAmount: round2(Number(r.amount) - Number(r.paidAmount)),
        status: 'OVERDUE',
        customerName: r.customer ? r.customer.name : 'Unknown'
      }));

    return {
      count: overdueRecords.length,
      records: overdueRecords
    };
  }
};
