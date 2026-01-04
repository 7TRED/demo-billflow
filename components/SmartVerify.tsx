import React, { useState, useEffect } from 'react';
import { Invoice, ExtractedData, InvoiceStatus, InvoiceType } from '../types';
import { ArrowLeft, Save, AlertTriangle, Check, ZoomIn, ZoomOut, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface SmartVerifyProps {
  invoice: Invoice;
  onSave: (invoice: Invoice) => void;
  onBack: () => void;
}

export const SmartVerify: React.FC<SmartVerifyProps> = ({ invoice, onSave, onBack }) => {
  const [data, setData] = useState<ExtractedData>(invoice.extractedData);
  const [type, setType] = useState<InvoiceType>(invoice.type);
  const [zoom, setZoom] = useState(1);
  const [hasChanges, setHasChanges] = useState(false);

  // If confidence is low, we can highlight the background of the input
  const isLowConfidence = (score: number) => score < 80;

  const handleInputChange = (field: keyof ExtractedData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleTypeChange = (newType: InvoiceType) => {
    setType(newType);
    setHasChanges(true);
  };

  const handleLineItemChange = (index: number, field: string, value: any) => {
    const newLineItems = [...data.lineItems];
    newLineItems[index] = { ...newLineItems[index], [field]: value };
    setData(prev => ({ ...prev, lineItems: newLineItems }));
    setHasChanges(true);
  };

  const handleSave = () => {
    const updatedInvoice: Invoice = {
      ...invoice,
      type: type,
      extractedData: data,
      status: InvoiceStatus.VERIFIED
    };
    onSave(updatedInvoice);
    toast.success("Transaction verified and saved!");
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">
      {/* Left Pane: Image Viewer */}
      <div className="flex-1 bg-gray-900 rounded-xl overflow-hidden relative shadow-lg group">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <button 
            onClick={() => setZoom(z => Math.max(1, z - 0.25))}
            className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm"
          >
            <ZoomOut className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setZoom(z => Math.min(3, z + 0.25))}
            className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        </div>
        <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
          <img 
            src={invoice.imageUrl} 
            alt="Invoice" 
            className="transition-transform duration-200 ease-out origin-center max-w-full"
            style={{ transform: `scale(${zoom})` }}
          />
        </div>
      </div>

      {/* Right Pane: Form */}
      <div className="w-full md:w-[450px] bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl space-y-4">
          <div className="flex justify-between items-center">
            <button 
              onClick={onBack}
              className="text-gray-600 hover:text-gray-900 flex items-center text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </button>
            <div className="flex items-center gap-2">
              {invoice.extractedData.confidenceScore < 80 && (
                <span className="text-xs font-medium text-amber-700 bg-amber-100 px-2 py-1 rounded-full flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  Review Needed
                </span>
              )}
              <button 
                onClick={handleSave}
                className={clsx(
                  "flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg transition-all",
                  hasChanges || invoice.status === InvoiceStatus.REVIEW_NEEDED 
                    ? "bg-blue-600 hover:bg-blue-700 shadow-md" 
                    : "bg-green-600 hover:bg-green-700"
                )}
              >
                <Save className="w-4 h-4 mr-2" />
                Save
              </button>
            </div>
          </div>
          
          {/* Classification Toggle */}
          <div className="flex bg-gray-200 p-1 rounded-lg">
            <button
              onClick={() => handleTypeChange('INCOME')}
              className={clsx(
                "flex-1 flex items-center justify-center py-1.5 text-sm font-medium rounded-md transition-all",
                type === 'INCOME' ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <ArrowUpRight className="w-4 h-4 mr-1" />
              Sale (Income)
            </button>
             <button
              onClick={() => handleTypeChange('EXPENSE')}
              className={clsx(
                "flex-1 flex items-center justify-center py-1.5 text-sm font-medium rounded-md transition-all",
                type === 'EXPENSE' ? "bg-white text-red-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <ArrowDownRight className="w-4 h-4 mr-1" />
              Bill (Expense)
            </button>
          </div>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2">Details</h3>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">
                {type === 'INCOME' ? 'Customer Name' : 'Vendor Name'}
              </label>
              <input 
                type="text" 
                value={data.counterpartyName}
                onChange={(e) => handleInputChange('counterpartyName', e.target.value)}
                className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Date</label>
                <input 
                  type="date" 
                  value={data.invoiceDate}
                  onChange={(e) => handleInputChange('invoiceDate', e.target.value)}
                  className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-500">Currency</label>
                <select 
                  value={data.currency}
                  onChange={(e) => handleInputChange('currency', e.target.value)}
                  className="w-full p-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className={clsx(
              "space-y-1 p-3 rounded-md transition-colors",
              isLowConfidence(data.confidenceScore) && !hasChanges ? "bg-red-50 border border-red-100" : "bg-gray-50"
            )}>
              <label className="text-xs font-bold text-gray-700">Total Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  {data.currency === 'INR' ? '₹' : '$'}
                </span>
                <input 
                  type="number" 
                  step="0.01"
                  value={data.totalAmount}
                  onChange={(e) => handleInputChange('totalAmount', parseFloat(e.target.value))}
                  className="w-full pl-7 p-2 bg-white text-gray-900 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 font-mono text-lg font-semibold"
                />
              </div>
              {isLowConfidence(data.confidenceScore) && !hasChanges && (
                <p className="text-xs text-red-600 mt-1">Please verify this amount carefully.</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b pb-2 flex justify-between items-center">
              Line Items
              <span className="text-xs font-normal text-gray-500 lowercase">{data.lineItems.length} items</span>
            </h3>
            
            {data.lineItems.map((item, idx) => (
              <div key={idx} className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm space-y-2">
                <input 
                  type="text" 
                  value={item.description}
                  onChange={(e) => handleLineItemChange(idx, 'description', e.target.value)}
                  className="w-full bg-transparent text-gray-900 border-b border-gray-300 focus:border-blue-500 focus:outline-none py-1 font-medium"
                  placeholder="Description"
                />
                <div className="flex gap-2">
                  <div className="flex-1">
                     <label className="text-[10px] uppercase text-gray-400">Qty</label>
                     <input 
                      type="number" 
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(idx, 'quantity', parseFloat(e.target.value))}
                      className="w-full bg-transparent text-gray-900 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                   <div className="flex-1">
                     <label className="text-[10px] uppercase text-gray-400">Unit</label>
                     <input 
                      type="text" 
                      value={item.unit || ''}
                      onChange={(e) => handleLineItemChange(idx, 'unit', e.target.value)}
                      className="w-full bg-transparent text-gray-900 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                      placeholder="pcs"
                    />
                  </div>
                  <div className="flex-1">
                     <label className="text-[10px] uppercase text-gray-400">Price</label>
                     <input 
                      type="number" 
                      value={item.unitPrice}
                      onChange={(e) => handleLineItemChange(idx, 'unitPrice', parseFloat(e.target.value))}
                      className="w-full bg-transparent text-gray-900 border-b border-gray-300 focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex-1 text-right">
                    <label className="text-[10px] uppercase text-gray-400">Total</label>
                    <div className="py-1 font-mono text-gray-900">{data.currency === 'INR' ? '₹' : '$'}{item.total.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            ))}
             {data.lineItems.length === 0 && (
              <div className="text-center py-4 text-gray-400 text-sm italic">
                No individual items detected.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};