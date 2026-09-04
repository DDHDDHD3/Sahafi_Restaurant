import React from 'react';
import Icon from './Icon';
import { createFormatters } from '../i18n/translations';

export const Sidebar = ({
  currentTab,
  onSelectTab,
  overdueCount = 0,
  profile = {},
  onOpenAddModal,
  onToggleLang
}) => {
  const lang = profile.defaultLanguage || profile.lang || 'so';
  const { t } = createFormatters(lang);

  const initial = (profile.restaurantName || profile.name || 'Sahafi').charAt(0).toUpperCase();

  const navItems = [
    { key: 'dashboard', label: t('Dashboard'), icon: 'grid' },
    { key: 'rentbook', label: t('Rent Book'), icon: 'book', count: overdueCount },
    { key: 'customers', label: t('Customers'), icon: 'people' },
    { key: 'report', label: t('Monthly Report'), icon: 'doc' },
    { key: 'settings', label: t('Settings'), icon: 'gear' }
  ];

  return (
    <aside className="sidebar no-print" id="appSidebar">
      {/* Brand Header */}
      <div className="brand">
        <div className="brand-logo">
          {profile.logo ? (
            <img src={profile.logo} alt="Restaurant Logo" />
          ) : (
            <span>{initial}</span>
          )}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="brand-name" title={profile.restaurantName || profile.name || 'Sahafi Restaurant'}>
            {profile.restaurantName || profile.name || 'Sahafi Restaurant'}
          </div>
          <div className="eyebrow" style={{ marginTop: '2px' }}>
            {t('Rent Book')}
          </div>
        </div>
      </div>

      {/* Quick Add Button */}
      <button
        id="sidebarAddBtn"
        type="button"
        className="btn btn-primary btn-block"
        onClick={onOpenAddModal}
      >
        <Icon name="plus" size={16} sw={2.2} />
        <span>{t('Add Record')}</span>
      </button>

      {/* Navigation List */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }} aria-label="Main Navigation">
        {navItems.map((item) => {
          const isActive = currentTab === item.key;
          return (
            <button
              key={item.key}
              id={`nav-${item.key}`}
              type="button"
              className={`nav-item ${isActive ? 'active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => onSelectTab(item.key)}
            >
              <span className="nav-ico">
                <Icon name={item.icon} size={16} sw={1.9} />
              </span>
              <span>{item.label}</span>
              {item.count > 0 && (
                <span className="nav-count" title={`${item.count} overdue`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Language Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--glass-edge)' }}>
        <span className="muted" style={{ fontSize: '11.5px', fontWeight: 500 }}>
          {t('Language')}
        </span>
        <div className="lang-toggle" role="group" aria-label="Language selection">
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
      </div>
    </aside>
  );
};

export default Sidebar;
