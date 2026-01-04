import React from 'react';

export type AppView = 'dashboard' | 'verify' | 'settings';

export enum InvoiceStatus {
  PROCESSING = 'processing',
  REVIEW_NEEDED = 'review_needed',
  VERIFIED = 'verified',
}

export type InvoiceType = 'INCOME' | 'EXPENSE';

export type StorageProvider = 'billflow' | 'google' | 'onedrive';

export interface Organization {
  id: string;
  name: string;
  taxId?: string;
  currency: string;
  storageProvider: StorageProvider;
  joinedAt: string;
  businessKeywords?: string[]; // Used for AI context
}

export interface LineItem {
  description: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  total: number;
}

export interface ExtractedData {
  counterpartyName: string; // Vendor for Expenses, Customer for Income
  invoiceDate: string; // YYYY-MM-DD
  totalAmount: number;
  currency: string;
  taxAmount?: number;
  lineItems: LineItem[];
  confidenceScore: number; // 0-100
  // Custom fields
  [key: string]: any;
}

export interface Invoice {
  id: string;
  type: InvoiceType;
  imageUrl: string;
  status: InvoiceStatus;
  uploadDate: string;
  extractedData: ExtractedData;
  storagePath?: string;
}

export interface MetricCardProps {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  icon: React.ReactNode;
  type?: 'neutral' | 'positive' | 'negative';
}