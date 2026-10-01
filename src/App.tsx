import { useState, useEffect } from 'react';
import { PageType } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ScanPage from './components/ScanPage';
import StudentManager from './components/StudentManager';
import TeacherManager from './components/TeacherManager';
import TeacherScanPage from './components/TeacherScanPage';
import TeacherMonthlyRecap from './components/TeacherMonthlyRecap';
import MonthlyRecap from './components/MonthlyRecap';
import YearlyRecap from './components/YearlyRecap';
import DataManager from './components/DataManager';
import WhatsAppPage from './components/WhatsAppPage';
import SettingsPage from './components/SettingsPage';
import { Menu, X } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
      case 'scan': return <ScanPage />;
      case 'students': return <StudentManager />;
      case 'teachers': return <TeacherManager />;
      case 'teacher-scan': return <TeacherScanPage />;
      case 'monthly': return <MonthlyRecap />;
      case 'yearly': return <YearlyRecap />;
      case 'teacher-monthly': return <TeacherMonthlyRecap />;
      case 'data': return <DataManager />;
      case 'whatsapp': return <WhatsAppPage />;
      case 'settings': return <SettingsPage />;
      default: return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page: PageType) => { setCurrentPage(page); setSidebarOpen(false); }}
        />
      </div>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <div className="lg:hidden flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-300 hover:text-white">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-lg font-bold text-emerald-400">SIHADIR</h1>
          <div className="w-6" />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
