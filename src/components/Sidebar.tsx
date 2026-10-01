import { PageType } from '../types';
import {
  LayoutDashboard,
  ScanBarcode,
  Users,
  CalendarDays,
  CalendarRange,
  Database,
  Settings,
  GraduationCap
} from 'lucide-react';

interface SidebarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

const menuItems: { page: PageType; label: string; icon: React.ReactNode }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { page: 'scan', label: 'Scan Absensi', icon: <ScanBarcode size={20} /> },
  { page: 'students', label: 'Data Siswa', icon: <Users size={20} /> },
  { page: 'monthly', label: 'Rekap Bulanan', icon: <CalendarDays size={20} /> },
  { page: 'yearly', label: 'Rekap Tahunan', icon: <CalendarRange size={20} /> },
  { page: 'data', label: 'Import/Export', icon: <Database size={20} /> },
  { page: 'settings', label: 'Pengaturan', icon: <Settings size={20} /> },
];

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <div className="w-64 h-screen bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
            <GraduationCap className="text-emerald-400" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-emerald-400">SIHADIR</h1>
            <p className="text-xs text-gray-500">Sistem Absensi Digital</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.page}
            onClick={() => onNavigate(item.page)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
              currentPage === item.page
                ? 'bg-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800/50 rounded-xl p-4">
          <p className="text-xs text-gray-500 text-center">CASHCOW HC-P10 USB</p>
          <p className="text-xs text-gray-600 text-center mt-1">Barcode Scanner Ready</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
}
