import React from 'react';
import Icon from './Icon';
import { createFormatters } from '../i18n/translations';

export const TabBar = ({
  currentTab,
  onSelectTab,
  overdueCount = 0,
  lang = 'so'
}) => {
  const { t } = createFormatters(lang);

  const tabs = [
    { key: 'dashboard', label: t('Home'), icon: 'grid' },
    { key: 'rentbook', label: t('Book'), icon: 'book', count: overdueCount },
    { key: 'customers', label: t('People'), icon: 'people' },
    { key: 'report', label: t('Report'), icon: 'doc' },
    { key: 'settings', label: t('More'), icon: 'gear' }
  ];

  return (
    <nav className="tabbar no-print" aria-label="Mobile Bottom Navigation">
      {tabs.map((tab) => {
        const isActive = currentTab === tab.key;
        return (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            type="button"
            className={`tab-item ${isActive ? 'active' : ''}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onSelectTab(tab.key)}
          >
            <span className="tab-ico" style={{ position: 'relative' }}>
              <Icon name={tab.icon} size={15} sw={1.9} />
              {tab.count > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-2px',
                    right: '-4px',
                    background: 'var(--danger-700)',
                    color: '#fff',
                    borderRadius: '999px',
                    fontSize: '9px',
                    fontWeight: 700,
                    padding: '0 4px',
                    lineHeight: '13px'
                  }}
                >
                  {tab.count}
                </span>
              )}
            </span>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default TabBar;
