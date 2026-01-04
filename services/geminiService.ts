import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedData, InvoiceType } from "../types";

// Helper to convert file to base64
const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const extractInvoiceData = async (file: File, type: InvoiceType, customFields: string[] = []): Promise<ExtractedData> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not defined in environment variables");
  }

  const ai = new GoogleGenAI({ apiKey });
  const base64Data = await fileToGenerativePart(file);
  const model = "gemini-3-flash-preview";

  const customFieldsPrompt = customFields.length > 0 
    ? `Also look for these specific fields: ${customFields.join(', ')}.` 
    : "";

  // Dynamic Prompt based on Transaction Type
  const entityType = type === 'INCOME' ? 'Customer/Client' : 'Vendor/Supplier';
  const docType = type === 'INCOME' ? 'Sales Invoice or Receipt' : 'Purchase Bill or Expense Receipt';

  const prompt = `
    Analyze this image of a ${docType}. 
    Extract the following details:
    - Counterparty Name (The name of the ${entityType}).
    - Date (YYYY-MM-DD format).
    - Total Amount.
    - Currency (Default to INR if symbol is ₹ or not specified but looks Indian).
    - Tax Amount (GST/VAT if visible).
    - Line Items (description, quantity, unit (e.g., kg, pcs, bags, box), unit price, total).
    
    ${customFieldsPrompt}

    Evaluate the clarity of the document and provide a confidence score (0-100).
    If a field is not found or illegible, use null or 0.
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            counterpartyName: { type: Type.STRING },
            invoiceDate: { type: Type.STRING },
            totalAmount: { type: Type.NUMBER },
            currency: { type: Type.STRING },
            taxAmount: { type: Type.NUMBER },
            confidenceScore: { type: Type.NUMBER },
            lineItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  quantity: { type: Type.NUMBER },
                  unit: { type: Type.STRING },
                  unitPrice: { type: Type.NUMBER },
                  total: { type: Type.NUMBER },
                }
              }
            }
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text) as ExtractedData;
      return data;
    } else {
      throw new Error("No data returned from Gemini");
    }

  } catch (error: any) {
    console.error("Gemini Extraction Error:", error);
    if (error.message) {
        console.error("Error Message:", error.message);
    }
    throw error;
  }
};

export const generateFinancialInsights = async (
  summary: {
    totalIncome: number;
    totalExpense: number;
    netCashFlow: number;
    topVendors: { name: string; value: number }[];
    topCustomers: { name: string; value: number }[];
  }
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is not defined");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const prompt = `
    Act as a smart financial assistant for a small business owner in India. 
    Analyze the following financial snapshot based on recent uploaded documents:

    Financial Summary:
    - Total Sales: ₹${summary.totalIncome.toFixed(2)}
    - Total Expenses: ₹${summary.totalExpense.toFixed(2)}
    - Net Cash Flow: ₹${summary.netCashFlow.toFixed(2)}

    Top Expense Sources (Vendors):
    ${summary.topVendors.length > 0 ? summary.topVendors.map(v => `- ${v.name}: ₹${v.value.toFixed(2)}`).join('\n') : "No expense data."}

    Top Income Sources (Customers):
    ${summary.topCustomers.length > 0 ? summary.topCustomers.map(v => `- ${v.name}: ₹${v.value.toFixed(2)}`).join('\n') : "No income data."}

    Please provide 3 distinct, actionable insights or observations. 
    Focus on cash flow health, spending concentration, and revenue diversity.
    Keep it encouraging but realistic. Format with simple bullet points.
    If the data is sparse (e.g., 0 income), give general advice on what to track next.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
  });

  return response.text || "Unable to generate insights at this time.";
};