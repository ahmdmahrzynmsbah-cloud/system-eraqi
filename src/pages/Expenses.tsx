import React, { useState } from 'react';
import { useApp } from '../store';
import { Expense } from '../types';
import { formatCurrency, generateId } from '../utils';
import { Plus, Trash2 } from 'lucide-react';

export function Expenses() {
  const { data, addExpense, deleteExpense } = useApp();
  const [isAdding, setIsAdding] = useState(false);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    date: new Date().toISOString().split('T')[0]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addExpense({
      ...newExpense,
      id: generateId(),
    } as Expense);
    setIsAdding(false);
    setNewExpense({ date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">سجل المصروفات</h2>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} />
          تسجيل مصروف جديد
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="px-6 py-3 font-semibold">التاريخ</th>
                <th className="px-6 py-3 font-semibold">البيان / الوصف</th>
                <th className="px-6 py-3 font-semibold">التصنيف</th>
                <th className="px-6 py-3 font-semibold">المبلغ</th>
                <th className="px-6 py-3 font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.expenses.map(expense => (
                <tr key={expense.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">{new Date(expense.date).toLocaleDateString('ar-EG')}</td>
                  <td className="px-6 py-4">{expense.description}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{expense.category}</td>
                  <td className="px-6 py-4 font-bold text-red-600">{formatCurrency(expense.amount)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <button onClick={() => {if(window.confirm('متأكد من الحذف؟')) deleteExpense(expense.id)}} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {data.expenses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">لا توجد مصروفات مسجلة</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold">إضافة مصروف جديد</h3>
              <button onClick={() => setIsAdding(false)} className="text-gray-500 hover:text-gray-800">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التاريخ</label>
                <input required type="date" className="w-full p-2 border rounded-md" value={newExpense.date} onChange={e => setNewExpense({...newExpense, date: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">البيان / الوصف</label>
                <input required type="text" className="w-full p-2 border rounded-md" value={newExpense.description || ''} onChange={e => setNewExpense({...newExpense, description: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف (إيجار، كهرباء، رواتب...)</label>
                <input required type="text" className="w-full p-2 border rounded-md" value={newExpense.category || ''} onChange={e => setNewExpense({...newExpense, category: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">المبلغ</label>
                <input required type="number" min="0" step="0.01" className="w-full p-2 border rounded-md" value={newExpense.amount || ''} onChange={e => setNewExpense({...newExpense, amount: Number(e.target.value)})} />
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 font-medium">حفظ المصروف</button>
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 font-medium">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
