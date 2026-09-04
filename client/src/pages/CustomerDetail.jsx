import React, { useEffect, useState } from 'react';
import Icon from '../components/Icon';
import api from '../services/api';
import { formatMoney, formatDateLabel, formatDateLong, formatTimeLabel, createFormatters } from '../i18n/translations';

export const CustomerDetail = ({
  customerId,
  profile = {},
  onBack,
  onOpenAddModal,
  onOpenPayModal,
  onOpenEditModal,
  onDeleteRecord,
  onSettleFull
}) => {
  const currency = profile.currency || '$';
  const lang = profile.defaultLanguage || profile.lang || 'so';
  const { t, F } = {
    ...createFormatters(lang),
    F: createFormatters(lang)
  };

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCustomer = async () => {
    if (!customerId) return;
    setLoading(true);
    try {
      const res = await api.getCustomer(customerId);
      setCustomer(res.data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load customer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

  if (loading) {
    return (
      <div className="empty">
        <p className="sub">Loading customer ledger...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="sheet sheet-pad empty">
        <h3>Customer not found</h3>
        <p className="sub">{error}</p>
        <button type="button" className="btn btn-glass" style={{ marginTop: '14px' }} onClick={onBack}>
          <Icon name="back" size={16} />
          <span>Back to Customers</span>
        </button>
      </div>
    );
  }

  const {
    name,
    phone,
    notes,
    isRukun,
    consumed = 0,
    paid = 0,
    remaining = 0,
    status = 'PAID',
    creditRecords = [],
    payments = []
  } = customer;

  const phoneClean = (phone || '').replace(/\D/g, '');
  const hasDebt = remaining > 0.001;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Back button */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <button type="button" className="btn btn-quiet" onClick={onBack}>
          <Icon name="back" size={16} sw={2} />
          <span>{t('All customers')}</span>
        </button>
      </div>

      {/* Profile Card Header */}
      <div className="sheet sheet-pad">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div className="avatar avatar-lg">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '24px' }}>{name}</h1>
                {isRukun && (
                  <span className="badge badge-rukun" style={{ fontSize: '11px', padding: '2px 8px' }}>
                    Rukun (VIP)
                  </span>
                )}
                <span className={`badge badge-${status}`}>
                  <span className="dot" />
                  <span>{t(status === 'PAID' ? 'Paid in full' : (status === 'PARTIAL' ? 'Partial' : (status === 'OVERDUE' ? 'Overdue' : 'Unpaid')))}</span>
                </span>
              </div>
              <div className="muted" style={{ fontSize: '13px', marginTop: '4px' }}>
                {phone || t('noPhone')}
                {notes && <span style={{ marginLeft: '8px', fontStyle: 'italic' }}>· {notes}</span>}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {phoneClean && hasDebt && (
              <a
                href={`https://wa.me/${phoneClean}?text=${encodeURIComponent(
                  `Asc ${name}, waxaan kaa soo xasuusinaynaa haraagaaga ${formatMoney(remaining, currency)} ee ${profile.restaurantName || profile.name || 'Sahafi'}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp"
                style={{ textDecoration: 'none' }}
              >
                <Icon name="whatsapp" size={15} sw={2} />
                <span>WhatsApp</span>
              </a>
            )}

            <button
              type="button"
              className="btn btn-glass"
              onClick={handlePrint}
            >
              <Icon name="print" size={15} sw={2} />
              <span>{t('Print / Save PDF')}</span>
            </button>

            <button
              type="button"
              className="btn btn-glass"
              onClick={() => onOpenAddModal({ customerId: customer.id, customerName: name, phone, isRukun })}
            >
              <Icon name="plus" size={15} sw={2.2} />
              <span>{t('Add food')}</span>
            </button>

            {hasDebt && (
              <>
                <button
                  type="button"
                  className="btn btn-glass"
                  onClick={() => onSettleFull(customer, () => fetchCustomer())}
                >
                  <Icon name="check" size={15} sw={2} />
                  <span>Wada Bixi</span>
                </button>

                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => onOpenPayModal({ ...customer, remaining }, () => fetchCustomer())}
                >
                  <Icon name="card" size={15} sw={2} />
                  <span>{t('Record payment')}</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* 3-Column Stats Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginTop: '20px' }}>
          <div className="mini">
            <div>
              <div className="eyebrow">{t('Total consumed')}</div>
              <div className="num" style={{ fontSize: '20px', fontWeight: 700 }}>
                {formatMoney(consumed, currency)}
              </div>
              <div className="muted-3" style={{ fontSize: '11px' }}>
                {creditRecords.length} {t('Transactions')}
              </div>
            </div>
          </div>

          <div className="mini">
            <div>
              <div className="eyebrow" style={{ color: 'var(--sage-600)' }}>{t('Total paid')}</div>
              <div className="num" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--sage-600)' }}>
                {formatMoney(paid, currency)}
              </div>
              <div className="muted-3" style={{ fontSize: '11px' }}>
                {payments.length} {t('Payments received')}
              </div>
            </div>
          </div>

          <div className="mini" style={{ background: hasDebt ? 'var(--danger-100)' : 'var(--solid-2)' }}>
            <div>
              <div className="eyebrow" style={{ color: hasDebt ? 'var(--danger-700)' : 'var(--ink-3)' }}>
                {t('Remaining Haraa')}
              </div>
              <div className="num" style={{ fontSize: '20px', fontWeight: 700, color: hasDebt ? 'var(--danger-700)' : 'var(--sage-600)' }}>
                {formatMoney(remaining, currency)}
              </div>
              <div className="muted-3" style={{ fontSize: '11px' }}>
                {hasDebt ? `${creditRecords.filter(r => Number(r.amount) - Number(r.paidAmount) > 0.001).length} open items` : 'Fully cleared'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Credit Records Table */}
      <div className="sheet sheet-pad">
        <div className="section-head">
          <h3>{t('Food history')} ({creditRecords.length})</h3>
        </div>

        {creditRecords.length === 0 ? (
          <div className="empty" style={{ padding: '24px 0' }}>
            <p className="sub">{t('No records')}</p>
          </div>
        ) : (
          <div className="tbl-scroll">
            <table className="tbl">
              <thead>
                <tr>
                  <th>{t('Date')}</th>
                  <th>{t('Food')}</th>
                  <th className="r">{t('Total')}</th>
                  <th className="r">{t('Paid')}</th>
                  <th className="r">{t('Haraa')}</th>
                  <th>{t('Expected payment')}</th>
                  <th>{t('Status')}</th>
                  <th className="r no-print">{t('Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {creditRecords.map(rec => {
                  const recRemaining = Number(rec.remainingAmount) || (Number(rec.amount) - Number(rec.paidAmount));
                  const isOver = rec.status === 'OVERDUE';
                  return (
                    <tr key={rec.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {formatDateLabel(rec.createdAt || rec.date, lang)}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{rec.foodDescription}</div>
                        {rec.notes && <div className="muted-3" style={{ fontSize: '11px' }}>{rec.notes}</div>}
                      </td>
                      <td className="r n" style={{ fontWeight: 600 }}>{formatMoney(rec.amount, currency)}</td>
                      <td className="r n" style={{ color: 'var(--sage-600)' }}>{formatMoney(rec.paidAmount, currency)}</td>
                      <td className="r n" style={{ fontWeight: 700, color: recRemaining > 0 ? 'var(--danger-700)' : 'var(--sage-600)' }}>
                        {formatMoney(recRemaining, currency)}
                      </td>
                      <td>
                        {rec.dueDate ? (
                          <span style={{ color: isOver ? 'var(--danger-700)' : 'inherit', fontWeight: isOver ? 700 : 400 }}>
                            {formatDateLabel(rec.dueDate, lang)} {rec.dueTime || ''}
                          </span>
                        ) : '—'}
                      </td>
                      <td>
                        <span className={`badge badge-${rec.status}`}>
                          <span className="dot" />
                          <span>{t(rec.status === 'PAID' ? 'Paid in full' : (rec.status === 'PARTIAL' ? 'Partial' : (rec.status === 'OVERDUE' ? 'Overdue' : 'Unpaid')))}</span>
                        </span>
                      </td>
                      <td className="r no-print">
                        <div style={{ display: 'inline-flex', gap: '4px' }}>
                          <button
                            type="button"
                            className="icon-btn"
                            onClick={() => onOpenEditModal(rec, () => fetchCustomer())}
                          >
                            <Icon name="edit" size={13} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn danger"
                            onClick={() => onDeleteRecord(rec.id, () => fetchCustomer())}
                          >
                            <Icon name="trash" size={13} />
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

      {/* Payments History Table */}
      <div className="sheet sheet-pad">
        <div className="section-head">
          <h3>{t('Payment history')} ({payments.length})</h3>
        </div>

        {payments.length === 0 ? (
          <div className="empty" style={{ padding: '24px 0' }}>
            <p className="sub">{t('No payments yet')}</p>
          </div>
        ) : (
          <div className="tbl-scroll">
            <table className="tbl">
              <thead>
                <tr>
                  <th>{t('Date')}</th>
                  <th>{t('Method')} / {t('Reminder or note')}</th>
                  <th className="r">{t('Amount received')}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {formatDateLong(p.paymentDate || p.createdAt || p.date, lang)}
                    </td>
                    <td>
                      {p.notes || p.note || 'Cash'}
                    </td>
                    <td className="r n" style={{ fontWeight: 700, color: 'var(--sage-600)', fontSize: '14px' }}>
                      +{formatMoney(p.amount, currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetail;
