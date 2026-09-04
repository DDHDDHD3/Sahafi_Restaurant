import { db } from '../config/db.js';
import { round2, calculateRecordStatus, isRecordOverdue } from '../services/creditRecordService.js';
import { paymentService } from '../services/paymentService.js';

export const customerController = {
  async list(req, res, next) {
    try {
      const customers = await db.getCustomers();
      const records = await db.getRecords();

      const summarized = customers.map(c => {
        const cRecs = records.filter(r => r.customerId === c.id);
        const consumed = round2(cRecs.reduce((sum, r) => sum + Number(r.amount), 0));
        const paid = round2(cRecs.reduce((sum, r) => sum + Number(r.paidAmount), 0));
        const remaining = round2(consumed - paid);

        const openRecs = cRecs.filter(r => Number(r.amount) - Number(r.paidAmount) > 0.001);
        const overdueRecs = openRecs.filter(r => isRecordOverdue(r.dueDate, r.dueTime));

        // Find next due record
        const sortedDue = openRecs
          .filter(r => r.dueDate)
          .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        const nextDue = sortedDue[0] || null;

        return {
          id: c.id,
          name: c.name,
          phone: c.phone || '',
          notes: c.notes || '',
          isRukun: !!c.isRukun,
          createdAt: c.createdAt,
          consumed,
          paid,
          remaining,
          openCount: openRecs.length,
          overdueCount: overdueRecs.length,
          nextDue: nextDue ? {
            dueDate: nextDue.dueDate,
            dueTime: nextDue.dueTime,
            isOverdue: isRecordOverdue(nextDue.dueDate, nextDue.dueTime)
          } : null,
          status: remaining <= 0.001 ? 'PAID' : (overdueRecs.length ? 'OVERDUE' : (paid > 0.001 ? 'PARTIAL' : 'UNPAID'))
        };
      });

      res.json({ success: true, data: summarized });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const customer = await db.getCustomerById(req.params.id);
      if (!customer) {
        return res.status(404).json({ success: false, error: { message: 'Customer not found' } });
      }

      const records = (customer.creditRecords || []).map(r => ({
        ...r,
        amount: Number(r.amount),
        paidAmount: Number(r.paidAmount),
        remainingAmount: round2(Number(r.amount) - Number(r.paidAmount)),
        status: calculateRecordStatus(r.amount, r.paidAmount, r.dueDate, r.dueTime),
        isOverdue: isRecordOverdue(r.dueDate, r.dueTime)
      }));

      const payments = (customer.payments || []).map(p => ({
        ...p,
        amount: Number(p.amount)
      }));

      const consumed = round2(records.reduce((sum, r) => sum + r.amount, 0));
      const paid = round2(records.reduce((sum, r) => sum + r.paidAmount, 0));
      const remaining = round2(consumed - paid);

      res.json({
        success: true,
        data: {
          ...customer,
          creditRecords: records,
          payments,
          consumed,
          paid,
          remaining,
          status: remaining <= 0.001 ? 'PAID' : (records.some(r => r.status === 'OVERDUE') ? 'OVERDUE' : (paid > 0.001 ? 'PARTIAL' : 'UNPAID'))
        }
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { name, phone, notes, isRukun } = req.body;
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: { message: 'Customer name is required' } });
      }

      const customer = await db.createCustomer({
        name: name.trim(),
        phone: phone ? phone.trim() : '',
        notes: notes ? notes.trim() : '',
        isRukun: !!isRukun
      });

      res.status(201).json({ success: true, data: customer });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { name, phone, notes, isRukun } = req.body;
      const updated = await db.updateCustomer(req.params.id, {
        ...(name !== undefined && { name: name.trim() }),
        ...(phone !== undefined && { phone: phone.trim() }),
        ...(notes !== undefined && { notes: notes.trim() }),
        ...(isRukun !== undefined && { isRukun: !!isRukun })
      });

      if (!updated) {
        return res.status(404).json({ success: false, error: { message: 'Customer not found' } });
      }

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await db.deleteCustomer(req.params.id);
      res.json({ success: true, message: 'Customer deleted successfully' });
    } catch (err) {
      next(err);
    }
  },

  async settleFullDebt(req, res, next) {
    try {
      const customer = await db.getCustomerById(req.params.id);
      if (!customer) {
        return res.status(404).json({ success: false, error: { message: 'Customer not found' } });
      }

      const records = customer.creditRecords || [];
      const totalRemaining = round2(records.reduce((sum, r) => sum + (Number(r.amount) - Number(r.paidAmount)), 0));

      if (totalRemaining <= 0.001) {
        return res.json({ success: true, message: 'Customer has no outstanding balance', remainingBalance: 0 });
      }

      const result = await paymentService.recordPayment({
        customerId: req.params.id,
        amount: totalRemaining,
        notes: 'Full settlement (Wada bixin)',
        paymentDate: new Date()
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
};
