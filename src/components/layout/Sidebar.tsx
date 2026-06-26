import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  FileText, 
  Settings,
  Wallet
} from 'lucide-react';
import { cn } from '../../utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'لوحة القيادة', icon: LayoutDashboard },
  { id: 'pos', label: 'نقطة البيع', icon: ShoppingCart },
  { id: 'inventory', label: 'المخزون', icon: Package },
  { id: 'customers', label: 'العملاء', icon: Users },
  { id: 'expenses', label: 'المصروفات', icon: Wallet },
  { id: 'reports', label: 'التقارير', icon: FileText },
  { id: 'settings', label: 'الإعدادات', icon: Settings },
];

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-l border-gray-200 flex flex-col h-full print:hidden">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">نظام إدارة الأعمال</h1>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    activeTab === item.id 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-200 text-sm text-gray-500 text-center">
        نسخة 1.0.0
      </div>
    </aside>
  );
}
