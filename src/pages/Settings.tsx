import React, { useRef } from 'react';
import { useApp } from '../store';
import { Download, Upload, Trash2, ShieldCheck, Smartphone } from 'lucide-react';

export function Settings() {
  const { data, importData, resetData } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
      JSON.stringify(data)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = `erp_backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (window.confirm('سيتم استبدال البيانات الحالية بالبيانات المستوردة. هل تريد المتابعة؟')) {
          importData(json);
          alert('تم استيراد البيانات بنجاح');
        }
      } catch (error) {
        alert('ملف غير صالح');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-800">الإعدادات والنسخ الاحتياطي</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Backup and Restore */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-4">
          <h3 className="text-lg font-bold text-gray-800 border-b pb-2">النسخ الاحتياطي للبيانات</h3>
          <p className="text-sm text-gray-500 mb-4">
            السيستم يعمل أوفلاين (بدون إنترنت)، لذا من الضروري أخذ نسخة احتياطية من بياناتك بشكل دوري للحفاظ عليها.
          </p>
          
          <button 
            onClick={handleExport}
            className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-3 rounded-md flex items-center justify-center gap-2 hover:bg-blue-100 transition-colors"
          >
            <Download size={20} />
            <span className="font-medium">تحميل نسخة احتياطية (تصدير)</span>
          </button>

          <input 
            type="file" 
            accept=".json" 
            className="hidden" 
            ref={fileInputRef}
            onChange={handleImport}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-gray-50 text-gray-700 border border-gray-200 py-3 rounded-md flex items-center justify-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <Upload size={20} />
            <span className="font-medium">استرجاع بيانات (استيراد)</span>
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-red-200 space-y-4">
          <h3 className="text-lg font-bold text-red-600 border-b border-red-100 pb-2">منطقة الخطر</h3>
          <p className="text-sm text-gray-500 mb-4">
            مسح جميع البيانات سيعيد النظام إلى حالة الصفر ولن تتمكن من استرجاع البيانات إلا إذا كان لديك ملف نسخة احتياطية.
          </p>
          
          <button 
            onClick={resetData}
            className="w-full bg-red-50 text-red-700 border border-red-200 py-3 rounded-md flex items-center justify-center gap-2 hover:bg-red-100 transition-colors mt-auto"
          >
            <Trash2 size={20} />
            <span className="font-medium">مسح جميع البيانات (تصفير النظام)</span>
          </button>
        </div>

        {/* App Sync Info */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 md:col-span-2 space-y-4">
          <div className="flex items-center gap-3 border-b pb-2">
            <Smartphone className="text-blue-600" size={24} />
            <h3 className="text-lg font-bold text-gray-800">ربط النظام بتطبيق الهاتف</h3>
          </div>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1 space-y-3">
              <p className="text-gray-700">
                متاح الآن ربط هذا السيستم بتطبيق الموبايل الخاص بك لتتمكن من متابعة الأرباح والمبيعات والمخزون من أي مكان.
              </p>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex gap-2 items-center"><ShieldCheck size={16} className="text-green-500"/> مزامنة لحظية للبيانات</li>
                <li className="flex gap-2 items-center"><ShieldCheck size={16} className="text-green-500"/> إشعارات بالمبيعات ونقص المخزون</li>
                <li className="flex gap-2 items-center"><ShieldCheck size={16} className="text-green-500"/> دعم فني مجاني لأول شهر</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 text-center min-w-[250px]">
              <span className="block text-sm text-blue-600 font-bold mb-1">تكلفة الربط والتطبيق</span>
              <span className="block text-3xl font-bold text-gray-800 mb-4">3,500 ج.م</span>
              <button className="bg-blue-600 text-white w-full py-2 rounded-md font-medium hover:bg-blue-700">
                طلب الربط الآن
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
