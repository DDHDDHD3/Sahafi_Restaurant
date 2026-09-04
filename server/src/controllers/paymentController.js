import { paymentService } from '../services/paymentService.js';

export const paymentController = {
  async list(req, res, next) {
    try {
      const { customerId } = req.query;
      const payments = await paymentService.listPayments({ customerId });
      res.json({ success: true, data: payments });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { customerId, amount, notes, note, paymentDate } = req.body;

      if (!customerId) {
        return res.status(400).json({ success: false, error: { message: 'Customer ID is required' } });
      }
      if (amount === undefined || Number(amount) <= 0) {
        return res.status(400).json({ success: false, error: { message: 'A valid payment amount greater than 0 is required' } });
      }

      const result = await paymentService.recordPayment({
        customerId,
        amount: Number(amount),
        notes: notes || note || 'Cash',
        paymentDate
      });

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      await paymentService.deletePayment(req.params.id);
      res.json({ success: true, message: 'Payment deleted successfully' });
    } catch (err) {
      next(err);
    }
  }
};
