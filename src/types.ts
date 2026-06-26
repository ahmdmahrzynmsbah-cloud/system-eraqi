export interface Product {
  id: string;
  name: string;
  barcode: string;
  price: number;
  cost: number;
  stock: number;
  category: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  balance?: number;
}

export interface InvoiceItem {
  product: Product;
  quantity: number;
  price: number;
  total: number;
}

export interface Invoice {
  id: string;
  date: string;
  customerId: string | null;
  items: InvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  paid: number;
  type: 'sale' | 'return';
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export interface StoreData {
  products: Product[];
  customers: Customer[];
  invoices: Invoice[];
  expenses: Expense[];
}
