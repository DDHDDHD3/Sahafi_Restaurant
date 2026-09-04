import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { formatMoney, createFormatters, round2 } from '../i18n/translations';

export const PaymentModal = ({
  isOpen,
  onClose,
  onSubmit,
  customer = null,
  currency = '$',
  lang = 'so'
}) => {
  const { t, F } = {
    ...createFormatters(lang),
    F: createFormatters(lang)
  };

  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('Cash');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef(null);

  const remaining = customer ? (Number(customer.remaining) || 0) : 0;
  const numEntered = parseFloat(amount) || 0;
  const afterBalance = Math.max(0, round2(remaining - numEntered));
  const willClear = remaining > 0 && numEntered >= remaining;

  useEffect(() => {
    if (isOpen) {
      setAmount(remaining > 0 ? String(remaining) : '');
      setMethod('Cash');
      setNotes('');
      setError('');
      setTimeout(() => {
        if (inputRef.current) inputRef.current.focus();
      }, 50);
    }
  }, [isOpen, customer]);

  if (!isOpen || !customer) return null;

  const handleQuickAmount = (val) => {
    setAmount(String(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError('Please enter a valid payment amount greater than 0');
      return;
    }
    if (val > remaining + 0.001) {
      setError(`Payment cannot exceed remaining balance (${formatMoney(remaining, currency)})`);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        customerId: customer.id,
        amount: val,
        notes: notes ? `${method}: ${notes}` : method,
        paymentDate: new Date()
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Payment recording failed');
    } finally {
      setSubmitting(false);
    }
  };

  // Receipt text generator for WhatsApp sharing
  const phoneClean = (customer.phone || '').replace(/\D/g, '');
  const receiptText = `Asc ${customer.name}, waxaan xaqiijinaynaa bixinta ${formatMoney(numEntered || remaining, currency)}. Haraaga hadhay waa ${formatMoney(afterBalance, currency)}. Mahadsanid!`;

  return (
    <div className="backdrop" role="dialog" aria-modal="true" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-head">
          <div style={{ flex: 1 }}>
            <h2>{t('Record payment')}</h2>
            <p className="sub">
              {customer.name} · {t('Currently owes')}: <strong className="n" style={{ color: 'var(--danger-700)' }}>{formatMoney(remaining, currency)}</strong>
            </p>
          </div>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label={t('Close dialog')}
          >
            <Icon name="close" size={16} />
          </button>
        </div>

        {error && (
          <div style={{
            background: 'var(--danger-100)',
            color: 'var(--danger-700)',
            border: '1px solid var(--danger-200)',
            padding: '10px 14px',
            borderRadius: '12px',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        {/* Quick presets */}
        {remaining > 0 && (
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="chip active"
              onClick={() => handleQuickAmount(remaining)}
            >
              {F.payFull(formatMoney(remaining, currency))}
            </button>
            {remaining > 2 && (
              <button
                type="button"
                className="chip"
                onClick={() => handleQuickAmount(round2(remaining / 2))}
              >
                {F.half(formatMoney(round2(remaining / 2), currency))}
              </button>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Amount field */}
          <div className="field">
            <label htmlFor="paymentAmountInput">{t('Amount received')} ({currency}) *</label>
            <input
              id="paymentAmountInput"
              ref={inputRef}
              className="input num"
              type="number"
              step="0.01"
              min="0.01"
              max={remaining}
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          {/* Payment Method */}
          <div className="field">
            <label htmlFor="paymentMethodSelect">{t('Method')}</label>
            <select
              id="paymentMethodSelect"
              className="input"
              value={method}
              onChange={e => setMethod(e.target.value)}
            >
              <option value="Cash">{t('Cash')} (Caddaan)</option>
              <option value="EVC Plus">EVC Plus / Zaad / Sahal</option>
              <option value="Bank transfer">{t('Bank transfer')} (Bangi)</option>
            </select>
          </div>

          {/* Notes */}
          <div className="field">
            <label htmlFor="paymentNoteInput">{t('Reminder or note')} ({t('Optional')})</label>
            <input
              id="paymentNoteInput"
              className="input"
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="E.g. Paid at counter"
            />
          </div>

          {/* Live Remaining Balance Calculation Preview */}
          <div style={{
            background: 'var(--solid-2)',
            padding: '12px 14px',
            borderRadius: 'var(--r-md)',
            border: '1px solid var(--glass-edge)',
            fontSize: '13px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          }}>
            <div>
              {willClear ? (
                <span dangerouslySetInnerHTML={{ __html: F.clearsAccount(customer.name) }} />
              ) : (
                <span dangerouslySetInnerHTML={{ __html: F.remainingAfter(formatMoney(afterBalance, currency)) }} />
              )}
            </div>

            {customer.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '6px', borderTop: '1px dashed var(--glass-edge)' }}>
                <a
                  href={`https://wa.me/${phoneClean}?text=${encodeURIComponent(receiptText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp btn-sm"
                  style={{ textDecoration: 'none' }}
                >
                  <Icon name="whatsapp" size={14} sw={2} />
                  <span>WhatsApp Receipt</span>
                </a>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="modal-actions" style={{ justifyContent: 'flex-end', marginTop: '6px' }}>
            <button
              id="cancelPaymentBtn"
              type="button"
              className="btn btn-glass"
              onClick={onClose}
              disabled={submitting}
            >
              {t('Cancel')}
            </button>
            <button
              id="submitPaymentBtn"
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              <Icon name="check" size={15} sw={2.2} />
              <span>{submitting ? 'Saving...' : t('Save payment')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
