import React, { useState, useEffect, useCallback } from 'react';
import api from './services/api';
import Sidebar from './components/Sidebar';
import TabBar from './components/TabBar';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import RecordFormModal from './components/RecordFormModal';
import PaymentModal from './components/PaymentModal';

// Pages
import Dashboard from './pages/Dashboard';
import RentBook from './pages/RentBook';
import Customers from './pages/Customers';
import CustomerDetail from './pages/CustomerDetail';
import MonthlyReport from './pages/MonthlyReport';
import Settings from './pages/Settings';

export function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [activeCustomerId, setActiveCustomerId] = useState(null);
  const [rentBookFilter, setRentBookFilter] = useState('All');

  // Server data states
  const [profile, setProfile] = useState({
    restaurantName: 'Sahafi Restaurant',
    currency: '$',
    defaultLanguage: 'so'
  });
  const [summary, setSummary] = useState(null);
  const [records, setRecords] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [recordModalData, setRecordModalData] = useState(null);

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payModalCustomer, setPayModalCustomer] = useState(null);

  // Toast
  const [toastMessage, setToastMessage] = useState('');

  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3600);
  }, []);

  // Fetch all core application state from Express backend
  const refreshAllData = useCallback(async () => {
    try {
      const [profRes, sumRes, recsRes, custsRes] = await Promise.all([
        api.getProfile(),
        api.getDashboardSummary(),
        api.getRecords(),
        api.getCustomers()
      ]);

      if (profRes?.data) setProfile(profRes.data);
      if (sumRes?.data) setSummary(sumRes.data);
      if (recsRes?.data) setRecords(recsRes.data);
      if (custsRes?.data) setCustomers(custsRes.data);
    } catch (err) {
      console.error('Failed to load application data', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Tab navigation
  const handleNavigate = (tab, params = {}) => {
    if (params.filter) {
      setRentBookFilter(params.filter);
    }
    if (params.customerId) {
      setActiveCustomerId(params.customerId);
      setCurrentTab('customer-detail');
      return;
    }
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleLang = async (newLang) => {
    const updated = { ...profile, defaultLanguage: newLang };
    setProfile(updated);
    try {
      await api.updateProfile({ defaultLanguage: newLang });
    } catch (e) {
      // quiet fail
    }
  };

  // Record creation & update
  const handleSaveRecord = async (formData) => {
    if (formData.id) {
      await api.updateRecord(formData.id, formData);
      showToast(profile.defaultLanguage === 'so' ? 'Diiwaanka waa la cusboonaysiiyay' : 'Record updated');
    } else {
      await api.createRecord(formData);
      showToast(profile.defaultLanguage === 'so' ? `Diiwaan cusub ayaa loo daray ${formData.customerName}` : `Record added for ${formData.customerName}`);
    }
    await refreshAllData();
  };

  // Record payment
  const handleSavePayment = async (paymentData) => {
    await api.createPayment(paymentData);
    showToast(profile.defaultLanguage === 'so' ? 'Bixinta waa la diiwaangeliyay' : 'Payment recorded');
    await refreshAllData();
  };

  // Quick settle full customer debt
  const handleSettleFull = async (customer, onDone) => {
    if (!window.confirm(profile.defaultLanguage === 'so'
      ? `Ma hubtaa inaad doonayso inaad wada xidho dhammaan haraaga ${customer.name}?`
      : `Are you sure you want to mark all outstanding balances for ${customer.name} as fully paid?`)) {
      return;
    }

    try {
      await api.settleCustomer(customer.id);
      showToast(profile.defaultLanguage === 'so'
        ? `${customer.name} hadda si buuxda ayuu u bixiyay`
        : `${customer.name} is now paid in full`);
      await refreshAllData();
      if (onDone) onDone();
    } catch (err) {
      showToast(err.message || 'Settlement failed');
    }
  };

  // Delete credit record
  const handleDeleteRecord = async (recordId, onDone) => {
    if (!window.confirm(profile.defaultLanguage === 'so'
      ? 'Ma hubtaa inaad tirtirto diiwaankan?'
      : 'Are you sure you want to delete this record?')) {
      return;
    }

    try {
      await api.deleteRecord(recordId);
      showToast(profile.defaultLanguage === 'so' ? 'Diiwaanka waa la tirtiray' : 'Record deleted');
      await refreshAllData();
      if (onDone) onDone();
    } catch (err) {
      showToast(err.message || 'Delete failed');
    }
  };

  // Delete customer
  const handleDeleteCustomer = async (customerId, customerName) => {
    if (!window.confirm(profile.defaultLanguage === 'so'
      ? `Ma hubtaa inaad tirtirto macmiilka ${customerName} iyo dhammaan diiwaannadiisa?`
      : `Are you sure you want to delete customer ${customerName} and all associated records?`)) {
      return;
    }

    try {
      await api.deleteCustomer(customerId);
      showToast(profile.defaultLanguage === 'so' ? 'Macmiilka waa la tirtiray' : 'Customer deleted');
      await refreshAllData();
    } catch (err) {
      showToast(err.message || 'Delete customer failed');
    }
  };

  // Save profile
  const handleSaveProfile = async (formData) => {
    const res = await api.updateProfile(formData);
    setProfile(res.data);
    showToast(profile.defaultLanguage === 'so' ? 'Xogta maqaayada waa la cusboonaysiiyay' : 'Profile updated');
    await refreshAllData();
  };

  // Reset demo
  const handleResetDemo = async () => {
    await api.resetDemo();
    showToast(profile.defaultLanguage === 'so' ? 'Xogta tijaabada waa la soo celiyay' : 'Demo data restored');
    await refreshAllData();
  };

  const overdueCount = summary?.statusCounts?.OVERDUE || 0;
  const lang = profile.defaultLanguage || 'so';

  return (
    <div className="app-layout shell">
      {/* Mobile Top Header */}
      <Navbar
        profile={profile}
        onOpenAddModal={() => {
          setRecordModalData(null);
          setIsRecordModalOpen(true);
        }}
        onToggleLang={handleToggleLang}
      />

      {/* Desktop Persistent Sidebar */}
      <Sidebar
        currentTab={currentTab === 'customer-detail' ? 'customers' : currentTab}
        onSelectTab={(tab) => handleNavigate(tab)}
        overdueCount={overdueCount}
        profile={profile}
        onOpenAddModal={() => {
          setRecordModalData(null);
          setIsRecordModalOpen(true);
        }}
        onToggleLang={handleToggleLang}
      />

      {/* Main App Canvas */}
      <main className="main" id="mainContent">
        {loading && !summary ? (
          <div className="empty" style={{ paddingTop: '80px' }}>
            <p className="sub">Loading Sahafi Rent Book...</p>
          </div>
        ) : (
          <>
            {currentTab === 'dashboard' && (
              <Dashboard
                summary={summary}
                profile={profile}
                onNavigate={handleNavigate}
                onOpenAddModal={() => {
                  setRecordModalData(null);
                  setIsRecordModalOpen(true);
                }}
                onOpenPayModal={(cust) => {
                  setPayModalCustomer(cust);
                  setIsPayModalOpen(true);
                }}
                onSettleFull={handleSettleFull}
              />
            )}

            {currentTab === 'rentbook' && (
              <RentBook
                records={records}
                profile={profile}
                initialFilter={rentBookFilter}
                onOpenAddModal={(initial) => {
                  setRecordModalData(initial || null);
                  setIsRecordModalOpen(true);
                }}
                onOpenEditModal={(rec) => {
                  setRecordModalData(rec);
                  setIsRecordModalOpen(true);
                }}
                onOpenPayModal={(cust) => {
                  setPayModalCustomer(cust);
                  setIsPayModalOpen(true);
                }}
                onDeleteRecord={handleDeleteRecord}
                onNavigateToCustomer={(cId) => handleNavigate('customer-detail', { customerId: cId })}
              />
            )}

            {currentTab === 'customers' && (
              <Customers
                customers={customers}
                profile={profile}
                onOpenAddModal={(initial) => {
                  setRecordModalData(initial || null);
                  setIsRecordModalOpen(true);
                }}
                onOpenPayModal={(cust) => {
                  setPayModalCustomer(cust);
                  setIsPayModalOpen(true);
                }}
                onSettleFull={handleSettleFull}
                onDeleteCustomer={handleDeleteCustomer}
                onNavigateToCustomer={(cId) => handleNavigate('customer-detail', { customerId: cId })}
              />
            )}

            {currentTab === 'customer-detail' && (
              <CustomerDetail
                customerId={activeCustomerId}
                profile={profile}
                onBack={() => handleNavigate('customers')}
                onOpenAddModal={(initial) => {
                  setRecordModalData(initial || null);
                  setIsRecordModalOpen(true);
                }}
                onOpenPayModal={(cust, onDone) => {
                  setPayModalCustomer(cust);
                  setIsPayModalOpen(true);
                }}
                onOpenEditModal={(rec, onDone) => {
                  setRecordModalData(rec);
                  setIsRecordModalOpen(true);
                }}
                onDeleteRecord={handleDeleteRecord}
                onSettleFull={handleSettleFull}
              />
            )}

            {currentTab === 'report' && (
              <MonthlyReport profile={profile} />
            )}

            {currentTab === 'settings' && (
              <Settings
                profile={profile}
                onSaveProfile={handleSaveProfile}
                onResetDemo={handleResetDemo}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile Floating Bottom Bar */}
      <TabBar
        currentTab={currentTab === 'customer-detail' ? 'customers' : currentTab}
        onSelectTab={(tab) => handleNavigate(tab)}
        overdueCount={overdueCount}
        lang={lang}
      />

      {/* Credit Record Modal */}
      <RecordFormModal
        isOpen={isRecordModalOpen}
        onClose={() => setIsRecordModalOpen(false)}
        onSubmit={handleSaveRecord}
        initialData={recordModalData}
        customers={customers}
        lang={lang}
      />

      {/* Payment Recording Modal */}
      <PaymentModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        onSubmit={handleSavePayment}
        customer={payModalCustomer}
        currency={profile.currency || '$'}
        lang={lang}
      />

      {/* Toast popup */}
      <Toast message={toastMessage} />
    </div>
  );
}

export default App;
