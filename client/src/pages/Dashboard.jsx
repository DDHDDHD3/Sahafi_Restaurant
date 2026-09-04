import React from 'react';
import Icon from '../components/Icon';
import { formatMoney, formatDateLabel, formatTimeLabel, createFormatters } from '../i18n/translations';

export const Dashboard = ({
  summary = null,
  profile = {},
  onNavigate,
  onOpenAddModal,
  onOpenPayModal,
  onSettleFull
}) => {
  const currency = profile.currency || '$';
  const lang = profile.defaultLanguage || profile.lang || 'so';
  const { t, F } = {
    ...createFormatters(lang),
    F: createFormatters(lang)
  };

  if (!summary) {
    return (
      <div className="empty">
        <p className="sub">Loading dashboard summary...</p>
      </div>
    );
  }

  const {
    totalConsumed = 0,
    totalCollected = 0,
    totalRemaining = 0,
    collectionRate = 0,
    statusCounts = {},
    debtorsCount = 0,
    settledCount = 0,
    totalCustomers = 0,
    topDebtors = [],
    upcomingRecords = []
  } = summary;

  const overdueCount = statusCounts.OVERDUE || 0;

  return (
    <div className="anim-fade" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Page Header */}
      <div className="page-head">
        <div style={{ flex: 1, minWidth: '220px' }}>
          <h1>{t('Dashboard')}</h1>
          <p className="sub">{t('Every plate served on credit, when it is due, and what came back.')}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            id="dashAddRecordBtn"
            type="button"
            className="btn btn-primary"
            onClick={onOpenAddModal}
          >
            <Icon name="plus" size={16} sw={2.2} />
            <span>{t('Add Record')}</span>
          </button>
          <button
            id="dashOpenBookBtn"
            type="button"
            className="btn btn-glass"
            onClick={() => onNavigate('rentbook')}
          >
            <Icon name="book" size={16} sw={1.9} />
            <span>{t('Open book')}</span>
          </button>
        </div>
      </div>

      {/* Overdue Alert Banner if any overdue */}
      {overdueCount > 0 && (
        <div
          className="overdue-pulse"
          style={{
            background: 'linear-gradient(160deg, #fceee9, #f8ddd4)',
            border: '1px solid var(--danger-200)',
            borderRadius: 'var(--r-lg)',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'var(--danger-100)',
            color: 'var(--danger-700)',
            display: 'grid',
            placeItems: 'center',
            flexShrink: 0
          }}>
            <Icon name="alert" size={18} sw={2} />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <strong style={{ color: 'var(--danger-700)', fontSize: '14px' }}>
              {F.overdueBanner(overdueCount)}
            </strong>
            <p className="muted" style={{ fontSize: '12px' }}>
              {t('Who owes money')} — review dates on the Rent Book.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-danger btn-sm"
            onClick={() => onNavigate('rentbook', { filter: 'Overdue' })}
          >
            <span>{t('Review')}</span>
            <Icon name="chev" size={13} sw={2} style={{ transform: 'rotate(-90deg)' }} />
          </button>
        </div>
      )}

      {/* Primary KPI Stat Cards */}
      <div className="grid-stats">
        {/* Total Consumed */}
        <div className="stat">
          <div className="eyebrow">{t('Total consumed')}</div>
          <div className="v num">{formatMoney(totalConsumed, currency)}</div>
          <div className="foot">{summary.totalTransactions} {t('Transactions')}</div>
        </div>

        {/* Total Collected */}
        <div className="stat stat-sage">
          <div className="eyebrow" style={{ color: 'var(--sage-600)' }}>{t('Collected')}</div>
          <div className="v num">{formatMoney(totalCollected, currency)}</div>
          <div className="foot">{collectionRate}% {t('Collection rate')}</div>
        </div>

        {/* Outstanding Balance */}
        <div className="stat stat-accent">
          <div className="eyebrow" style={{ color: 'var(--accent-700)' }}>{t('Outstanding Haraa')}</div>
          <div className="v num">{formatMoney(totalRemaining, currency)}</div>
          <div className="foot">{debtorsCount} {t('Customers still in debt')}</div>
        </div>

        {/* Settled / Customers */}
        <div className="stat">
          <div className="eyebrow">{t('Customers')}</div>
          <div className="v num">{totalCustomers}</div>
          <div className="foot">{settledCount} {t('Settled')}</div>
        </div>
      </div>

      {/* Progress Bar & Status distribution */}
      <div className="panel sheet-pad" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h3 style={{ fontSize: '16px' }}>{t('Collection progress')}</h3>
            <p className="sub" style={{ fontSize: '12.5px' }}>
              {F.collectedOf(formatMoney(totalCollected, currency), formatMoney(totalConsumed, currency), formatMoney(totalRemaining, currency))}
            </p>
          </div>
          <div className="num" style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-700)' }}>
            {collectionRate}%
          </div>
        </div>

        <div className="bar bar-accent" style={{ height: '8px' }}>
          <i style={{ width: `${Math.min(100, collectionRate)}%` }} />
        </div>

        {/* Status Mini Badges */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px' }}>
          <div
            className="badge badge-unpaid"
            style={{ cursor: 'pointer', padding: '5px 12px' }}
            onClick={() => onNavigate('rentbook', { filter: 'Unpaid' })}
          >
            <span className="dot" />
            <span>{t('Unpaid')}: {statusCounts.UNPAID || 0}</span>
          </div>

          <div
            className="badge badge-partial"
            style={{ cursor: 'pointer', padding: '5px 12px' }}
            onClick={() => onNavigate('rentbook', { filter: 'Partial' })}
          >
            <span className="dot" />
            <span>{t('Partial')}: {statusCounts.PARTIAL || 0}</span>
          </div>

          <div
            className="badge badge-overdue"
            style={{ cursor: 'pointer', padding: '5px 12px' }}
            onClick={() => onNavigate('rentbook', { filter: 'Overdue' })}
          >
            <span className="dot" />
            <span>{t('Overdue')}: {statusCounts.OVERDUE || 0}</span>
          </div>

          <div
            className="badge badge-paid"
            style={{ cursor: 'pointer', padding: '5px 12px' }}
            onClick={() => onNavigate('rentbook', { filter: 'Paid' })}
          >
            <span className="dot" />
            <span>{t('Paid in full')}: {statusCounts.PAID || 0}</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Top Debtors & Upcoming Payments */}
      <div className="dash-cols">
        {/* Top Debtors Column */}
        <div className="sheet sheet-pad" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="section-head">
            <h3>{t('Who owes money')}</h3>
            <button
              type="button"
              className="btn btn-quiet btn-sm"
              onClick={() => onNavigate('customers')}
            >
              {t('All customers')}
            </button>
          </div>

          {topDebtors.length === 0 ? (
            <div className="empty" style={{ padding: '30px 10px' }}>
              <p className="sub">{t('Nobody owes haraa right now.')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {topDebtors.map(debtor => {
                const phoneClean = (debtor.phone || '').replace(/\D/g, '');
                return (
                  <div
                    key={debtor.id}
                    className="mini"
                    style={{ justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '160px' }}>
                      <div className="avatar">
                        {debtor.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <button
                          type="button"
                          className="linkish"
                          style={{ fontWeight: 600, fontSize: '13.5px' }}
                          onClick={() => onNavigate('customer-detail', { customerId: debtor.id })}
                        >
                          {debtor.name}
                        </button>
                        <div className="muted-3" style={{ fontSize: '11px' }}>
                          {debtor.phone || t('noPhone')}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div className="num" style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--danger-700)' }}>
                          {formatMoney(debtor.remaining, currency)}
                        </div>
                        <div className="muted-3" style={{ fontSize: '10px' }}>
                          {debtor.overdueCount > 0 ? (
                            <span style={{ color: 'var(--danger-700)', fontWeight: 600 }}>
                              {debtor.overdueCount} {t('Overdue')}
                            </span>
                          ) : t('Remaining')}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <button
                        type="button"
                        className="btn btn-primary btn-sm"
                        onClick={() => onOpenPayModal(debtor)}
                        title={t('Record payment')}
                      >
                        <Icon name="card" size={13} sw={2} />
                        <span>{t('Pay')}</span>
                      </button>

                      {phoneClean && (
                        <a
                          href={`https://wa.me/${phoneClean}?text=${encodeURIComponent(
                            `Asc ${debtor.name}, waxaan kaa soo xasuusinaynaa haraagaaga ${formatMoney(debtor.remaining, currency)} ee ${profile.restaurantName || profile.name || 'Sahafi'}.`
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Scheduled Payments Column */}
        <div className="sheet sheet-pad" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="section-head">
            <h3>{t('Payment schedule')}</h3>
            <button
              type="button"
              className="btn btn-quiet btn-sm"
              onClick={() => onNavigate('rentbook')}
            >
              {t('Open book')}
            </button>
          </div>

          {upcomingRecords.length === 0 ? (
            <div className="empty" style={{ padding: '30px 10px' }}>
              <p className="sub">{t('No payment dates set yet. Add one when you write a record.')}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {upcomingRecords.map(rec => {
                const isOver = rec.status === 'OVERDUE';
                return (
                  <div
                    key={rec.id}
                    className="mini"
                    style={{
                      justifyContent: 'space-between',
                      background: isOver ? 'var(--danger-100)' : 'var(--solid-2)',
                      borderColor: isOver ? 'var(--danger-200)' : 'var(--glass-edge)'
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 600, fontSize: '13px' }}>
                        {rec.customerName}
                      </div>
                      <div className="muted" style={{ fontSize: '11.5px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {rec.foodDescription}
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: isOver ? 'var(--danger-700)' : 'var(--ink-3)',
                        fontWeight: isOver ? 600 : 400
                      }}>
                        {formatDateLabel(rec.dueDate, lang)} {rec.dueTime ? `· ${formatTimeLabel(rec.dueTime, lang)}` : ''}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div className="num" style={{ fontWeight: 700, fontSize: '14px' }}>
                        {formatMoney(rec.remainingAmount, currency)}
                      </div>
                      <span className={`badge badge-${rec.status}`} style={{ fontSize: '10px', padding: '2px 8px' }}>
                        {t(rec.status === 'OVERDUE' ? 'Overdue' : (rec.status === 'PARTIAL' ? 'Partial' : 'Unpaid'))}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
