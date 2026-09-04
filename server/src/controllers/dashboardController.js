import { dashboardService } from '../services/dashboardService.js';

export const dashboardController = {
  async getSummary(req, res, next) {
    try {
      const summary = await dashboardService.getSummary();
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  },

  async getOverdue(req, res, next) {
    try {
      const overdue = await dashboardService.getOverdueSummary();
      res.json({ success: true, data: overdue });
    } catch (err) {
      next(err);
    }
  },

  async getTopDebtors(req, res, next) {
    try {
      const summary = await dashboardService.getSummary();
      res.json({ success: true, data: summary.topDebtors });
    } catch (err) {
      next(err);
    }
  }
};
