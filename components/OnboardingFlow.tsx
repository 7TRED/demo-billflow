import React, { useState } from 'react';
import { Organization, StorageProvider } from '../types';
import { Building2, Wallet, Cloud, HardDrive, Check, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface OnboardingFlowProps {
  onComplete: (org: Organization) => void;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    taxId: '',
    currency: 'INR',
    storageProvider: 'billflow' as StorageProvider
  });

  const handleNext = () => {
    if (step === 1 && !formData.name.trim()) {
      toast.error("Please enter your business name");
      return;
    }
    setStep(prev => prev + 1);
  };

  const handleBack = () => setStep(prev => prev - 1);

  const handleFinish = async () => {
    setIsLoading(true);
    // Simulate API call to create tenant
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name: formData.name,
      taxId: formData.taxId,
      currency: formData.currency,
      storageProvider: formData.storageProvider,
      joinedAt: new Date().toISOString()
    };
    
    setIsLoading(false);
    toast.success("Welcome to BillFlow!");
    onComplete(newOrg);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      
      {/* Brand Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <Wallet className="w-7 h-7" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Welcome to BillFlow</h1>
        <p className="text-gray-500 mt-2">Simplify your business finance tracking.</p>
      </div>

      {/* Main Card */}
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-1.5">
          <div 
            className="bg-blue-600 h-1.5 transition-all duration-500 ease-out"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        <div className="p-8">
          
          {/* Step 1: Business Details */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Tell us about your business</h2>
                <p className="text-sm text-gray-500">We'll use this to optimize your experience.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Business Name <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="e.g. Ramesh Electronics"
                      className="w-full pl-10 pr-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN / Tax ID (Optional)</label>
                  <input
                    type="text"
                    value={formData.taxId}
                    onChange={e => setFormData({...formData, taxId: e.target.value})}
                    placeholder="e.g. 29ABCDE1234F1Z5"
                    className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Currency</label>
                  <select
                    value={formData.currency}
                    onChange={e => setFormData({...formData, currency: e.target.value})}
                    className="w-full px-4 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Storage Selection */}
          {step === 2 && (
             <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Where should we store your files?</h2>
                <p className="text-sm text-gray-500">Choose "BillFlow Cloud" or bring your own storage.</p>
              </div>

              <div className="space-y-3">
                <StorageOption 
                  id="billflow"
                  label="BillFlow Cloud"
                  sub="Secure, managed hosting"
                  icon={Cloud}
                  selected={formData.storageProvider === 'billflow'}
                  onSelect={() => setFormData({...formData, storageProvider: 'billflow'})}
                />
                <StorageOption 
                  id="google"
                  label="Google Drive"
                  sub="Connect your personal drive"
                  icon={({className}) => (
                    <svg className={className} viewBox="0 0 24 24">
                       <path d="M12.01 1.485c2.082 0 3.754.02 5.67 1.13l-2.956 5.105L9.648 1.485h2.362zm-6.68 3.86l2.362 4.106-5.89 10.21a.57.57 0 0 1-.037-.066C.816 17.75.12 16.096.02 13.918c-.1-2.176.626-4.265 1.76-5.918l3.55-2.655zm13.166 2.373l3.52 6.095-.01.018c.84 1.45 1.096 3.19.742 4.912-.353 1.72-1.353 3.32-2.812 4.17l-5.9-10.21 4.46-4.985zM7.34 8.78l4.032 6.992-4.085 7.07H3.21c1.235 0 2.47-.468 3.415-1.405l.715-1.235 4.46-7.72H7.34z" fill="#4285F4"/>
                    </svg>
                  )}
                  selected={formData.storageProvider === 'google'}
                  onSelect={() => setFormData({...formData, storageProvider: 'google'})}
                />
                 <StorageOption 
                  id="onedrive"
                  label="OneDrive"
                  sub="Connect Microsoft account"
                  icon={({className}) => (
                     <svg className={className} fill="#0078D4" viewBox="0 0 24 24">
                        <path d="M19.456 16.147c.567-.48 1.544-.658 1.544-2.147 0-1.637-1.306-2.614-2.608-2.614-.26 0-.5.034-.72.094a4.425 4.425 0 0 0-4.076-2.977c-2.327 0-4.133 1.776-4.323 4.083a3.522 3.522 0 0 0-5.773 2.923c0 1.94 1.575 3.491 3.535 3.491h12.42c1.93 0 3.545-1.503 3.545-3.328 0-1.844-1.615-3.468-3.544-2.858v3.333z"/>
                     </svg>
                  )}
                  selected={formData.storageProvider === 'onedrive'}
                  onSelect={() => setFormData({...formData, storageProvider: 'onedrive'})}
                />
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">You're all set!</h2>
                <p className="text-sm text-gray-500">We have configured your workspace.</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 text-left text-sm space-y-2 border border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-500">Business:</span>
                  <span className="font-medium text-gray-900">{formData.name}</span>
                </div>
                 <div className="flex justify-between">
                  <span className="text-gray-500">Currency:</span>
                  <span className="font-medium text-gray-900">{formData.currency}</span>
                </div>
                 <div className="flex justify-between">
                  <span className="text-gray-500">Storage:</span>
                  <span className="font-medium text-gray-900 capitalize">{formData.storageProvider.replace('_', ' ')}</span>
                </div>
              </div>

            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
            {step > 1 ? (
              <button 
                onClick={handleBack}
                className="text-gray-500 hover:text-gray-700 font-medium text-sm flex items-center px-4 py-2"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
            ) : (
              <div /> // Spacer
            )}

            {step < 3 ? (
               <button 
                onClick={handleNext}
                className="bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm flex items-center px-6 py-2.5 rounded-lg transition-colors shadow-md shadow-blue-600/20"
              >
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            ) : (
               <button 
                onClick={handleFinish}
                disabled={isLoading}
                className="bg-green-600 text-white hover:bg-green-700 font-medium text-sm flex items-center px-8 py-2.5 rounded-lg transition-colors shadow-md shadow-green-600/20"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : null}
                Launch Dashboard
              </button>
            )}
          </div>

        </div>
      </div>
       <p className="text-xs text-gray-400 mt-6">© 2024 BillFlow Inc. Secure 256-bit Encryption.</p>
    </div>
  );
};

const StorageOption = ({ id, label, sub, icon: Icon, selected, onSelect }: any) => (
  <div 
    onClick={onSelect}
    className={clsx(
      "flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all",
      selected 
        ? "border-blue-600 bg-blue-50/50" 
        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
    )}
  >
    <div className={clsx("p-2 rounded-lg mr-4", selected ? "bg-white text-blue-600" : "bg-gray-100 text-gray-500")}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="flex-1">
      <h3 className={clsx("font-semibold text-sm", selected ? "text-blue-900" : "text-gray-900")}>{label}</h3>
      <p className="text-xs text-gray-500">{sub}</p>
    </div>
    <div className={clsx("w-5 h-5 rounded-full border flex items-center justify-center", selected ? "border-blue-600 bg-blue-600" : "border-gray-300")}>
      {selected && <Check className="w-3 h-3 text-white" />}
    </div>
  </div>
);