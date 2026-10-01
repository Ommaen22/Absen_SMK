import { PageType } from '../types';
import {
  LayoutDashboard,
  ScanBarcode,
  Users,
  CalendarDays,
  CalendarRange,
  Database,
  Settings,
  GraduationCap,
  MessageCircle,
  UserCheck,
  BookOpen,
  ClipboardList,
} from 'lucide-react';

interface SidebarProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
}

export default function Sidebar({ currentPage, onNavigate }: SidebarProps) {
  return (
    <div className="w-64 h-screen bg-gray-900 border-r border-gray-800 flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="p-5 border-b border-gray-800">
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
      <nav className="flex-1 p-3 space-y-1">
        {/* Dashboard */}
        <NavItem page="dashboard" label="Dashboard" icon={<LayoutDashboard size={18} />} current={currentPage} onClick={onNavigate} />

        {/* Absensi */}
        <div className="pt-3 pb-1 px-3">
          <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Absensi</p>
        </div>
        <NavItem page="scan" label="Scan Absensi" icon={<ScanBarcode size={18} />} current={currentPage} onClick={onNavigate} />
        <NavItem page="students" label="Data Siswa" icon={<Users size={18} />} current={currentPage} onClick={onNavigate} />
        <NavItem page="teachers" label="Data Guru" icon={<BookOpen size={18} />} current={currentPage} onClick={onNavigate} color="purple" />
        <NavItem page="monthly" label="Rekap Bulanan Siswa" icon={<CalendarDays size={18} />} current={currentPage} onClick={onNavigate} />
        <NavItem page="teacher-monthly" label="Rekap Bulanan Guru" icon={<ClipboardList size={18} />} current={currentPage} onClick={onNavigate} color="purple" />
        <NavItem page="yearly" label="Rekap Tahunan" icon={<CalendarRange size={18} />} current={currentPage} onClick={onNavigate} />

        {/* Notifikasi & Data */}
        <div className="pt-3 pb-1 px-3">
          <p className="text-xs text-gray-600 uppercase tracking-wider font-semibold">Lainnya</p>
        </div>
        <NavItem page="whatsapp" label="Notifikasi WhatsApp" icon={<MessageCircle size={18} />} current={currentPage} onClick={onNavigate} color="green" />
        <NavItem page="data" label="Import/Export" icon={<Database size={18} />} current={currentPage} onClick={onNavigate} />
        <NavItem page="settings" label="Pengaturan" icon={<Settings size={18} />} current={currentPage} onClick={onNavigate} />
        <NavItem page="guide" label="Panduan Lengkap" icon={<BookOpen size={18} />} current={currentPage} onClick={onNavigate} color="green" />
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800">
        <div className="bg-gray-800/50 rounded-xl p-3">
          <p className="text-xs text-gray-500 text-center">CASHCOW HC-P10 USB</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs text-emerald-400">Scanner Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavItem({ page, label, icon, current, onClick, color = 'emerald' }: {
  page: PageType; label: string; icon: React.ReactNode; current: PageType;
  onClick: (page: PageType) => void; color?: string;
}) {
  const colorClasses: Record<string, { active: string; hover: string }> = {
    emerald: { active: 'bg-emerald-500/20 text-emerald-400', hover: 'hover:bg-gray-800 hover:text-gray-200' },
    purple: { active: 'bg-purple-500/20 text-purple-400', hover: 'hover:bg-gray-800 hover:text-gray-200' },
    green: { active: 'bg-green-500/20 text-green-400', hover: 'hover:bg-gray-800 hover:text-gray-200' },
  };

  const colors = colorClasses[color] || colorClasses.emerald;
  const isActive = current === page;

  return (
    <button
      onClick={() => onClick(page)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive ? `${colors.active} shadow-lg` : `text-gray-400 ${colors.hover}`
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
