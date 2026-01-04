import React from 'react';
import { Invoice, Organization } from '../types';
import { X, Printer } from 'lucide-react';

interface DigitalInvoiceProps {
  invoice: Invoice;
  organization: Organization;
  onClose: () => void;
}

export const DigitalInvoice: React.FC<DigitalInvoiceProps> = ({ invoice, organization, onClose }) => {
  // Logic for Sender/Receiver based on type
  // If INCOME: We are the sender (Billed From), Client is receiver (Billed To)
  // If EXPENSE: Vendor is sender (Billed From), We are receiver (Billed To)
  const isIncome = invoice.type === 'INCOME';
  const data = invoice.extractedData;

  const senderName = isIncome ? organization.name : data.counterpartyName;
  const receiverName = isIncome ? data.counterpartyName : organization.name;

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: data.currency }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-3xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] print:shadow-none print:max-h-none print:w-full print:max-w-none print:h-auto">
        
        {/* Header Toolbar (Hidden in Print) */}
        <div className="bg-gray-900 text-white p-4 flex justify-between items-center print:hidden">
          <h2 className="font-semibold flex items-center gap-2">
            Digital Invoice Preview
          </h2>
          <div className="flex gap-3">
             <button onClick={handlePrint} className="flex items-center gap-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors">
              <Printer className="w-4 h-4" /> Print / PDF
            </button>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-700 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="flex-1 overflow-auto p-8 bg-white print:p-8 print:overflow-visible">
          
          {/* Invoice Header */}
          <div className="flex justify-between items-start border-b border-gray-100 pb-8 mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">INVOICE</h1>
              <p className="text-gray-500 mt-1">#{invoice.id.toUpperCase()}</p>
              <span className={`inline-block mt-2 px-2 py-1 rounded text-xs font-bold ${isIncome ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {isIncome ? 'SALE' : 'EXPENSE'}
              </span>
            </div>
            <div className="text-right">
               <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center ml-auto mb-2 text-gray-400 font-bold text-xl">
                 {senderName.substring(0,2).toUpperCase()}
               </div>
               <p className="font-semibold text-gray-900">{senderName}</p>
            </div>
          </div>

          {/* Bill To / Bill From */}
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed From (Sender)</h3>
              <p className="font-medium text-gray-900 text-lg">{senderName}</p>
              <p className="text-gray-500 text-sm mt-1">
                 {/* Placeholder Address logic */}
                 Business Address<br/>City, State
              </p>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To (Receiver)</h3>
              <p className="font-medium text-gray-900 text-lg">{receiverName}</p>
              <p className="text-gray-500 text-sm mt-1">
                 Client Address<br/>City, State
              </p>
            </div>
          </div>

          {/* Meta Data */}
          <div className="grid grid-cols-2 gap-12 mb-8 bg-gray-50 p-6 rounded-lg border border-gray-100">
             <div>
                <span className="block text-xs font-bold text-gray-500 uppercase">Date Issued</span>
                <span className="font-medium text-gray-900">{data.invoiceDate}</span>
             </div>
             <div>
                <span className="block text-xs font-bold text-gray-500 uppercase">Amount Due</span>
                <span className="font-bold text-gray-900 text-xl">
                   {formatCurrency(data.totalAmount)}
                </span>
             </div>
          </div>

          {/* Line Items */}
          <table className="w-full mb-8">
            <thead>
              <tr className="border-b-2 border-gray-100">
                <th className="text-left py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="text-center py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="text-center py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Unit</th>
                <th className="text-right py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="text-right py-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.lineItems.map((item, idx) => (
                <tr key={idx}>
                  <td className="py-4 text-gray-800 font-medium">{item.description}</td>
                  <td className="py-4 text-center text-gray-600">{item.quantity}</td>
                  <td className="py-4 text-center text-gray-600">{item.unit || '-'}</td>
                  <td className="py-4 text-right text-gray-600">{item.unitPrice.toFixed(2)}</td>
                  <td className="py-4 text-right text-gray-900 font-medium">{item.total.toFixed(2)}</td>
                </tr>
              ))}
              {data.lineItems.length === 0 && (
                 <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400 italic">No line items detailed. Total amount inferred from document.</td>
                 </tr>
              )}
            </tbody>
          </table>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{data.totalAmount.toFixed(2)}</span>
              </div>
              {data.taxAmount && (
                <div className="flex justify-between text-gray-600">
                  <span>Tax</span>
                  <span>{data.taxAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl text-gray-900 border-t-2 border-gray-100 pt-3">
                <span>Total</span>
                <span>{formatCurrency(data.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-100 text-center text-gray-500 text-sm">
             <p>Generated by BillFlow AI</p>
          </div>

        </div>
      </div>
    </div>
  );
};
