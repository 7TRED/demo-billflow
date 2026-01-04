import React, { useState, useMemo } from 'react';
import { Invoice, InvoiceStatus, InvoiceType, PaymentStatus } from '../types';
import { STATUS_ICONS, STATUS_COLORS, PAYMENT_STATUS_COLORS } from '../constants';
import { Search, Filter, Calendar, ArrowUpRight, ArrowDownRight, Trash2, Clock, X, Download } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface TransactionsProps {
  invoices: Invoice[];
  onVerify: (id: string) => void;
  onDelete: (id: string) => void;
}

export const Transactions: React.FC<TransactionsProps> = ({ invoices, onVerify, onDelete }) => {
  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | InvoiceType>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | PaymentStatus>('ALL');

  // --- Filter Logic ---
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      // 1. Text Search (Counterparty)
      const matchesSearch = inv.extractedData.counterpartyName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      // 2. Date Range
      const invDate = inv.extractedData.invoiceDate;
      const matchesStart = dateStart ? invDate >= dateStart : true;
      const matchesEnd = dateEnd ? invDate <= dateEnd : true;

      // 3. Type Filter
      const matchesType = typeFilter === 'ALL' || inv.type === typeFilter;

      // 4. Payment Filter
      // We need to calculate display status (Overdue) dynamically if not explicitly stored as such
      let currentStatus = inv.paymentStatus;
      if (currentStatus !== PaymentStatus.PAID && inv.dueDate) {
         const today = new Date().toISOString().split('T')[0];
         if (inv.dueDate < today) currentStatus = PaymentStatus.OVERDUE;
      }
      const matchesPayment = paymentFilter === 'ALL' || currentStatus === paymentFilter;

      return matchesSearch && matchesStart && matchesEnd && matchesType && matchesPayment;
    }).sort((a, b) => b.extractedData.invoiceDate.localeCompare(a.extractedData.invoiceDate)); // Newest first
  }, [invoices, searchTerm, dateStart, dateEnd, typeFilter, paymentFilter]);

  // --- Summary Metrics for Filtered View ---
  const totalValue = filteredInvoices.reduce((acc, inv) => {
    const amount = inv.extractedData.totalAmount || 0;
    return inv.type === 'INCOME' ? acc + amount : acc - amount; // Net Value
  }, 0);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      onDelete(id);
      toast.success("Transaction deleted");
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateStart('');
    setDateEnd('');
    setTypeFilter('ALL');
    setPaymentFilter('ALL');
  };

  const formatCurrency = (amount: number, currency: string = 'INR') => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
  };

  const getDisplayPaymentStatus = (inv: Invoice) => {
    if (inv.paymentStatus === PaymentStatus.PAID) return PaymentStatus.PAID;
    if (inv.dueDate) {
      const today = new Date().toISOString().split('T')[0];
      if (inv.dueDate < today) return PaymentStatus.OVERDUE;
    }
    return inv.paymentStatus;
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0 h-[calc(100vh-2rem)] flex flex-col">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-500">Manage and search your complete history.</p>
        </div>
        <div className="flex items-center gap-2 bg-blue-50 text-blue-800 px-4 py-2 rounded-lg text-sm font-medium">
            <span>Filtered Total:</span>
            <span className={totalValue >= 0 ? "text-blue-700" : "text-red-600"}>
                {formatCurrency(totalValue)}
            </span>
            <span className="text-gray-400 mx-2">|</span>
            <span>{filteredInvoices.length} Records</span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
        
        {/* Search */}
        <div className="md:col-span-3">
          <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Search</label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Counterparty name..."
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Type Filter */}
        <div className="md:col-span-2">
           <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Type</label>
           <select 
             value={typeFilter}
             onChange={(e) => setTypeFilter(e.target.value as any)}
             className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
           >
             <option value="ALL">All Types</option>
             <option value="INCOME">Income (Sale)</option>
             <option value="EXPENSE">Expense (Bill)</option>
           </select>
        </div>

        {/* Payment Filter */}
        <div className="md:col-span-2">
           <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">Status</label>
           <select 
             value={paymentFilter}
             onChange={(e) => setPaymentFilter(e.target.value as any)}
             className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
           >
             <option value="ALL">All Statuses</option>
             <option value={PaymentStatus.PAID}>Paid</option>
             <option value={PaymentStatus.UNPAID}>Unpaid</option>
             <option value={PaymentStatus.PARTIAL}>Partial</option>
             <option value={PaymentStatus.OVERDUE}>Overdue</option>
           </select>
        </div>

        {/* Date Range */}
        <div className="md:col-span-3 grid grid-cols-2 gap-2">
           <div>
             <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">From</label>
             <input 
               type="date"
               value={dateStart}
               onChange={(e) => setDateStart(e.target.value)}
               className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
             />
           </div>
           <div>
             <label className="text-xs font-semibold text-gray-500 uppercase mb-1 block">To</label>
             <input 
               type="date"
               value={dateEnd}
               onChange={(e) => setDateEnd(e.target.value)}
               className="w-full px-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
             />
           </div>
        </div>

        {/* Clear Button */}
        <div className="md:col-span-2 flex justify-end">
           <button 
             onClick={clearFilters}
             className="w-full flex items-center justify-center px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium transition-colors border border-gray-200 bg-white"
           >
             <X className="w-4 h-4 mr-2" />
             Reset
           </button>
        </div>

      </div>

      {/* Table Container */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left text-sm text-gray-600 relative">
            <thead className="bg-gray-50 text-gray-900 font-medium border-b border-gray-200 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Counterparty</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Payment</th>
                <th className="px-6 py-3">Verification</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => {
                  const StatusIcon = STATUS_ICONS[inv.status];
                  const displayPaymentStatus = getDisplayPaymentStatus(inv);

                  return (
                    <tr key={inv.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">{inv.extractedData.invoiceDate}</td>
                      <td className="px-6 py-4">
                        {inv.type === 'INCOME' ? (
                          <span className="inline-flex items-center text-green-700 font-medium text-xs bg-green-50 px-2 py-1 rounded">
                            <ArrowUpRight className="w-3 h-3 mr-1" /> Sale
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-red-700 font-medium text-xs bg-red-50 px-2 py-1 rounded">
                            <ArrowDownRight className="w-3 h-3 mr-1" /> Expense
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-gray-900">{inv.extractedData.counterpartyName}</td>
                      <td className={clsx("px-6 py-4 font-medium whitespace-nowrap", inv.type === 'INCOME' ? 'text-green-700' : 'text-gray-900')}>
                        {inv.type === 'INCOME' ? '+' : '-'} {formatCurrency(Number(inv.extractedData.totalAmount) || 0, inv.extractedData.currency)}
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col items-start gap-1">
                            <span className={clsx("inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide", PAYMENT_STATUS_COLORS[displayPaymentStatus])}>
                              {displayPaymentStatus}
                            </span>
                            {displayPaymentStatus !== PaymentStatus.PAID && inv.dueDate && (
                               <span className={clsx("text-xs flex items-center", displayPaymentStatus === PaymentStatus.OVERDUE ? "text-red-600 font-bold" : "text-gray-400")}>
                                 <Clock className="w-3 h-3 mr-1" /> {inv.dueDate}
                               </span>
                            )}
                          </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={clsx(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          STATUS_COLORS[inv.status]
                        )}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {inv.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex justify-end items-center gap-2">
                           <button 
                            onClick={() => onVerify(inv.id)}
                            className="text-blue-600 hover:text-blue-800 font-medium text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors"
                          >
                            View / Edit
                          </button>
                          <button 
                            onClick={(e) => handleDelete(e, inv.id)}
                            className="text-gray-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-md transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-20 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <Filter className="w-10 h-10 text-gray-300 mb-3" />
                      <p className="text-lg font-medium text-gray-700">No transactions found</p>
                      <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters.</p>
                      <button 
                        onClick={clearFilters}
                        className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Clear all filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};