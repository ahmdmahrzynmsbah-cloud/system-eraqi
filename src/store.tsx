import React, { createContext, useContext, useState, useEffect } from 'react';
import { StoreData, Product, Customer, Invoice, Expense } from './types';

const defaultData: StoreData = {
  products: [],
  customers: [],
  invoices: [],
  expenses: [],
};

interface AppContextType {
  data: StoreData;
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addCustomer: (customer: Customer) => void;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (id: string) => void;
  payCustomerDebt: (customerId: string, amount: number) => void;
  addInvoice: (invoice: Invoice) => void;
  addExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  importData: (data: StoreData) => void;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<StoreData>(() => {
    const saved = localStorage.getItem('erp_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved data', e);
      }
    }
    return defaultData;
  });

  useEffect(() => {
    localStorage.setItem('erp_data', JSON.stringify(data));
  }, [data]);

  const addProduct = (product: Product) => {
    setData(prev => ({ ...prev, products: [...prev.products, product] }));
  };

  const updateProduct = (product: Product) => {
    setData(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === product.id ? product : p)
    }));
  };

  const deleteProduct = (id: string) => {
    setData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== id)
    }));
  };

  const addCustomer = (customer: Customer) => {
    setData(prev => ({ ...prev, customers: [...prev.customers, customer] }));
  };

  const updateCustomer = (customer: Customer) => {
    setData(prev => ({
      ...prev,
      customers: prev.customers.map(c => c.id === customer.id ? customer : c)
    }));
  };

  const deleteCustomer = (id: string) => {
    setData(prev => ({
      ...prev,
      customers: prev.customers.filter(c => c.id !== id)
    }));
  };

  const addInvoice = (invoice: Invoice) => {
    setData(prev => {
      // Update stock
      const updatedProducts = prev.products.map(p => {
        const itemInInvoice = invoice.items.find(i => i.product.id === p.id);
        if (itemInInvoice) {
          return {
            ...p,
            stock: invoice.type === 'sale' 
              ? p.stock - itemInInvoice.quantity 
              : p.stock + itemInInvoice.quantity
          };
        }
        return p;
      });

      // Update customer balance if there is a debt (paid < total)
      const updatedCustomers = prev.customers.map(c => {
        if (invoice.customerId && c.id === invoice.customerId) {
          const debt = invoice.total - invoice.paid;
          return {
            ...c,
            balance: (c.balance || 0) + debt
          };
        }
        return c;
      });

      return {
        ...prev,
        invoices: [...prev.invoices, invoice],
        products: updatedProducts,
        customers: updatedCustomers
      };
    });
  };

  const payCustomerDebt = (customerId: string, amount: number) => {
    setData(prev => ({
      ...prev,
      customers: prev.customers.map(c => 
        c.id === customerId 
          ? { ...c, balance: Math.max(0, (c.balance || 0) - amount) }
          : c
      )
    }));
  };

  const addExpense = (expense: Expense) => {
    setData(prev => ({ ...prev, expenses: [...prev.expenses, expense] }));
  };
  
  const deleteExpense = (id: string) => {
    setData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
  };

  const importData = (newData: StoreData) => {
    setData(newData);
  };

  const resetData = () => {
    if (window.confirm('هل أنت متأكد من مسح جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
      setData(defaultData);
    }
  };

  return (
    <AppContext.Provider value={{
      data,
      addProduct,
      updateProduct,
      deleteProduct,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      payCustomerDebt,
      addInvoice,
      addExpense,
      deleteExpense,
      importData,
      resetData
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
