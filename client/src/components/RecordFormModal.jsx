import React, { useState, useEffect, useRef } from 'react';
import Icon from './Icon';
import { CHIPS, createFormatters } from '../i18n/translations';

export const RecordFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  customers = [],
  lang = 'so'
}) => {
  const { t } = createFormatters(lang);

  const [formData, setFormData] = useState({
    customerId: '',
    customerName: '',
    phone: '',
    isRukun: false,
    foodDescription: '',
    amount: '',
    paidAmount: '',
    dueDate: '',
    dueTime: '',
    notes: ''
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          id: initialData.id,
          customerId: initialData.customerId || '',
          customerName: initialData.customerName || (initialData.customer ? initialData.customer.name : ''),
          phone: initialData.phone || (initialData.customer ? initialData.customer.phone : '') || '',
          isRukun: initialData.isRukun !== undefined ? initialData.isRukun : (initialData.customer ? !!initialData.customer.isRukun : false),
          foodDescription: initialData.foodDescription || initialData.food || '',
          amount: initialData.amount !== undefined ? String(initialData.amount) : '',
          paidAmount: initialData.paidAmount !== undefined ? String(initialData.paidAmount) : '0',
          dueDate: initialData.dueDate || '',
          dueTime: initialData.dueTime || '',
          notes: initialData.notes || initialData.note || ''
        });
      } else {
        setFormData({
          customerId: '',
          customerName: '',
          phone: '',
          isRukun: false,
          foodDescription: '',
          amount: '',
          paidAmount: '',
          dueDate: '',
          dueTime: '',
          notes: ''
        });
      }
      setError('');
      setTimeout(() => {
        if (nameInputRef.current) nameInputRef.current.focus();
      }, 50);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleCustomerSelect = (e) => {
    const selectedName = e.target.value;
    const match = customers.find(c => c.name.toLowerCase() === selectedName.toLowerCase());
    if (match) {
      setFormData(prev => ({
        ...prev,
        customerId: match.id,
        customerName: match.name,
        phone: match.phone || prev.phone,
        isRukun: match.isRukun !== undefined ? match.isRukun : prev.isRukun
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        customerId: '',
        customerName: selectedName
      }));
    }
  };

  const handleQuickDate = (type) => {
    const now = new Date();
    let target = new Date();

    if (type === 'today') {
      // today
    } else if (type === 'tomorrow') {
      target.setDate(now.getDate() + 1);
    } else if (type === '3days') {
      target.setDate(now.getDate() + 3);
    } else if (type === 'week') {
      target.setDate(now.getDate() + 7);
    } else if (type === 'endOfMonth') {
      target = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (type === 'clear') {
      setFormData(prev => ({ ...prev, dueDate: '', dueTime: '' }));
      return;
    }

    const yyyy = target.getFullYear();
    const mm = String(target.getMonth() + 1).padStart(2, '0');
    const dd = String(target.getDate()).padStart(2, '0');
    setFormData(prev => ({ ...prev, dueDate: `${yyyy}-${mm}-${dd}` }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const name = (formData.customerName || '').trim();
    const food = (formData.foodDescription || '').trim();
    const amountNum = parseFloat(formData.amount);
    const paidNum = parseFloat(formData.paidAmount || 0);

    if (!name) {
      setError(t('Name and food are required'));
      return;
    }
    if (!food) {
      setError(t('Name and food are required'));
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid total amount greater than 0');
      return;
    }
    if (isNaN(paidNum) || paidNum < 0) {
      setError('Paid amount cannot be negative');
      return;
    }
    if (paidNum > amountNum) {
      setError('Paid amount cannot exceed the total amount');
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        amount: amountNum,
        paidAmount: paidNum
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save record');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="backdrop" role="dialog" aria-modal="true" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-head">
          <div style={{ flex: 1 }}>
            <h2>{initialData ? t('Edit record') : t('Add Record')}</h2>
            <p className="sub">{t('Name, food, price and when they will pay.')}</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Customer Name & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div className="field">
              <label htmlFor="formCustName">{t('Customer name')} *</label>
              <input
                id="formCustName"
                ref={nameInputRef}
                className="input"
                type="text"
                list="customerNameList"
                value={formData.customerName}
                onChange={handleCustomerSelect}
                placeholder="Faarax Maxamed"
                required
              />
              <datalist id="customerNameList">
                {customers.map(c => (
                  <option key={c.id} value={c.name} />
                ))}
              </datalist>
            </div>

            <div className="field">
              <label htmlFor="formPhone">{t('Phone')} ({t('Optional')})</label>
              <input
                id="formPhone"
                className="input"
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+252 61 234 5678"
              />
            </div>
          </div>

          {/* Rukun VIP Checkbox */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              id="formIsRukun"
              type="checkbox"
              checked={formData.isRukun}
              onChange={e => setFormData({ ...formData, isRukun: e.target.checked })}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent)' }}
            />
            <label htmlFor="formIsRukun" style={{ fontSize: '13px', cursor: 'pointer', userSelect: 'none' }}>
              <strong>Macmiil Rukun ah (Regular / VIP Account)</strong>
            </label>
          </div>

          {/* Food Description */}
          <div className="field">
            <label htmlFor="formFood">{t('Food')} *</label>
            <input
              id="formFood"
              className="input"
              type="text"
              value={formData.foodDescription}
              onChange={e => setFormData({ ...formData, foodDescription: e.target.value })}
              placeholder="Bariis + Hilib Ari"
              required
            />
          </div>

          {/* Quick food chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {CHIPS.map(chip => (
              <button
                key={chip}
                type="button"
                className={`chip ${formData.foodDescription === chip ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, foodDescription: chip }))}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Amounts: Total & Paid Now */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div className="field">
              <label htmlFor="formTotal">{t('Total')} ($) *</label>
              <input
                id="formTotal"
                className="input num"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                placeholder="10.00"
                required
              />
            </div>

            <div className="field">
              <label htmlFor="formPaid">{t('Paid now')} ($)</label>
              <input
                id="formPaid"
                className="input num"
                type="number"
                step="0.01"
                min="0"
                value={formData.paidAmount}
                onChange={e => setFormData({ ...formData, paidAmount: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Due Date & Time */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div className="field">
              <label htmlFor="formDueDate">{t('Expected date')} ({t('Optional')})</label>
              <input
                id="formDueDate"
                className="input"
                type="date"
                value={formData.dueDate}
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div className="field">
              <label htmlFor="formDueTime">{t('Expected time')} ({t('Optional')})</label>
              <input
                id="formDueTime"
                className="input"
                type="time"
                value={formData.dueTime}
                onChange={e => setFormData({ ...formData, dueTime: e.target.value })}
              />
            </div>
          </div>

          {/* Quick date buttons */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <button type="button" className="chip" onClick={() => handleQuickDate('today')}>{t('Today')}</button>
            <button type="button" className="chip" onClick={() => handleQuickDate('tomorrow')}>{t('Tomorrow')}</button>
            <button type="button" className="chip" onClick={() => handleQuickDate('3days')}>{t('In 3 days')}</button>
            <button type="button" className="chip" onClick={() => handleQuickDate('week')}>{t('Next week')}</button>
            <button type="button" className="chip" onClick={() => handleQuickDate('endOfMonth')}>{t('End of month')}</button>
            {formData.dueDate && (
              <button type="button" className="chip" onClick={() => handleQuickDate('clear')}>{t('Clear')}</button>
            )}
          </div>

          {/* Notes */}
          <div className="field">
            <label htmlFor="formNotes">{t('Reminder or note')} ({t('Optional')})</label>
            <input
              id="formNotes"
              className="input"
              type="text"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder={t('Will pay after Friday prayer')}
            />
          </div>

          {/* Actions */}
          <div className="modal-actions" style={{ justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              id="cancelRecordModalBtn"
              type="button"
              className="btn btn-glass"
              onClick={onClose}
              disabled={submitting}
            >
              {t('Cancel')}
            </button>
            <button
              id="submitRecordModalBtn"
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              <Icon name="check" size={15} sw={2.2} />
              <span>{submitting ? 'Saving...' : (initialData ? t('Save changes') : t('Save record'))}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecordFormModal;
