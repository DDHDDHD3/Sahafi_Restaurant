import React, { useState, useMemo } from 'react';
import Icon from '../components/Icon';
import { formatMoney, formatDateLabel, formatTimeLabel, createFormatters } from '../i18n/translations';

export const RentBook = ({
  records = [],
  profile = {},
  initialFilter = 'All',
  onOpenAddModal,
  onOpenEditModal,
  onOpenPayModal,
  onDeleteRecord,
  onNavigateToCustomer
}) => {
  const currency = profile.currency || '$';
  const lang = profile.defaultLanguage || profile.lang || 'so';
  const { t } = createFormatters(lang);

  const [filter, setFilter] = useState(initialFilter);
  const [search, setSearch] = useState('');

  const filterOptions = ['All', 'Unpaid', 'Partial', 'Overdue', 'Paid'];

  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      // Status filter
      if (filter !== 'All') {
        const matchStatus = rec.status.toUpperCase() === filter.toUpperCase();
        if (!matchStatus) return false;
      }

      // Search filter
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const custName = (rec.customer?.name || '').toLowerCase();
        const custPhone = (rec.customer?.phone || '').toLowerCase();
        const food = (rec.foodDescription || '').toLowerCase();
        const notes = (rec.notes || '').toLowerCase();
        if (!custName.includes(q) && !custPhone.includes(q) && !food.includes(q) && !notes.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [records, filter, search]);

  return (
    <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header */}
      <div className="page-head">
        <div style={{ flex: 1, minWidth: '220px' }}>
          <h1>{t('Rent Book')}</h1>
          <p className="sub">{t('Every plate served on credit, when it is due, and what came back.')}</p>
        </div>
        <button
          id="rentbookAddRecordBtn"
          type="button"
          className="btn btn-primary"
          onClick={() => onOpenAddModal()}
        >
          <Icon name="plus" size={16} sw={2.2} />
          <span>{t('Add Record')}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="seg" role="radiogroup" aria-label={t('Filter by status')}>
          {filterOptions.map(opt => (
            <button
              key={opt}
              type="button"
              className={`seg-opt ${filter === opt ? 'active' : ''}`}
              aria-pressed={filter === opt}
              onClick={() => setFilter(opt)}
            >
              {t(opt)}
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
            placeholder={t('Search name, phone or food…')}
            aria-label={t('Search records')}
          />
        </div>
      </div>

      {/* Records Table / Sheet */}
      <div className="sheet">
        {filteredRecords.length === 0 ? (
          <div className="empty">
            <div className="empty-ico">
              <Icon name="book" size={32} />
            </div>
            <h3>{search ? t('Nothing matches that') : t('The book is clear')}</h3>
            <p className="sub" style={{ marginTop: '6px' }}>
              {search ? t('Try another name, food or filter.') : t('Write down the first plate served on credit.')}
            </p>
          </div>
        ) : (
          <div className="tbl-scroll">
            <table className="tbl" aria-label="Rent book records table">
              <thead>
                <tr>
                  <th>{t('Customer')}</th>
                  <th>{t('Food')}</th>
                  <th className="r">{t('Total')}</th>
                  <th className="r">{t('Paid')}</th>
                  <th className="r">{t('Haraa')}</th>
                  <th>{t('Expected payment')}</th>
                  <th>{t('Status')}</th>
                  <th className="r">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(rec => {
                  const cust = rec.customer || { id: rec.customerId, name: 'Unknown', phone: '' };
                  const remaining = Number(rec.remainingAmount) || (Number(rec.amount) - Number(rec.paidAmount));
                  const isOver = rec.status === 'OVERDUE';
                  const phoneClean = (cust.phone || '').replace(/\D/g, '');

                  return (
                    <tr key={rec.id} className="row-enter">
                      {/* Customer */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div className="avatar">
                            {cust.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <button
                              type="button"
                              className="linkish"
                              style={{ fontWeight: 600 }}
                              onClick={() => onNavigateToCustomer(cust.id)}
                            >
                              {cust.name}
                            </button>
                            <div className="muted-3" style={{ fontSize: '11px' }}>
                              {cust.phone || ''}
                              {cust.isRukun && (
                                <span className="badge badge-rukun" style={{ marginLeft: '6px', fontSize: '9.5px', padding: '1px 6px' }}>
                                  Rukun
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Food */}
                      <td>
                        <div style={{ fontWeight: 500 }}>{rec.foodDescription}</div>
                        {rec.notes && (
                          <div className="muted-3" style={{ fontSize: '11px', fontStyle: 'italic' }}>
                            {rec.notes}
                          </div>
                        )}
                      </td>

                      {/* Total */}
                      <td className="r n" style={{ fontWeight: 600 }}>
                        {formatMoney(rec.amount, currency)}
                      </td>

                      {/* Paid */}
                      <td className="r n" style={{ color: 'var(--sage-600)' }}>
                        {formatMoney(rec.paidAmount, currency)}
                      </td>

                      {/* Remaining / Haraa */}
                      <td className="r n" style={{ fontWeight: 700, color: remaining > 0 ? 'var(--danger-700)' : 'var(--sage-600)' }}>
                        {formatMoney(remaining, currency)}
                      </td>

                      {/* Expected payment date */}
                      <td>
                        {rec.dueDate ? (
                          <div style={{ fontSize: '12px', color: isOver ? 'var(--danger-700)' : 'var(--ink)' }}>
                            <span style={{ fontWeight: isOver ? 700 : 500 }}>
                              {formatDateLabel(rec.dueDate, lang)}
                            </span>
                            {rec.dueTime && (
                              <span className="muted-3" style={{ marginLeft: '4px' }}>
                                {formatTimeLabel(rec.dueTime, lang)}
                              </span>
                            )}
                            {isOver && (
                              <div style={{ fontSize: '10px', color: 'var(--danger-700)', fontWeight: 700, textTransform: 'uppercase' }}>
                                {t('Overdue')}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="muted-3" style={{ fontSize: '12px' }}>—</span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td>
                        <span className={`badge badge-${rec.status}`}>
                          <span className="dot" />
                          <span>
                            {t(rec.status === 'PAID' ? 'Paid in full' : (rec.status === 'PARTIAL' ? 'Partial' : (rec.status === 'OVERDUE' ? 'Overdue' : 'Unpaid')))}
                          </span>
                        </span>
                      </td>

                      {/* Action buttons */}
                      <td className="r">
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          {remaining > 0.001 && (
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => onOpenPayModal({ ...cust, remaining })}
                              title={t('Record payment')}
                            >
                              <Icon name="card" size={13} sw={2} />
                              <span>{t('Pay')}</span>
                            </button>
                          )}

                          {phoneClean && remaining > 0.001 && (
                            <a
                              href={`https://wa.me/${phoneClean}?text=${encodeURIComponent(
                                `Asc ${cust.name}, waxaan kaa soo xasuusinaynaa haraagaaga ${formatMoney(remaining, currency)} ee ${profile.restaurantName || profile.name || 'Sahafi'}.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-whatsapp btn-sm"
                              style={{ textDecoration: 'none' }}
                              title="WhatsApp Reminder"
                            >
                              <Icon name="whatsapp" size={13} sw={2} />
                            </a>
                          )}

                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => onOpenEditModal(rec)}
                            title={t('Edit record')}
                          >
                            <Icon name="edit" size={14} />
                          </button>

                          <button
                            type="button"
                            className="icon-btn danger"
                            onClick={() => onDeleteRecord(rec.id)}
                            title={t('Delete record')}
                          >
                            <Icon name="trash" size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentBook;
