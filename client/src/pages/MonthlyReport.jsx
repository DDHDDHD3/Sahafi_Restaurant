import React, { useState, useEffect } from 'react';
import Icon from '../components/Icon';
import api from '../services/api';
import { formatMoney, formatDateLabel, formatMonthName, createFormatters } from '../i18n/translations';

export const MonthlyReport = ({ profile = {} }) => {
  const currency = profile.currency || '$';
  const lang = profile.defaultLanguage || profile.lang || 'so';
  const { t, F } = {
    ...createFormatters(lang),
    F: createFormatters(lang)
  };

  const [selectedMonth, setSelectedMonth] = useState('');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async (month) => {
    setLoading(true);
    try {
      const res = await api.getMonthlyReport(month);
      setReport(res.data);
      if (!selectedMonth && res.data.selectedMonth) {
        setSelectedMonth(res.data.selectedMonth);
      }
    } catch (err) {
      console.error('Error fetching report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedMonth);
  }, [selectedMonth]);

  const handlePrint = () => {
    window.print();
  };

  const initial = (profile.restaurantName || profile.name || 'Sahafi').charAt(0).toUpperCase();

  return (
    <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Page Header (Hidden on print) */}
      <div className="page-head no-print">
        <div style={{ flex: 1, minWidth: '220px' }}>
          <h1>{t('Monthly Report')}</h1>
          <p className="sub">{t('A statement of the book, ready to print or hand to the owner.')}</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handlePrint}
        >
          <Icon name="print" size={16} sw={2} />
          <span>{t('Print / Save PDF')}</span>
        </button>
      </div>

      {/* Month Selector Chips (Hidden on print) */}
      {report && report.availableMonths && (
        <div className="no-print" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span className="muted-3" style={{ fontSize: '12px', fontWeight: 600 }}>
            {t('Select report month')}:
          </span>
          <button
            type="button"
            className={`chip chip-month ${selectedMonth === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedMonth('all')}
          >
            All Time
          </button>
          {report.availableMonths.map(m => (
            <button
              key={m}
              type="button"
              className={`chip chip-month ${selectedMonth === m ? 'active' : ''}`}
              onClick={() => setSelectedMonth(m)}
            >
              <Icon name="calendar" size={13} sw={2} />
              <span>{formatMonthName(m, lang)}</span>
            </button>
          ))}
        </div>
      )}

      {loading && !report ? (
        <div className="empty">
          <p className="sub">Generating statement...</p>
        </div>
      ) : report ? (
        /* Report Document */
        <div className="report-doc" id="reportDocument">
          {/* Header */}
          <div className="report-head">
            <div className="report-logo">
              {profile.logo ? (
                <img src={profile.logo} alt="Logo" />
              ) : (
                <span>{initial}</span>
              )}
            </div>
            <div>
              <h1 className="report-title">{profile.restaurantName || profile.name || 'Sahafi Restaurant'}</h1>
              <div className="eyebrow" style={{ marginTop: '4px', letterSpacing: '0.12em' }}>
                {t('Monthly Rent Book Statement')}
              </div>
            </div>
            <div className="report-meta">
              <div>
                <strong>{t('Reporting period')}:</strong>{' '}
                {selectedMonth === 'all' ? 'All Time' : formatMonthName(selectedMonth, lang)}
              </div>
              <div>
                <strong>{t('Generated')}:</strong>{' '}
                {new Date().toLocaleDateString(lang === 'so' ? 'so-SO' : 'en-US', { dateStyle: 'long' })}
              </div>
              <div>
                <strong>{t('Phone')}:</strong> {profile.phone || '+252 61 555 0100'}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="report-body">
            {/* Financial Summary Section */}
            <section className="report-sec">
              <div className="report-sec-title">
                <span>{t('Financial summary')}</span>
              </div>

              <div className="grid-stats">
                <div className="stat">
                  <div className="eyebrow">{t('Total consumed')}</div>
                  <div className="v num">{formatMoney(report.total, currency)}</div>
                  <div className="foot">{report.records.length} {t('Total food transactions')}</div>
                </div>

                <div className="stat stat-sage">
                  <div className="eyebrow" style={{ color: 'var(--sage-600)' }}>{t('Total collected')}</div>
                  <div className="v num">{formatMoney(report.collected, currency)}</div>
                  <div className="foot">{report.collectionRate}% {t('Collection rate')}</div>
                </div>

                <div className="stat stat-accent">
                  <div className="eyebrow" style={{ color: 'var(--accent-700)' }}>{t('Closing balance owed')}</div>
                  <div className="v num">{formatMoney(report.outstanding, currency)}</div>
                  <div className="foot">{report.customerBreakdown.filter(c => c.remaining > 0.001).length} {t('Customers still in debt')}</div>
                </div>
              </div>
            </section>

            {/* Customer Breakdown Section */}
            <section className="report-sec">
              <div className="report-sec-title">
                <span>{t('Customer accounts')}</span>
                <span className="n">{report.customerBreakdown.length} {t('Customers')}</span>
              </div>

              {report.customerBreakdown.length === 0 ? (
                <p className="sub">{t('No records')}</p>
              ) : (
                <div className="tbl-scroll">
                  <table className="tbl tbl-flex">
                    <thead>
                      <tr>
                        <th>{t('Customer')}</th>
                        <th className="r">{t('Consumed')}</th>
                        <th className="r">{t('Paid')}</th>
                        <th className="r">{t('Haraa')}</th>
                        <th>{t('Status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.customerBreakdown.map(item => (
                        <tr key={item.customer.id}>
                          <td className="lead" data-l={t('Customer')}>
                            <strong>{item.customer.name}</strong>
                            {item.customer.phone && <span className="muted-3" style={{ fontSize: '11px', marginLeft: '6px' }}>({item.customer.phone})</span>}
                          </td>
                          <td className="r n" data-l={t('Consumed')}>
                            {formatMoney(item.consumed, currency)}
                          </td>
                          <td className="r n pos" data-l={t('Paid')}>
                            {formatMoney(item.paid, currency)}
                          </td>
                          <td className="r n strong" data-l={t('Haraa')} style={{ color: item.remaining > 0 ? 'var(--danger-700)' : 'var(--sage-600)' }}>
                            {formatMoney(item.remaining, currency)}
                          </td>
                          <td data-l={t('Status')}>
                            <span className={`badge badge-${item.status}`}>
                              <span className="dot" />
                              <span>{t(item.status === 'PAID' ? 'Paid in full' : (item.status === 'PARTIAL' ? 'Partial' : (item.status === 'OVERDUE' ? 'Overdue' : 'Unpaid')))}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Recent Payments Section */}
            {report.payments && report.payments.length > 0 && (
              <section className="report-sec">
                <div className="report-sec-title">
                  <span>{t('Payments received')}</span>
                  <span className="n">{report.payments.length} {t('nPayments')}</span>
                </div>

                <div className="tbl-scroll">
                  <table className="tbl">
                    <thead>
                      <tr>
                        <th>{t('Date')}</th>
                        <th>{t('Reminder or note')}</th>
                        <th className="r">{t('Amount received')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.payments.map(p => (
                        <tr key={p.id}>
                          <td>{formatDateLabel(p.paymentDate || p.date, lang)}</td>
                          <td>{p.notes || p.note || 'Cash'}</td>
                          <td className="r n" style={{ color: 'var(--sage-600)', fontWeight: 600 }}>
                            +{formatMoney(p.amount, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>

          {/* Footer */}
          <div className="report-foot">
            <div style={{ flex: 1 }}>
              <div><strong>{t('Prepared for the owner')}</strong></div>
              <div>{profile.restaurantName || profile.name || 'Sahafi Restaurant'} · Mogadishu</div>
            </div>
            <div style={{ minWidth: '180px', borderTop: '1px solid rgba(96,74,48,.2)', paddingTop: '6px', textAlign: 'center' }}>
              <div className="muted-3" style={{ fontSize: '10.5px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Signature / Saxiix
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default MonthlyReport;
