import React, { useState } from 'react';
import { useApp } from '../store';
import { formatCurrency } from '../utils';

export function Reports() {
  const { data } = useApp();
  const [dateFilter, setDateFilter] = useState('');

  const filteredInvoices = dateFilter 
    ? data.invoices.filter(i => i.date.startsWith(dateFilter))
    : data.invoices;

  const totalSales = filteredInvoices
    .filter(i => i.type === 'sale')
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalCost = filteredInvoices
    .filter(i => i.type === 'sale')
    .reduce((sum, inv) => sum + inv.items.reduce((itemSum, item) => itemSum + (item.product.cost * item.quantity), 0), 0);

  const filteredExpenses = dateFilter
    ? data.expenses.filter(e => e.date.startsWith(dateFilter))
    : data.expenses;

  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  
  const netProfit = totalSales - totalCost - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">التقارير والإحصائيات</h2>
        <div className="flex gap-2 items-center">
          <label className="text-sm font-medium text-gray-700">تصفية بالتاريخ:</label>
          <input 
            type="date" 
            className="p-2 border rounded-md border-gray-300"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          {dateFilter && (
            <button onClick={() => setDateFilter('')} className="text-sm text-red-600 hover:text-red-800">إلغاء التصفية</button>
          )}
          <button onClick={() => window.print()} className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 shadow-sm mr-4 print:hidden">
            طباعة التقرير
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 font-medium mb-1">إجمالي المبيعات</h3>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalSales)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 font-medium mb-1">إجمالي التكلفة والمصروفات</h3>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(totalCost + totalExpenses)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 font-medium mb-1">صافي الربح</h3>
          <p className={`text-3xl font-bold ${netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(netProfit)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <h3 className="font-bold text-gray-800">سجل الفواتير</h3>
        </div>
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-700 border-b sticky top-0">
              <tr>
                <th className="px-6 py-3 font-semibold">رقم الفاتورة</th>
                <th className="px-6 py-3 font-semibold">التاريخ والوقت</th>
                <th className="px-6 py-3 font-semibold">العميل</th>
                <th className="px-6 py-3 font-semibold">عدد الأصناف</th>
                <th className="px-6 py-3 font-semibold">الإجمالي</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredInvoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-mono text-sm">{invoice.id}</td>
                  <td className="px-6 py-4 text-sm" dir="ltr">{new Date(invoice.date).toLocaleString('ar-EG')}</td>
                  <td className="px-6 py-4">{invoice.customerId ? data.customers.find(c => c.id === invoice.customerId)?.name : 'عميل نقدي'}</td>
                  <td className="px-6 py-4">{invoice.items.reduce((sum, item) => sum + item.quantity, 0)}</td>
                  <td className="px-6 py-4 font-bold text-blue-600">{formatCurrency(invoice.total)}</td>
                </tr>
              ))}
              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">لا توجد فواتير في هذه الفترة</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
