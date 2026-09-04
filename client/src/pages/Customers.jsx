import React, { useState, useMemo } from 'react';
import Icon from '../components/Icon';
import { formatMoney, formatDateLabel, createFormatters } from '../i18n/translations';

export const Customers = ({
  customers = [],
  profile = {},
  onOpenAddModal,
  onOpenPayModal,
  onSettleFull,
  onDeleteCustomer,
  onNavigateToCustomer
}) => {
  const currency = profile.currency || '$';
  const lang = profile.defaultLanguage || profile.lang || 'so';
  const { t, F } = {
    ...createFormatters(lang),
    F: createFormatters(lang)
  };

  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('debt'); // 'debt' | 'name' | 'recent'

  const filterOptions = [
    { key: 'All', label: t('All') },
    { key: 'Owing', label: t('Customers still in debt') },
    { key: 'Settled', label: t('Completed accounts') },
    { key: 'Rukun', label: 'Rukun (VIP)' }
  ];

  const filteredCustomers = useMemo(() => {
    let list = customers.filter(cust => {
      // Filter tab
      if (filter === 'Owing' && cust.remaining <= 0.001) return false;
      if (filter === 'Settled' && cust.remaining > 0.001) return false;
      if (filter === 'Rukun' && !cust.isRukun) return false;

      // Search query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const name = (cust.name || '').toLowerCase();
        const phone = (cust.phone || '').toLowerCase();
        if (!name.includes(q) && !phone.includes(q)) return false;
      }

      return true;
    });

    // Sorting
    return list.sort((a, b) => {
      if (sortBy === 'debt') {
        return b.remaining - a.remaining;
      } else if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });
  }, [customers, filter, search, sortBy]);

  return (
    <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div className="page-head">
        <div style={{ flex: 1, minWidth: '220px' }}>
          <h1>{t('Customers')}</h1>
          <p className="sub">{F.carryBalance(customers.filter(c => c.remaining > 0.001).length, customers.length)}</p>
        </div>
        <button
          id="customersAddRecordBtn"
          type="button"
          className="btn btn-primary"
          onClick={() => onOpenAddModal()}
        >
          <Icon name="plus" size={16} sw={2.2} />
          <span>{t('Add food')}</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="seg" role="radiogroup" aria-label={t('Filter by status')}>
          {filterOptions.map(opt => (
            <button
              key={opt.key}
              type="button"
              className={`seg-opt ${filter === opt.key ? 'active' : ''}`}
              aria-pressed={filter === opt.key}
              onClick={() => setFilter(opt.key)}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="search-wrap">
          <Icon name="search" size={16} />
          <input
            type="search"
            className="input"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('Search by name or phone…')}
            aria-label={t('Search customers')}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span className="muted-3" style={{ fontSize: '11px', fontWeight: 600 }}>{t('Sort by')}:</span>
          <select
            className="input"
            style={{ width: 'auto', minHeight: '34px', padding: '4px 28px 4px 10px', fontSize: '12px' }}
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
          >
            <option value="debt">{t('Highest debt')}</option>
            <option value="name">{t('Name')}</option>
            <option value="recent">{t('Most recent')}</option>
          </select>
        </div>
      </div>

      {/* Customer Grid */}
      {filteredCustomers.length === 0 ? (
        <div className="sheet">
          <div className="empty">
            <div className="empty-ico">
              <Icon name="people" size={32} />
            </div>
            <h3>{search ? t('No customers match') : t('The book is empty')}</h3>
            <p className="sub" style={{ marginTop: '6px' }}>
              {search ? t('Try a different name, phone or filter.') : t('Write down the first plate served on credit.')}
            </p>
          </div>
        </div>
      ) : (
        <div className="cust-grid">
          {filteredCustomers.map(cust => {
            const phoneClean = (cust.phone || '').replace(/\D/g, '');
            const hasDebt = cust.remaining > 0.001;

            return (
              <div
                key={cust.id}
                className={`cust-card ${cust.isRukun ? 'cust-card-rukun' : ''}`}
              >
                {/* Card Top: Avatar, Name, Phone, Badges */}
                <div className="cust-card-head">
                  <div className="avatar" style={{ width: '38px', height: '38px', fontSize: '14px' }}>
                    {cust.name.charAt(0).toUpperCase()}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        className="linkish"
                        style={{ fontWeight: 700, fontSize: '15px' }}
                        onClick={() => onNavigateToCustomer(cust.id)}
                      >
                        {cust.name}
                      </button>
                      {cust.isRukun && (
                        <span className="badge badge-rukun" style={{ fontSize: '10px', padding: '1px 7px' }}>
                          Rukun
                        </span>
                      )}
                    </div>
                    <div className="muted-3" style={{ fontSize: '12px', marginTop: '1px' }}>
                      {cust.phone || t('noPhone')}
                    </div>
                  </div>

                  <div>
                    <span className={`badge badge-${cust.status}`}>
                      <span className="dot" />
                      <span>{t(cust.status === 'PAID' ? 'Paid in full' : (cust.status === 'PARTIAL' ? 'Partial' : (cust.status === 'OVERDUE' ? 'Overdue' : 'Unpaid')))}</span>
                    </span>
                  </div>
                </div>

                {/* 3-Column Stats Box */}
                <div className="cust-card-stats">
                  <div>
                    <div className="cust-card-stat-label">{t('Consumed')}</div>
                    <div className="cust-card-stat-val num">{formatMoney(cust.consumed, currency)}</div>
                  </div>
                  <div>
                    <div className="cust-card-stat-label">{t('Paid')}</div>
                    <div className="cust-card-stat-val num" style={{ color: 'var(--sage-600)' }}>
                      {formatMoney(cust.paid, currency)}
                    </div>
                  </div>
                  <div>
                    <div className="cust-card-stat-label">{t('Haraa')}</div>
                    <div className="cust-card-stat-val num" style={{ color: hasDebt ? 'var(--danger-700)' : 'var(--sage-600)' }}>
                      {formatMoney(cust.remaining, currency)}
                    </div>
                  </div>
                </div>

                {/* Next due date reminder */}
                {cust.nextDue && (
                  <div style={{
                    fontSize: '11.5px',
                    color: cust.nextDue.isOverdue ? 'var(--danger-700)' : 'var(--ink-2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <Icon name={cust.nextDue.isOverdue ? 'alert' : 'clock'} size={13} sw={2} />
                    <span>
                      {cust.nextDue.isOverdue ? t('Overdue since') : t('Expected')}: {formatDateLabel(cust.nextDue.dueDate, lang)}
                    </span>
                  </div>
                )}

                {/* Card Action Buttons */}
                <div className="cust-card-actions">
                  {hasDebt ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => onOpenPayModal(cust)}
                      >
                        <Icon name="card" size={13} sw={2} />
                        <span>{t('Pay')}</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-glass btn-sm"
                        onClick={() => onSettleFull(cust)}
                        title="Hal mar wada xidh haraaga"
                      >
                        <Icon name="check" size={13} sw={2} />
                        <span>Wada Bixi</span>
                      </button>
                    </>
                  ) : (
                    <span className="badge badge-paid" style={{ fontSize: '11.5px' }}>
                      <Icon name="check" size={12} sw={2.2} />
                      <span>Dhammaystiran</span>
                    </span>
                  )}

                  {phoneClean && hasDebt && (
                    <a
                      href={`https://wa.me/${phoneClean}?text=${encodeURIComponent(
                        `Asc ${cust.name}, waxaan kaa soo xasuusinaynaa haraagaaga ${formatMoney(cust.remaining, currency)} ee ${profile.restaurantName || profile.name || 'Sahafi'}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-whatsapp btn-sm"
                      style={{ textDecoration: 'none' }}
                      title="WhatsApp Reminder"
                    >
                      <Icon name="whatsapp" size={13} sw={2} />
                      <span>WhatsApp</span>
                    </a>
                  )}

                  <button
                    type="button"
                    className="btn btn-glass btn-sm"
                    onClick={() => onOpenAddModal({ customerId: cust.id, customerName: cust.name, phone: cust.phone, isRukun: cust.isRukun })}
                    title={t('Add food')}
                  >
                    <Icon name="plus" size={13} sw={2} />
                    <span>+ Cunto</span>
                  </button>

                  <button
                    type="button"
                    className="btn btn-glass btn-sm"
                    onClick={() => onNavigateToCustomer(cust.id)}
                    title="Eeg Taariikhda Buuxda"
                  >
                    <Icon name="user" size={13} sw={2} />
                    <span>Eeg</span>
                  </button>

                  <button
                    type="button"
                    className="icon-btn danger"
                    style={{ marginLeft: 'auto' }}
                    onClick={() => onDeleteCustomer(cust.id, cust.name)}
                    title="Tirtir Macmiilka"
                  >
                    <Icon name="trash" size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Customers;
