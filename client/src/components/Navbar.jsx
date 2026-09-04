import React from 'react';
import Icon from './Icon';
import { createFormatters } from '../i18n/translations';

export const Navbar = ({
  profile = {},
  onOpenAddModal,
  onToggleLang
}) => {
  const lang = profile.defaultLanguage || profile.lang || 'so';
  const { t } = createFormatters(lang);
  const initial = (profile.restaurantName || profile.name || 'Sahafi').charAt(0).toUpperCase();

  return (
    <header className="mobile-bar no-print" id="mobileNavbar">
      <div className="brand" style={{ padding: 0 }}>
        <div className="brand-logo" style={{ width: 34, height: 34, fontSize: 16 }}>
          {profile.logo ? (
            <img src={profile.logo} alt="Logo" />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <div className="brand-name" style={{ fontSize: 15 }}>
            {profile.restaurantName || profile.name || 'Sahafi'}
          </div>
        </div>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="lang-toggle" role="group" aria-label="Language">
          <button
            type="button"
            className={`lang-opt ${lang === 'so' ? 'active' : ''}`}
            aria-pressed={lang === 'so'}
            onClick={() => onToggleLang('so')}
          >
            SO
          </button>
          <button
            type="button"
            className={`lang-opt ${lang === 'en' ? 'active' : ''}`}
            aria-pressed={lang === 'en'}
            onClick={() => onToggleLang('en')}
          >
            EN
          </button>
        </div>

        <button
          id="mobileAddBtn"
          type="button"
          className="btn btn-primary btn-sm"
          onClick={onOpenAddModal}
        >
          <Icon name="plus" size={14} sw={2.2} />
          <span>{t('Record')}</span>
        </button>
      </div>
    </header>
  );
};

export default Navbar;
