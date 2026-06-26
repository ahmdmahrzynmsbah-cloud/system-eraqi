import React from 'react';
import { Bell, User, Search } from 'lucide-react';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 print:hidden">
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
        <button className="text-gray-500 hover:text-gray-700 relative">
          <Bell size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
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
