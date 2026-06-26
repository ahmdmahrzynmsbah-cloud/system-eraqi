import React from 'react';
import { useApp } from '../store';
import { formatCurrency } from '../utils';
import { 
  TrendingUp, 
  TrendingDown, 
  Package, 
  Users,
  AlertTriangle 
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';

export function Dashboard() {
  const { data } = useApp();

  // Calculate totals
  const totalSales = data.invoices
    .filter(i => i.type === 'sale')
    .reduce((sum, inv) => sum + inv.total, 0);
    
  const totalReturns = data.invoices
    .filter(i => i.type === 'return')
    .reduce((sum, inv) => sum + inv.total, 0);

  const totalExpenses = data.expenses
    .reduce((sum, exp) => sum + exp.amount, 0);

  // Calculate costs of sold items to find profit
  const totalCostOfGoodsSold = data.invoices
    .filter(i => i.type === 'sale')
    .reduce((sum, inv) => {
      return sum + inv.items.reduce((itemSum, item) => itemSum + (item.product.cost * item.quantity), 0);
    }, 0);

  const netProfit = totalSales - totalReturns - totalCostOfGoodsSold - totalExpenses;

  const lowStockProducts = data.products.filter(p => p.stock <= 5);

  // Generate chart data (last 7 days)
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const daySales = data.invoices
      .filter(i => i.type === 'sale' && i.date.startsWith(date))
      .reduce((sum, i) => sum + i.total, 0);
    return {
      date: date.substring(5), // MM-DD
      'المبيعات': daySales
    };
  });

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">نظرة عامة</h2>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="إجمالي المبيعات" 
          value={formatCurrency(totalSales)} 
          icon={TrendingUp} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="صافي الأرباح" 
          value={formatCurrency(netProfit)} 
          icon={netProfit >= 0 ? TrendingUp : TrendingDown} 
          color={netProfit >= 0 ? "bg-green-500" : "bg-red-500"} 
        />
        <StatCard 
          title="إجمالي المصروفات" 
          value={formatCurrency(totalExpenses)} 
          icon={TrendingDown} 
          color="bg-red-400" 
        />
        <StatCard 
          title="العملاء" 
          value={data.customers.length.toString()} 
          icon={Users} 
          color="bg-purple-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts */}
        <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">مبيعات آخر 7 أيام</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="المبيعات" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-amber-500" />
            <h3 className="text-lg font-bold text-gray-800">تنبيهات المخزون</h3>
          </div>
          
          {lowStockProducts.length === 0 ? (
            <p className="text-gray-500 text-center py-8">المخزون في حالة جيدة</p>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-72 pr-2">
              {lowStockProducts.map(product => (
                <div key={product.id} className="flex justify-between items-center p-3 bg-red-50 rounded-md border border-red-100">
                  <div>
                    <p className="font-semibold text-gray-800">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.barcode}</p>
                  </div>
                  <div className="text-center">
                    <span className="block text-sm font-bold text-red-600">{product.stock}</span>
                    <span className="text-xs text-gray-500">متبقي</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`${color} w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-gray-500 text-sm">{title}</p>
        <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      </div>
    </div>
  );
}
