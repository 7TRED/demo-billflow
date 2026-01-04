import { Invoice, InvoiceStatus } from './types';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';

export const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    type: 'EXPENSE',
    imageUrl: 'https://picsum.photos/600/800?random=1',
    status: InvoiceStatus.REVIEW_NEEDED,
    uploadDate: '2023-10-25',
    extractedData: {
      counterpartyName: 'Ramesh Electronics',
      invoiceDate: '2023-10-24',
      totalAmount: 12500.50,
      currency: 'INR',
      confidenceScore: 75,
      lineItems: [
        { description: 'LED Bulbs (Pack of 10)', quantity: 5, unit: 'packs', unitPrice: 2500, total: 12500 },
        { description: 'Shipping', quantity: 1, unit: 'service', unitPrice: 0.50, total: 0.50 }
      ]
    }
  },
  {
    id: 'inv-002',
    type: 'EXPENSE',
    imageUrl: 'https://picsum.photos/600/800?random=2',
    status: InvoiceStatus.VERIFIED,
    uploadDate: '2023-10-20',
    extractedData: {
      counterpartyName: 'Airtel Business',
      invoiceDate: '2023-10-19',
      totalAmount: 1499.00,
      currency: 'INR',
      confidenceScore: 98,
      lineItems: [
        { description: 'Fiber Plan - Oct', quantity: 1, unit: 'month', unitPrice: 1499.00, total: 1499.00 }
      ]
    }
  },
  {
    id: 'inv-003',
    type: 'INCOME',
    imageUrl: 'https://picsum.photos/600/800?random=3',
    status: InvoiceStatus.VERIFIED,
    uploadDate: '2023-10-18',
    extractedData: {
      counterpartyName: 'Sharma Consulting',
      invoiceDate: '2023-10-15',
      totalAmount: 45000.00,
      currency: 'INR',
      confidenceScore: 95,
      lineItems: [
        { description: 'Web Development Services', quantity: 1, unit: 'project', unitPrice: 45000, total: 45000 }
      ]
    }
  },
  {
    id: 'inv-004',
    type: 'INCOME',
    imageUrl: 'https://picsum.photos/600/800?random=4',
    status: InvoiceStatus.VERIFIED,
    uploadDate: '2023-10-22',
    extractedData: {
      counterpartyName: 'Priya Designs',
      invoiceDate: '2023-10-21',
      totalAmount: 12000.00,
      currency: 'INR',
      confidenceScore: 92,
      lineItems: []
    }
  }
];

export const STATUS_ICONS = {
  [InvoiceStatus.PROCESSING]: FileText,
  [InvoiceStatus.REVIEW_NEEDED]: AlertCircle,
  [InvoiceStatus.VERIFIED]: CheckCircle,
};

export const STATUS_COLORS = {
  [InvoiceStatus.PROCESSING]: 'bg-blue-100 text-blue-800',
  [InvoiceStatus.REVIEW_NEEDED]: 'bg-amber-100 text-amber-800',
  [InvoiceStatus.VERIFIED]: 'bg-green-100 text-green-800',
};