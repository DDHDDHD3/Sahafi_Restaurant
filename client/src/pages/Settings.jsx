import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import { createFormatters } from '../i18n/translations';

export const Settings = ({
  profile = {},
  onSaveProfile,
  onResetDemo
}) => {
  const lang = profile.defaultLanguage || profile.lang || 'so';
  const { t } = createFormatters(lang);

  const [formData, setFormData] = useState({
    restaurantName: '',
    phone: '',
    currency: '$',
    defaultLanguage: 'so',
    logo: ''
  });

  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        restaurantName: profile.restaurantName || profile.name || 'Sahafi Restaurant',
        phone: profile.phone || '',
        currency: profile.currency || '$',
        defaultLanguage: profile.defaultLanguage || profile.lang || 'so',
        logo: profile.logo || ''
      });
    }
  }, [profile]);

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert(t('That file is not an image'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, logo: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, logo: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSaveProfile(formData);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to restore demo records?')) return;
    setResetting(true);
    try {
      await onResetDemo();
    } finally {
      setResetting(false);
    }
  };

  const initial = (formData.restaurantName || 'Sahafi').charAt(0).toUpperCase();

  return (
    <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '720px' }}>
      {/* Page Header */}
      <div className="page-head">
        <div>
          <h1>{t('Settings')}</h1>
          <p className="sub">{t('Your restaurant profile and demo data.')}</p>
        </div>
      </div>

      {/* Profile Form Sheet */}
      <div className="sheet sheet-pad">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="section-head">
            <h3>{t('Restaurant profile')}</h3>
          </div>

          {/* Logo preview and upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="brand-logo" style={{ width: '64px', height: '64px', fontSize: '28px' }}>
              {formData.logo ? (
                <img src={formData.logo} alt="Logo preview" />
              ) : (
                <span>{initial}</span>
              )}
            </div>

            <div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <label className="btn btn-glass btn-sm" style={{ cursor: 'pointer' }}>
                  <Icon name="image" size={14} />
                  <span>{formData.logo ? t('Replace logo') : t('Upload logo')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                  />
                </label>

                {formData.logo && (
                  <button
                    type="button"
                    className="btn btn-quiet btn-sm"
                    onClick={handleRemoveLogo}
                  >
                    {t('Remove')}
                  </button>
                )}
              </div>
              <p className="muted-3" style={{ fontSize: '11.5px', marginTop: '6px' }}>
                {t('Until you upload one, your initials are used. PNG, JPG or SVG.')}
              </p>
            </div>
          </div>

          {/* Restaurant Name */}
          <div className="field">
            <label htmlFor="settingsRestName">{t('Restaurant name')} *</label>
            <input
              id="settingsRestName"
              className="input"
              type="text"
              value={formData.restaurantName}
              onChange={e => setFormData({ ...formData, restaurantName: e.target.value })}
              required
            />
          </div>

          {/* Phone */}
          <div className="field">
            <label htmlFor="settingsPhone">{t('Phone')}</label>
            <input
              id="settingsPhone"
              className="input"
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+252 61 555 0100"
            />
          </div>

          {/* Currency & Language */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
            <div className="field">
              <label htmlFor="settingsCurrency">{t('Currency symbol')}</label>
              <input
                id="settingsCurrency"
                className="input"
                type="text"
                value={formData.currency}
                onChange={e => setFormData({ ...formData, currency: e.target.value })}
              />
            </div>

            <div className="field">
              <label htmlFor="settingsLang">{t('Language')}</label>
              <select
                id="settingsLang"
                className="input"
                value={formData.defaultLanguage}
                onChange={e => setFormData({ ...formData, defaultLanguage: e.target.value })}
              >
                <option value="so">Soomaali (Somali)</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
            <button
              id="saveSettingsBtn"
              type="submit"
              className="btn btn-primary"
              disabled={saving}
            >
              <Icon name="check" size={16} sw={2.2} />
              <span>{saving ? 'Saving...' : t('Save changes')}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Demo Data Reset Sheet */}
      <div className="sheet sheet-pad" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="section-head">
          <h3>{t('Demo data')}</h3>
        </div>
        <p className="sub" style={{ fontSize: '13px' }}>
          Reset your database to the original Somali restaurant demonstration records (Faarax, Maryan, Xasan, etc.) with sample dates and payments.
        </p>
        <div>
          <button
            id="resetDemoBtn"
            type="button"
            className="btn btn-glass danger"
            onClick={handleReset}
            disabled={resetting}
          >
            <Icon name="trash" size={15} />
            <span>{resetting ? 'Resetting...' : t('Reset demo data')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
