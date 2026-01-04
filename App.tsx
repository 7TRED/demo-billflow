import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { SmartVerify } from './components/SmartVerify';
import { Settings } from './components/Settings';
import { OnboardingFlow } from './components/OnboardingFlow';
import { Invoice, AppView, InvoiceStatus, Organization } from './types';
import { MOCK_INVOICES } from './constants';
import { Toaster } from 'react-hot-toast';

const App: React.FC = () => {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  // Initialize with some mock data
  useEffect(() => {
    setInvoices(MOCK_INVOICES);
    
    // Check local storage or similar for existing session (simulated)
    const storedOrg = localStorage.getItem('billflow_org');
    if (storedOrg) {
      try {
        setOrganization(JSON.parse(storedOrg));
      } catch (e) {
        console.error("Failed to parse stored org");
      }
    }
  }, []);

  const handleOnboardingComplete = (org: Organization) => {
    setOrganization(org);
    localStorage.setItem('billflow_org', JSON.stringify(org));
  };

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
    if (view !== 'verify') {
      setSelectedInvoiceId(null);
    }
  };

  const handleVerifyInvoice = (id: string) => {
    setSelectedInvoiceId(id);
    setCurrentView('verify');
  };

  const handleUpdateInvoice = (updatedInvoice: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === updatedInvoice.id ? updatedInvoice : inv));
    // If verified, go back to dashboard or next invoice
    if (updatedInvoice.status === InvoiceStatus.VERIFIED) {
       // Optional: find next review_needed invoice
       const next = invoices.find(inv => inv.id !== updatedInvoice.id && inv.status === InvoiceStatus.REVIEW_NEEDED);
       if (next) {
         setSelectedInvoiceId(next.id);
       } else {
         setCurrentView('dashboard');
         setSelectedInvoiceId(null);
       }
    }
  };

  const handleAddInvoice = (newInvoice: Invoice) => {
    setInvoices(prev => [newInvoice, ...prev]);
    handleVerifyInvoice(newInvoice.id);
  };

  const handleDeleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    if (selectedInvoiceId === id) {
      setSelectedInvoiceId(null);
      setCurrentView('dashboard');
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard 
            invoices={invoices} 
            onVerify={handleVerifyInvoice} 
            onUpload={handleAddInvoice}
            onDelete={handleDeleteInvoice}
          />
        );
      case 'verify':
        const invoiceToVerify = invoices.find(i => i.id === selectedInvoiceId);
        if (!invoiceToVerify) return <div>Invoice not found</div>;
        return (
          <SmartVerify 
            invoice={invoiceToVerify} 
            onSave={handleUpdateInvoice}
            onBack={() => handleNavigate('dashboard')}
            onDelete={handleDeleteInvoice}
            organization={organization!}
          />
        );
      case 'settings':
        return <Settings organization={organization} />;
      default:
        return (
           <Dashboard 
             invoices={invoices} 
             onVerify={handleVerifyInvoice} 
             onUpload={handleAddInvoice} 
             onDelete={handleDeleteInvoice}
           />
        );
    }
  };

  if (!organization) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        <Toaster position="top-center" />
        <OnboardingFlow onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Toaster position="top-right" />
      <Layout 
        currentView={currentView} 
        onNavigate={handleNavigate}
        organization={organization}
      >
        {renderContent()}
      </Layout>
    </div>
  );
};

export default App;