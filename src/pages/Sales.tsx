import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../store';
import { Product, InvoiceItem, Invoice } from '../types';
import { formatCurrency, generateId } from '../utils';
import { Search, Plus, Minus, Trash2, Printer, CheckCircle, ShoppingCart } from 'lucide-react';

export function POS() {
  const { data, addInvoice, addCustomer } = useApp();
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [discount, setDiscount] = useState(0);
  const [paid, setPaid] = useState(0);
  const [paymentType, setPaymentType] = useState<'cash' | 'credit' | 'partial'>('cash');
  const [isSuccess, setIsSuccess] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<Invoice | null>(null);
  
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus search input on mount and after sale
  useEffect(() => {
    searchInputRef.current?.focus();
  }, [isSuccess]);

  const filteredProducts = data.products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.barcode.includes(searchTerm)
  );

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // If exactly one product matches barcode or name, add it instantly
      const match = data.products.find(p => p.barcode === searchTerm);
      if (match) {
        addToCart(match);
        setSearchTerm('');
      } else if (filteredProducts.length === 1) {
        addToCart(filteredProducts[0]);
        setSearchTerm('');
      }
    }
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert('الكمية غير متوفرة في المخزون');
          return prev;
        }
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prev, { product, quantity: 1, price: product.price, total: product.price }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQuantity = Math.max(1, item.quantity + delta);
        if (newQuantity > item.product.stock) {
          alert('الكمية غير متوفرة في المخزون');
          return item;
        }
        return { ...item, quantity: newQuantity, total: newQuantity * item.price };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal - discount;

  // Set paid automatically based on payment type
  useEffect(() => {
    if (paymentType === 'cash') {
      setPaid(total);
    } else if (paymentType === 'credit') {
      setPaid(0);
    }
  }, [total, paymentType]);

  const handleCheckout = () => {
    if (cart.length === 0) return;

    let finalCustomerId = null;
    
    // Check if we need to create or link customer
    if (customerName.trim()) {
      const existingCustomer = data.customers.find(c => c.name === customerName.trim());
      if (existingCustomer) {
        finalCustomerId = existingCustomer.id;
      } else {
        finalCustomerId = generateId();
        addCustomer({
          id: finalCustomerId,
          name: customerName.trim(),
          phone: customerPhone.trim(),
          address: '',
          balance: 0
        });
      }
    }

    if ((paymentType === 'credit' || paymentType === 'partial' || paid < total) && !finalCustomerId) {
      alert('يجب كتابة اسم العميل لتسجيل المديونية (البيع الآجل أو الجزئي).');
      return;
    }

    const invoice: Invoice = {
      id: generateId(),
      date: new Date().toISOString(),
      customerId: finalCustomerId,
      items: cart,
      subtotal,
      discount,
      total,
      paid,
      type: 'sale'
    };

    addInvoice(invoice);
    setLastInvoice(invoice);
    setIsSuccess(true);
    
    // Print window
    setTimeout(() => {
      window.print();
      // Reset
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setDiscount(0);
      setPaid(0);
      setPaymentType('cash');
      setSearchTerm('');
      setIsSuccess(false);
    }, 500);
  };

  return (
    <div className="flex flex-col pb-10">
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Products Section */}
        <div className="lg:col-span-3 flex flex-col bg-white rounded-lg shadow-sm border border-gray-100 print:hidden h-fit">
          <div className="p-4 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-lg">
            <div className="relative">
              <Search className="absolute right-3 top-2.5 text-gray-400" size={20} />
              <input 
                ref={searchInputRef}
                type="text" 
                placeholder="ابحث باسم المنتج أو الباركود..." 
                className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleSearchKeyPress}
              />
            </div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-b-lg">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <button
                  key={product.id}
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className={`bg-white p-4 rounded-lg border text-right transition-all hover:shadow-md ${product.stock <= 0 ? 'opacity-50 border-gray-200 cursor-not-allowed' : 'border-blue-100 hover:border-blue-300'}`}
                >
                  <h4 className="font-bold text-gray-800 line-clamp-2 min-h-[40px]">{product.name}</h4>
                  <div className="mt-2 flex justify-between items-end">
                    <span className="text-blue-600 font-bold">{formatCurrency(product.price)}</span>
                    <span className="text-xs text-gray-500">المخزون: {product.stock}</span>
                  </div>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-500">
                  لا توجد منتجات مطابقة
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cart Section */}
        <div className="lg:col-span-2 flex flex-col bg-white rounded-lg shadow-sm border border-gray-100 print:hidden h-fit">
          <div className="p-5 border-b border-gray-200 bg-blue-50 rounded-t-lg">
            <h3 className="font-bold text-xl text-blue-800">الفاتورة الحالية</h3>
          </div>
          
          <div className="p-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                <ShoppingCart size={48} />
                <p>لا توجد منتجات في الفاتورة</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.product.id} className="p-4 border border-gray-100 rounded-lg bg-white flex flex-col gap-3 shadow-sm hover:border-blue-200 transition-colors">
                    <div className="flex justify-between font-bold text-gray-800">
                      <span className="text-base">{item.product.name}</span>
                      <span className="text-blue-700 text-lg">{formatCurrency(item.total)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium bg-gray-50 px-2 py-1 rounded">{formatCurrency(item.price)} / للوحدة</span>
                      <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-md p-1">
                        <button onClick={() => updateQuantity(item.product.id, 1)} className="p-1.5 bg-white border border-gray-200 shadow-sm rounded hover:bg-gray-50 text-gray-700 transition-colors">
                          <Plus size={16} />
                        </button>
                        <span className="w-10 text-center font-bold text-gray-800 text-base">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.product.id, -1)} className="p-1.5 bg-white border border-gray-200 shadow-sm rounded hover:bg-gray-50 text-gray-700 transition-colors">
                          <Minus size={16} />
                        </button>
                        <div className="w-px h-5 bg-gray-300 mx-1"></div>
                        <button onClick={() => removeFromCart(item.product.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-5 border-t border-gray-200 space-y-5 bg-gray-50">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">اسم العميل (اختياري)</label>
                <input 
                  type="text"
                  list="customersList"
                  className="w-full p-2.5 border border-gray-300 rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    const existing = data.customers.find(c => c.name === e.target.value);
                    if (existing) {
                      setCustomerPhone(existing.phone || '');
                    }
                  }}
                  placeholder="اختر أو اكتب جديد"
                />
                <datalist id="customersList">
                  {data.customers.map(c => <option key={c.id} value={c.name} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">رقم الهاتف</label>
                <input 
                  type="text"
                  className="w-full p-2.5 border border-gray-300 rounded-md text-base focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white shadow-sm text-right"
                  dir="ltr"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="رقم الهاتف"
                />
              </div>
            </div>

            <div className="space-y-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex justify-between text-base">
                <span className="text-gray-600 font-medium">المجموع الفرعي:</span>
                <span className="font-bold text-gray-800">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">الخصم:</span>
                <input 
                  type="number" 
                  className="w-28 p-1.5 text-left border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none font-semibold"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  min={0}
                />
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-gray-200 mt-2">
                <span className="text-xl font-bold text-gray-800">الإجمالي:</span>
                <span className="text-2xl font-black text-blue-700">{formatCurrency(total)}</span>
              </div>
              
              <div className="pt-4 border-t border-gray-200 mt-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">طريقة الدفع:</label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <button 
                    onClick={() => setPaymentType('cash')}
                    className={`py-2 px-2 text-base rounded-md border-2 transition-colors ${paymentType === 'cash' ? 'bg-blue-50 border-blue-600 text-blue-800 font-bold shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'}`}
                  >
                    كاش
                  </button>
                  <button 
                    onClick={() => setPaymentType('partial')}
                    className={`py-2 px-2 text-base rounded-md border-2 transition-colors ${paymentType === 'partial' ? 'bg-blue-50 border-blue-600 text-blue-800 font-bold shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'}`}
                  >
                    جزئي
                  </button>
                  <button 
                    onClick={() => setPaymentType('credit')}
                    className={`py-2 px-2 text-base rounded-md border-2 transition-colors ${paymentType === 'credit' ? 'bg-blue-50 border-blue-600 text-blue-800 font-bold shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'}`}
                  >
                    آجل
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                <span className="text-gray-700 font-bold text-base">المبلغ المدفوع:</span>
                <input 
                  type="number" 
                  className={`w-32 p-2 text-left border-2 rounded-md font-bold text-lg ${paymentType === 'cash' || paymentType === 'credit' ? 'bg-gray-200 text-gray-500 border-transparent cursor-not-allowed' : 'border-blue-300 text-green-700 focus:ring-2 focus:ring-blue-500 outline-none bg-white'}`}
                  value={paid}
                  onChange={(e) => {
                    setPaid(Number(e.target.value));
                    setPaymentType('partial');
                  }}
                  min={0}
                  disabled={paymentType === 'cash' || paymentType === 'credit'}
                />
              </div>
              {paid > total && (
                <div className="flex justify-between items-center text-amber-600 font-bold text-lg bg-amber-50 p-2 rounded">
                  <span>الباقي للعميل:</span>
                  <span>{formatCurrency(paid - total)}</span>
                </div>
              )}
              {paid < total && (
                <div className="flex justify-between items-center text-red-600 font-bold text-lg bg-red-50 p-2 rounded">
                  <span>الآجل (مديونية):</span>
                  <span>{formatCurrency(total - paid)}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleCheckout}
              disabled={cart.length === 0}
              className={`w-full py-4 text-lg rounded-xl flex items-center justify-center gap-3 font-bold text-white transition-all ${
                cart.length === 0 ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5'
              }`}
            >
              <Printer size={20} />
              دفع وطباعة الفاتورة
            </button>
          </div>
        </div>

      </div>

      {/* Printable Invoice Template */}
      <div className="hidden print:block p-8 bg-white" dir="rtl">
        {lastInvoice && (
          <div className="max-w-md mx-auto border border-gray-200 p-6 rounded-lg">
            <h1 className="text-3xl font-bold text-center mb-6 border-b pb-4">فاتورة مبيعات</h1>
            
            <div className="mb-6 text-base space-y-2">
              <p><span className="font-bold">رقم الفاتورة:</span> {lastInvoice.id}</p>
              <p><span className="font-bold">التاريخ:</span> {new Date(lastInvoice.date).toLocaleString('ar-EG')}</p>
              {lastInvoice.customerId && (
                <p><span className="font-bold">العميل:</span> {data.customers.find(c => c.id === lastInvoice.customerId)?.name || customerName}</p>
              )}
              {(lastInvoice.total - lastInvoice.paid > 0) && (
                <p><span className="font-bold">حالة الدفع:</span> آجل / مديونية</p>
              )}
            </div>
            
            <table className="w-full text-base mb-6 border-collapse">
              <thead className="border-y-2 border-gray-800 bg-gray-50">
                <tr>
                  <th className="text-right py-3 px-2">الصنف</th>
                  <th className="text-center py-3 px-2">الكمية</th>
                  <th className="text-left py-3 px-2">السعر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lastInvoice.items.map(item => (
                  <tr key={item.product.id}>
                    <td className="py-3 px-2 font-medium">{item.product.name}</td>
                    <td className="text-center py-3 px-2">{item.quantity}</td>
                    <td className="text-left py-3 px-2 font-bold">{formatCurrency(item.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div className="text-base space-y-2 bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between">
                <span className="text-gray-600">المجموع الفرعي:</span>
                <span className="font-bold">{formatCurrency(lastInvoice.subtotal)}</span>
              </div>
              {lastInvoice.discount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">الخصم:</span>
                  <span className="font-bold text-red-600">{formatCurrency(lastInvoice.discount)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-xl mt-3 pt-3 border-t-2 border-gray-800">
                <span>الإجمالي:</span>
                <span className="text-blue-700">{formatCurrency(lastInvoice.total)}</span>
              </div>
              <div className="flex justify-between mt-3 pt-3 border-t border-gray-300">
                <span className="text-gray-600">المدفوع:</span>
                <span className="font-bold text-green-700">{formatCurrency(lastInvoice.paid)}</span>
              </div>
              {lastInvoice.total - lastInvoice.paid > 0 && (
                <div className="flex justify-between mt-2 text-red-600">
                  <span className="font-bold">المتبقي (آجل):</span>
                  <span className="font-bold text-xl">{formatCurrency(lastInvoice.total - lastInvoice.paid)}</span>
                </div>
              )}
            </div>
            
            <div className="mt-8 text-center text-sm text-gray-500 border-t pt-4">
              <p>شكراً لتعاملكم معنا!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
