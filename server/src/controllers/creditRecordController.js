import { creditRecordService } from '../services/creditRecordService.js';

export const creditRecordController = {
  async list(req, res, next) {
    try {
      const { customerId, status, search } = req.query;
      let records = await creditRecordService.listRecords({ customerId, status });

      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        records = records.filter(r => {
          const custName = r.customer ? r.customer.name.toLowerCase() : '';
          const custPhone = r.customer ? (r.customer.phone || '').toLowerCase() : '';
          const food = (r.foodDescription || '').toLowerCase();
          return custName.includes(q) || custPhone.includes(q) || food.includes(q);
        });
      }

      res.json({ success: true, data: records });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const record = await creditRecordService.getRecordById(req.params.id);
      if (!record) {
        return res.status(404).json({ success: false, error: { message: 'Credit record not found' } });
      }
      res.json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { customerId, customerName, phone, isRukun, foodDescription, food, amount, paidAmount, dueDate, dueTime, notes, note } = req.body;

      if (!foodDescription && !food) {
        return res.status(400).json({ success: false, error: { message: 'Food description is required' } });
      }
      if (amount === undefined || Number(amount) <= 0) {
        return res.status(400).json({ success: false, error: { message: 'A valid amount greater than 0 is required' } });
      }

      const record = await creditRecordService.createRecord({
        customerId,
        customerName,
        phone,
        isRukun,
        foodDescription: foodDescription || food,
        amount: Number(amount),
        paidAmount: Number(paidAmount || 0),
        dueDate,
        dueTime,
        notes: notes || note
      });

      res.status(201).json({ success: true, data: record });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const updated = await creditRecordService.updateRecord(req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await creditRecordService.deleteRecord(req.params.id);
      res.json({ success: true, message: 'Credit record deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
};
