import React, { useState } from 'react';
import { useApp } from '../store';
import { Product } from '../types';
import { formatCurrency, generateId } from '../utils';
import { Plus, Edit2, Trash2, Search } from 'lucide-react';

export function Inventory() {
  const { data, addProduct, updateProduct, deleteProduct } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});

  const filteredProducts = data.products.filter(p => 
    p.name.includes(searchTerm) || p.barcode.includes(searchTerm) || p.category.includes(searchTerm)
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentProduct.id) {
      updateProduct(currentProduct as Product);
    } else {
      addProduct({
        ...currentProduct,
        id: generateId(),
      } as Product);
    }
    setIsEditing(false);
    setCurrentProduct({});
  };

  const editItem = (p: Product) => {
    setCurrentProduct(p);
    setIsEditing(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">إدارة المخزون</h2>
        <button 
          onClick={() => { setCurrentProduct({ barcode: Math.floor(100000000000 + Math.random() * 900000000000).toString() }); setIsEditing(true); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 shadow-sm"
        >
          <Plus size={20} />
          إضافة منتج
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex gap-4 items-center">
          <div className="relative w-96 max-w-full">
            <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="بحث بالاسم، الباركود، أو التصنيف..." 
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 text-gray-700 border-b">
              <tr>
                <th className="px-6 py-3 font-semibold">الباركود</th>
                <th className="px-6 py-3 font-semibold">اسم المنتج</th>
                <th className="px-6 py-3 font-semibold">التصنيف</th>
                <th className="px-6 py-3 font-semibold">التكلفة</th>
                <th className="px-6 py-3 font-semibold">سعر البيع</th>
                <th className="px-6 py-3 font-semibold">المخزون</th>
                <th className="px-6 py-3 font-semibold text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map(product => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-500">{product.barcode}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{product.category}</td>
                  <td className="px-6 py-4 text-sm">{formatCurrency(product.cost)}</td>
                  <td className="px-6 py-4 text-sm text-blue-600 font-semibold">{formatCurrency(product.price)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${product.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => editItem(product)} className="text-blue-600 hover:text-blue-800">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => {if(window.confirm('متأكد من الحذف؟')) deleteProduct(product.id)}} className="text-red-600 hover:text-red-800">
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    لا توجد منتجات مسجلة
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Add/Edit */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold">{currentProduct.id ? 'تعديل منتج' : 'إضافة منتج جديد'}</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-800">&times;</button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
                  <input required type="text" className="w-full p-2 border rounded-md" value={currentProduct.name || ''} onChange={e => setCurrentProduct({...currentProduct, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الباركود</label>
                  <div className="flex gap-2">
                    <input required type="text" className="w-full p-2 border rounded-md" value={currentProduct.barcode || ''} onChange={e => setCurrentProduct({...currentProduct, barcode: e.target.value})} />
                    <button type="button" onClick={() => setCurrentProduct({...currentProduct, barcode: Math.floor(100000000000 + Math.random() * 900000000000).toString()})} className="bg-gray-100 px-3 border border-gray-300 rounded-md hover:bg-gray-200 text-sm whitespace-nowrap">توليد</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
                  <input required type="text" className="w-full p-2 border rounded-md" value={currentProduct.category || ''} onChange={e => setCurrentProduct({...currentProduct, category: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سعر التكلفة</label>
                  <input required type="number" min="0" step="0.01" className="w-full p-2 border rounded-md" value={currentProduct.cost || ''} onChange={e => setCurrentProduct({...currentProduct, cost: Number(e.target.value)})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سعر البيع</label>
                  <input required type="number" min="0" step="0.01" className="w-full p-2 border rounded-md" value={currentProduct.price || ''} onChange={e => setCurrentProduct({...currentProduct, price: Number(e.target.value)})} />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">الكمية المتاحة (المخزون)</label>
                  <input required type="number" min="0" className="w-full p-2 border rounded-md" value={currentProduct.stock || ''} onChange={e => setCurrentProduct({...currentProduct, stock: Number(e.target.value)})} />
                </div>
              </div>
              <div className="pt-4 flex gap-3">
                <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 font-medium">حفظ</button>
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-md hover:bg-gray-200 font-medium">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
