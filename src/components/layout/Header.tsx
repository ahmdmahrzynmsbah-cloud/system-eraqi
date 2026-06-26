import React, { useState, useRef, useEffect } from 'react';
import { Bell, User, Search, AlertTriangle, AlertCircle, Package } from 'lucide-react';
import { useApp } from '../../store';
import { formatCurrency } from '../../utils';

export function Header() {
  const { data } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  // Generate notifications
  const lowStockProducts = data.products.filter(p => p.stock <= 5);
  const customersWithDebt = data.customers.filter(c => (c.balance || 0) > 0);
  
  const notifications = [
    ...lowStockProducts.map(p => ({
      id: `stock-${p.id}`,
      type: 'warning',
      title: 'تنبيه مخزون',
      message: `المنتج "${p.name}" قارب على الانتهاء (المتبقي: ${p.stock})`,
      icon: Package,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50'
    })),
    ...customersWithDebt.map(c => ({
      id: `debt-${c.id}`,
      type: 'alert',
      title: 'تنبيه مديونية',
      message: `العميل "${c.name}" عليه مديونية بقيمة ${formatCurrency(c.balance || 0)}`,
      icon: AlertCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50'
    }))
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="relative z-50 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 print:hidden">
      <div className="flex items-center flex-1">
        <div className="relative w-64">
          <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
            <Search size={18} />
          </span>
          <input 
            type="text" 
            placeholder="بحث سريع..." 
            className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative" ref={notificationsRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-gray-500 hover:text-gray-700 relative p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                {notifications.length > 9 ? '9+' : notifications.length}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden transform origin-top-left transition-all">
              <div className="p-3 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700">الإشعارات</h3>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                  {notifications.length} جديد
                </span>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-gray-500 text-sm flex flex-col items-center">
                    <Bell size={32} className="text-gray-300 mb-2" />
                    لا توجد إشعارات حالياً
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {notifications.map(notif => (
                      <div key={notif.id} className="p-3 hover:bg-gray-50 transition-colors flex gap-3">
                        <div className={`mt-0.5 p-2 rounded-full h-fit ${notif.bgColor} ${notif.color}`}>
                          <notif.icon size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{notif.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{notif.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="h-8 w-px bg-gray-300"></div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold">
            م
          </div>
          <span className="font-medium text-gray-700 text-sm">مدير النظام</span>
        </div>
      </div>
    </header>
  );
}
