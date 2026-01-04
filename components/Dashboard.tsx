import React, { useCallback, useState, useRef } from 'react';
import { Invoice, InvoiceStatus, InvoiceType } from '../types';
import { STATUS_ICONS, STATUS_COLORS } from '../constants';
import { Search, UploadCloud, Loader2, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet, Sparkles, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { extractInvoiceData, generateFinancialInsights } from '../services/geminiService';
import clsx from 'clsx';
import toast from 'react-hot-toast';

interface DashboardProps {
  invoices: Invoice[];
  onVerify: (id: string) => void;
  onUpload: (invoice: Invoice) => void;
}

// FIX: Added interface to strictly type the accumulator in reduce
interface ChartDataPoint {
  date: string;
  income: number;
  expense: number;
}

export const Dashboard: React.FC<DashboardProps> = ({ invoices, onVerify, onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [insights, setInsights] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<InvoiceType>('EXPENSE');

  // --- Metrics Calculation ---
  const totalIncome = invoices
    .filter(i => i.type === 'INCOME')
    .reduce((acc, i) => acc + (Number(i.extractedData?.totalAmount) || 0), 0);
    
  const totalExpense = invoices
    .filter(i => i.type === 'EXPENSE')
    .reduce((acc, i) => acc + (Number(i.extractedData?.totalAmount) || 0), 0);

  const netCashFlow = totalIncome - totalExpense;
  const pendingReviews = invoices.filter(inv => inv.status === InvoiceStatus.REVIEW_NEEDED).length;

  // --- Chart Data: Time Series ---
  // FIX: Added generic type <ChartDataPoint[]> to reduce to prevent 'any' type errors on existing.income += amount
  const chartData = invoices.reduce<ChartDataPoint[]>((acc, inv) => {
    const date = inv.extractedData.invoiceDate?.substring(5) || 'N/A'; // MM-DD
    const amount = Number(inv.extractedData?.totalAmount) || 0;
    
    const existing = acc.find(item => item.date === date);
    if (existing) {
      if (inv.type === 'INCOME') existing.income += amount;
      else existing.expense += amount;
    } else {
      acc.push({ 
        date, 
        income: inv.type === 'INCOME' ? amount : 0,
        expense: inv.type === 'EXPENSE' ? amount : 0
      });
    }
    return acc;
  }, []).sort((a, b) => a.date.localeCompare(b.date)).slice(-7);

  // --- Data for AI Insights ---
  // FIX: Added generic type <Record<string, number>> to ensure values are numbers, not unknown
  const expensesByVendor = invoices
    .filter(i => i.type === 'EXPENSE')
    .reduce<Record<string, number>>((acc, curr) => {
      const name = curr.extractedData.counterpartyName || 'Unknown';
      acc[name] = (acc[name] || 0) + (Number(curr.extractedData?.totalAmount) || 0);
      return acc;
    }, {});

  const vendorPieData = Object.entries(expensesByVendor)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  // FIX: Added generic type <Record<string, number>> to ensure values are numbers, not unknown
  const incomeByCustomer = invoices
    .filter(i => i.type === 'INCOME')
    .reduce<Record<string, number>>((acc, curr) => {
      const name = curr.extractedData.counterpartyName || 'Unknown';
      acc[name] = (acc[name] || 0) + (Number(curr.extractedData?.totalAmount) || 0);
      return acc;
    }, {});

  const customerData = Object.entries(incomeByCustomer)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);


  // --- Handlers ---
  const initiateUpload = (type: InvoiceType) => {
    setUploadType(type);
    // Determine which file input to trigger (we use one ref, so just set state first)
    // React state update is async, so we might need a small timeout or just rely on the click
    setTimeout(() => {
        fileInputRef.current?.click();
    }, 0);
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const toastId = toast.loading(`Processing ${uploadType === 'INCOME' ? 'Sale' : 'Expense'} with Gemini...`);

    try {
      const data = await extractInvoiceData(file, uploadType);
      
      const newInvoice: Invoice = {
        id: `inv-${Date.now()}`,
        type: uploadType,
        imageUrl: URL.createObjectURL(file), 
        status: data.confidenceScore < 80 ? InvoiceStatus.REVIEW_NEEDED : InvoiceStatus.VERIFIED,
        uploadDate: new Date().toISOString().split('T')[0],
        extractedData: data
      };

      onUpload(newInvoice);
      toast.success("Processed successfully!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to process document", { id: toastId });
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }, [onUpload, uploadType]);

  const handleGenerateInsights = async () => {
    if (invoices.length === 0) {
      toast.error("Add some invoices first to generate insights.");
      return;
    }
    
    setIsGeneratingInsights(true);
    try {
      const insightText = await generateFinancialInsights({
        totalIncome,
        totalExpense,
        netCashFlow,
        topVendors: vendorPieData,
        topCustomers: customerData
      });
      setInsights(insightText);
    } catch (error) {
      toast.error("Failed to generate insights.");
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      
      {/* --- Top Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Overview</h1>
          <p className="text-gray-500">Track your cash flow in real-time.</p>
        </div>
        
        <div className="relative">
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*,application/pdf"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          
          <div className="flex gap-2">
            <button
              onClick={() => initiateUpload('INCOME')}
              disabled={isUploading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition shadow-sm"
            >
               {isUploading && uploadType === 'INCOME' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowUpRight className="w-4 h-4 mr-2" />}
               Add Sale
            </button>
            <button
              onClick={() => initiateUpload('EXPENSE')}
              disabled={isUploading}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-sm"
            >
              {isUploading && uploadType === 'EXPENSE' ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowDownRight className="w-4 h-4 mr-2" />}
              Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* --- Financial Health Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Sales</p>
              <h3 className="text-2xl font-bold text-green-700 mt-2">{formatCurrency(totalIncome)}</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Total Expenses</p>
              <h3 className="text-2xl font-bold text-red-700 mt-2">{formatCurrency(totalExpense)}</h3>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
           <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 font-medium">Net Cash Flow</p>
              <h3 className={clsx("text-2xl font-bold mt-2", netCashFlow >= 0 ? "text-blue-700" : "text-red-700")}>
                {formatCurrency(netCashFlow)}
              </h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* --- Charts & Insights --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-semibold text-gray-800">Cash Flow Trend</h3>
             <div className="flex items-center space-x-2 text-sm text-gray-500">
               <span className="flex items-center"><div className="w-3 h-3 bg-green-600 rounded-sm mr-1"></div> Income</span>
               <span className="flex items-center"><div className="w-3 h-3 bg-red-600 rounded-sm mr-1"></div> Expense</span>
             </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  cursor={{fill: '#f8fafc'}}
                />
                <Bar name="Sales" dataKey="income" fill="#16a34a" radius={[4, 4, 0, 0]} barSize={20} />
                <Bar name="Expenses" dataKey="expense" fill="#dc2626" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insights / Pending Actions */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-lg font-semibold text-gray-800 flex items-center">
               <Sparkles className="w-5 h-5 text-purple-600 mr-2" />
               AI Insights
             </h3>
             <button 
               onClick={handleGenerateInsights}
               disabled={isGeneratingInsights}
               className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-md hover:bg-purple-100 transition-colors"
             >
               {isGeneratingInsights ? 'Analyzing...' : 'Refresh'}
             </button>
          </div>
          
          <div className="flex-1 overflow-auto">
             {insights ? (
                <div className="text-sm text-gray-600 space-y-2 whitespace-pre-line bg-purple-50 p-3 rounded-lg border border-purple-100">
                  {insights}
                </div>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                   {pendingReviews > 0 ? (
                      <>
                        <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center relative">
                           <AlertTriangle className="w-8 h-8 text-amber-500" />
                           <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div>
                          <p className="text-gray-900 font-medium">{pendingReviews} Documents Pending</p>
                          <p className="text-xs text-gray-500 mt-1">Review extracted data to update your stats.</p>
                        </div>
                         {/* Find first pending invoice to review */}
                         {invoices.find(inv => inv.status === InvoiceStatus.REVIEW_NEEDED) && (
                            <button 
                              onClick={() => onVerify(invoices.find(inv => inv.status === InvoiceStatus.REVIEW_NEEDED)!.id)}
                              className="w-full py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
                            >
                              Review Now
                            </button>
                         )}
                      </>
                   ) : (
                      <p className="text-gray-400 text-sm">Everything is up to date! Click refresh for financial analysis.</p>
                   )}
                </div>
             )}
          </div>
        </div>
      </div>

      {/* --- Recent Transactions Table --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
          <div className="relative hidden sm:block">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search..." 
              className="pl-9 pr-4 py-1.5 bg-white text-gray-900 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-medium border-b border-gray-200">
              <tr>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Counterparty</th>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((inv) => {
                const StatusIcon = STATUS_ICONS[inv.status];
                return (
                  <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
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
                    <td className="px-6 py-4">{inv.extractedData.invoiceDate}</td>
                    <td className={clsx("px-6 py-4 font-medium", inv.type === 'INCOME' ? 'text-green-700' : 'text-gray-900')}>
                      {inv.type === 'INCOME' ? '+' : '-'} {formatCurrency(Number(inv.extractedData.totalAmount) || 0)}
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
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => onVerify(inv.id)}
                        className={clsx("font-medium", inv.status === InvoiceStatus.REVIEW_NEEDED ? "text-blue-600 hover:text-blue-800" : "text-gray-400 hover:text-gray-600")}
                      >
                        {inv.status === InvoiceStatus.REVIEW_NEEDED ? "Verify" : "View"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <UploadCloud className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    No transactions yet. Add a Sale or Expense to start!
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