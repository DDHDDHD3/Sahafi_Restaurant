import { reportService } from '../services/reportService.js';

export const reportController = {
  async getMonthly(req, res, next) {
    try {
      const month = req.query.month;
      const report = await reportService.getMonthlyReport(month);
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  },

  async getCustomerReport(req, res, next) {
    try {
      const report = await reportService.getCustomerReport(req.params.id);
      res.json({ success: true, data: report });
    } catch (err) {
      next(err);
    }
  }
};
