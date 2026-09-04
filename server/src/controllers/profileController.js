import { db } from '../config/db.js';

export const profileController = {
  async get(req, res, next) {
    try {
      const profile = await db.getProfile();
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { restaurantName, name, phone, address, currency, defaultLanguage, lang, logo } = req.body;
      const updated = await db.updateProfile({
        ...(restaurantName !== undefined ? { restaurantName } : (name !== undefined ? { restaurantName: name } : {})),
        ...(phone !== undefined && { phone }),
        ...(address !== undefined && { address }),
        ...(currency !== undefined && { currency }),
        ...(defaultLanguage !== undefined ? { defaultLanguage } : (lang !== undefined ? { defaultLanguage: lang } : {})),
        ...(logo !== undefined && { logo })
      });
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  async resetDemo(req, res, next) {
    try {
      await db.resetToDemo();
      res.json({ success: true, message: 'Demo data restored successfully' });
    } catch (err) {
      next(err);
    }
  }
};
