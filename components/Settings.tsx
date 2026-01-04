import React, { useState, useEffect } from 'react';
import { Cloud, Check, HardDrive, Plus, Trash2, LogOut } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { Organization } from '../types';

interface SettingsProps {
  organization?: Organization | null;
}

export const Settings: React.FC<SettingsProps> = ({ organization }) => {
  const [customFields, setCustomFields] = useState<{ id: string, name: string }[]>([
    { id: '1', name: 'Project Code' },
    { id: '2', name: 'Department' }
  ]);
  const [storageProvider, setStorageProvider] = useState<'billflow' | 'google' | 'onedrive'>('billflow');
  const [newField, setNewField] = useState('');

  useEffect(() => {
    if (organization) {
      setStorageProvider(organization.storageProvider);
    }
  }, [organization]);

  const addField = () => {
    if (!newField.trim()) return;
    setCustomFields([...customFields, { id: Date.now().toString(), name: newField }]);
    setNewField('');
    toast.success("Custom field added");
  };

  const removeField = (id: string) => {
    setCustomFields(customFields.filter(f => f.id !== id));
  };

  const handleProviderChange = (provider: 'billflow' | 'google' | 'onedrive') => {
    setStorageProvider(provider);
    if (provider !== 'billflow') {
      toast.success(`Connected to ${provider === 'google' ? 'Google Drive' : 'OneDrive'} successfully (Simulated)`);
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out and reset the demo?")) {
      localStorage.removeItem('billflow_org');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500">Manage your data preferences and storage.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Reset Demo / Logout
        </button>
      </div>

      {organization && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-1">Organization Details</h3>
          <p className="text-sm text-blue-700">
            You are managing <strong>{organization.name}</strong> using <strong>{organization.currency}</strong> as the default currency.
          </p>
        </div>
      )}

      {/* Storage Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <HardDrive className="w-5 h-5 mr-2 text-blue-600" />
            Storage Provider (BYOS)
          </h2>
          <p className="text-sm text-gray-500 mt-1">Choose where your invoice images and data are stored.</p>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <button
            onClick={() => handleProviderChange('billflow')}
            className={clsx(
              "flex flex-col items-center p-6 border-2 rounded-xl transition-all",
              storageProvider === 'billflow' ? "border-blue-600 bg-blue-50" : "border-gray-200 hover:border-gray-300"
            )}
          >
            <Cloud className="w-8 h-8 text-blue-600 mb-3" />
            <span className="font-semibold text-gray-900">BillFlow Cloud</span>
            <span className="text-xs text-gray-500 mt-1">Managed hosting</span>
            {storageProvider === 'billflow' && <Check className="w-5 h-5 text-blue-600 mt-2" />}
          </button>

          <button
            onClick={() => handleProviderChange('google')}
            className={clsx(
              "flex flex-col items-center p-6 border-2 rounded-xl transition-all",
              storageProvider === 'google' ? "border-green-600 bg-green-50" : "border-gray-200 hover:border-gray-300"
            )}
          >
            <svg className="w-8 h-8 mb-3" viewBox="0 0 24 24">
              <path d="M12.01 1.485c2.082 0 3.754.02 5.67 1.13l-2.956 5.105L9.648 1.485h2.362zm-6.68 3.86l2.362 4.106-5.89 10.21a.57.57 0 0 1-.037-.066C.816 17.75.12 16.096.02 13.918c-.1-2.176.626-4.265 1.76-5.918l3.55-2.655zm13.166 2.373l3.52 6.095-.01.018c.84 1.45 1.096 3.19.742 4.912-.353 1.72-1.353 3.32-2.812 4.17l-5.9-10.21 4.46-4.985zM7.34 8.78l4.032 6.992-4.085 7.07H3.21c1.235 0 2.47-.468 3.415-1.405l.715-1.235 4.46-7.72H7.34z" fill="#4285F4"/>
            </svg>
            <span className="font-semibold text-gray-900">Google Drive</span>
            <span className="text-xs text-gray-500 mt-1">Personal / Workspace</span>
            {storageProvider === 'google' && <Check className="w-5 h-5 text-green-600 mt-2" />}
          </button>

           <button
            onClick={() => handleProviderChange('onedrive')}
            className={clsx(
              "flex flex-col items-center p-6 border-2 rounded-xl transition-all",
              storageProvider === 'onedrive' ? "border-sky-600 bg-sky-50" : "border-gray-200 hover:border-gray-300"
            )}
          >
             <svg className="w-8 h-8 mb-3" fill="#0078D4" viewBox="0 0 24 24">
               <path d="M19.456 16.147c.567-.48 1.544-.658 1.544-2.147 0-1.637-1.306-2.614-2.608-2.614-.26 0-.5.034-.72.094a4.425 4.425 0 0 0-4.076-2.977c-2.327 0-4.133 1.776-4.323 4.083a3.522 3.522 0 0 0-5.773 2.923c0 1.94 1.575 3.491 3.535 3.491h12.42c1.93 0 3.545-1.503 3.545-3.328 0-1.844-1.615-3.468-3.544-2.858v3.333z"/>
             </svg>
            <span className="font-semibold text-gray-900">OneDrive</span>
            <span className="text-xs text-gray-500 mt-1">Personal / Business</span>
            {storageProvider === 'onedrive' && <Check className="w-5 h-5 text-sky-600 mt-2" />}
          </button>

        </div>
      </div>

      {/* Custom Schema Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
           <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Plus className="w-5 h-5 mr-2 text-blue-600" />
            Custom Fields
          </h2>
          <p className="text-sm text-gray-500 mt-1">Define extra fields for the AI to extract.</p>
        </div>
        <div className="p-6">
          <div className="space-y-4 mb-6">
            {customFields.map(field => (
              <div key={field.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <span className="font-medium text-gray-700">{field.name}</span>
                <button onClick={() => removeField(field.id)} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {customFields.length === 0 && <p className="text-gray-400 italic text-sm">No custom fields defined.</p>}
          </div>
          
          <div className="flex gap-3">
            <input 
              type="text" 
              value={newField}
              onChange={(e) => setNewField(e.target.value)}
              placeholder="e.g. PO Number, Driver Name"
              className="flex-1 p-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              onKeyDown={(e) => e.key === 'Enter' && addField()}
            />
            <button 
              onClick={addField}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
            >
              Add Field
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
