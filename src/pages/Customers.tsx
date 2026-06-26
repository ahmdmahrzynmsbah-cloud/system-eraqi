import React, { useState } from 'react';
import { useApp } from '../store';
import { Customer } from '../types';
import { generateId, formatCurrency } from '../utils';
import { Plus, Edit2, Trash2, Search, FileText, DollarSign } from 'lucide-react';

export function Customers() {
  const { data, addCustomer, updateCustomer, deleteCustomer, payCustomerDebt } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Partial<Customer>>({});
  
  const [isPayingDebt, setIsPayingDebt] = useState(false);
  const [debtCustomer, setDebtCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  
  const [viewingInvoicesCustomer, setViewingInvoicesCustomer] = useState<Customer | null>(null);

  const filteredCustomers = data.customers.filter(c => 
    c.name.includes(searchTerm) || c.phone.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentCustomer.id) {
      updateCustomer(currentCustomer as Customer);
    } else {
      addCustomer({
        ...currentCustomer,
        id: generateId(),
        balance: 0
      } as Customer);
    }
    setIsEditing(false);
    setCurrentCustomer({});
  };

  const editItem = (c: Customer) => {
    setCurrentCustomer(c);
    setIsEditing(true);
  };

  const handlePayDebt = (e: React.FormEvent) => {
    e.preventDefault();
    if (debtCustomer && paymentAmount > 0) {
      payCustomerDebt(debtCustomer.id, paymentAmount);
      setIsPayingDebt(false);
      setDebtCustomer(null);
      setPaymentAmount(0);
      alert('تم سداد الدفعة بنجاح');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">إدارة العملاء</h2>
        <button 
          onClick={() => { setCurrentCustomer({}); setIsEditing(true); }}
          className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} />
          إضافة عميل
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4 items-center">
          <div className="relative w-96 max-w-full">
            <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="بحث بالاسم أو الهاتف..." 
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="px-6 py-3 font-semibold">الاسم</th>
                <th className="px-6 py-3 font-semibold">رقم الهاتف</th>
                <th className="px-6 py-3 font-semibold">العنوان</th>
                <th className="px-6 py-3 font-semibold">المديونية</th>
                <th className="px-6 py-3 font-semibold">عدد الفواتير</th>
                <th className="px-6 py-3 font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.map(customer => {
                const invoicesCount = data.invoices.filter(i => i.customerId === customer.id).length;
                const balance = customer.balance || 0;
                return (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{customer.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600" dir="ltr">{customer.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{customer.address}</td>
                    <td className="px-6 py-4">
                      {balance > 0 ? (
                        <span className="text-red-600 font-bold">{formatCurrency(balance)}</span>
                      ) : (
                        <span className="text-gray-400">لا يوجد مديونية</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setViewingInvoicesCustomer(customer)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 text-sm font-medium hover:bg-blue-100 transition-colors cursor-pointer"
                      >
                        <FileText size={14} />
                        {invoicesCount} فواتير
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-3">
                        {balance > 0 && (
                          <button onClick={() => { setDebtCustomer(customer); setIsPayingDebt(true); }} className="text-green-600 hover:text-green-800" title="تسديد دفعة">
                            <DollarSign size={18} />
                          </button>
                        )}
                        <button onClick={() => editItem(customer)} className="text-blue-600 hover:text-blue-800">
                          <Edit2 size={18} />
                        </button>
                        <button onClick={() => {if(window.confirm('متأكد من الحذف؟')) deleteCustomer(customer.id)}} className="text-red-600 hover:text-red-800">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    لا يوجد عملاء مسجلين
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold">{currentCustomer.id ? 'تعديل بيانات عميل' : 'إضافة عميل جديد'}</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-800">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">اسم العميل</label>
                <input required type="text" className="w-full p-2 border rounded-md" value={currentCustomer.name || ''} onChange={e => setCurrentCustomer({...currentCustomer, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف</label>
                <input type="text" className="w-full p-2 border rounded-md text-right" dir="ltr" value={currentCustomer.phone || ''} onChange={e => setCurrentCustomer({...currentCustomer, phone: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                <textarea className="w-full p-2 border rounded-md" rows={3} value={currentCustomer.address || ''} onChange={e => setCurrentCustomer({...currentCustomer, address: e.target.value})}></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 font-medium">حفظ</button>
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 font-medium">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPayingDebt && debtCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold">تسديد دفعة من المديونية</h3>
              <button onClick={() => {setIsPayingDebt(false); setDebtCustomer(null)}} className="text-gray-500 hover:text-gray-800">&times;</button>
            </div>
            <form onSubmit={handlePayDebt} className="p-6 space-y-4">
              <div className="bg-red-50 p-3 rounded-md text-red-800 border border-red-100">
                <p className="text-sm">إجمالي المديونية على <strong>{debtCustomer.name}</strong></p>
                <p className="text-xl font-bold">{formatCurrency(debtCustomer.balance || 0)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ المسدد</label>
                <input 
                  required 
                  type="number" 
                  min="1" 
                  max={debtCustomer.balance} 
                  step="0.01" 
                  className="w-full p-2 border rounded-md" 
                  value={paymentAmount || ''} 
                  onChange={e => setPaymentAmount(Number(e.target.value))} 
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-green-600 text-white py-2 rounded-md hover:bg-green-700 font-medium">سداد</button>
                <button type="button" onClick={() => {setIsPayingDebt(false); setDebtCustomer(null)}} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 font-medium">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Invoices Modal */}
      {viewingInvoicesCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold">
                سجل الفواتير - <span className="text-blue-600">{viewingInvoicesCustomer.name}</span>
              </h3>
              <button onClick={() => setViewingInvoicesCustomer(null)} className="text-gray-500 hover:text-gray-800 text-xl">&times;</button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              {(() => {
                const customerInvoices = data.invoices.filter(i => i.customerId === viewingInvoicesCustomer.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                
                if (customerInvoices.length === 0) {
                  return (
                    <div className="text-center py-12 text-gray-500">
                      لا توجد فواتير سابقة لهذا العميل
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {customerInvoices.map((invoice, idx) => (
                      <div key={invoice.id} className="border border-gray-200 rounded-lg p-4 bg-white shadow-sm hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-start mb-3 border-b pb-2">
                          <div>
                            <p className="font-bold text-gray-800">فاتورة #{invoice.id.substring(0, 8)}...</p>
                            <p className="text-sm text-gray-500">{new Date(invoice.date).toLocaleString('ar-EG')}</p>
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-lg text-blue-700">{formatCurrency(invoice.total)}</p>
                            {invoice.total > invoice.paid && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                                آجل: {formatCurrency(invoice.total - invoice.paid)}
                              </span>
                            )}
                            {invoice.total <= invoice.paid && (
                              <span className="inline-block mt-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded">
                                مدفوعة
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-sm">
                          <p className="text-gray-600 mb-2 font-semibold">الأصناف ({invoice.items.length}):</p>
                          <ul className="space-y-1 text-gray-600 list-disc list-inside">
                            {invoice.items.map((item, i) => (
                              <li key={i}>
                                {item.product.name} <span className="text-gray-400">×</span> {item.quantity} 
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 text-left">
              <button onClick={() => setViewingInvoicesCustomer(null)} className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-medium">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
