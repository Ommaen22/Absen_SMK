import { useEffect, useState } from 'react';
import { PageType } from '../types';
import { getStudents, getAttendance, getTodayString } from '../store';
import { Users, CheckCircle, XCircle, Clock, ScanBarcode, TrendingUp, Calendar, AlertTriangle } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: PageType) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    todayPresent: 0,
    todayLate: 0,
    todayAbsent: 0,
    totalRecords: 0,
  });
  const today = getTodayString();

  useEffect(() => {
    const students = getStudents();
    const records = getAttendance();
    const todayRecords = records.filter(r => r.date === today);

    setStats({
      totalStudents: students.length,
      todayPresent: todayRecords.filter(r => r.status === 'hadir').length,
      todayLate: todayRecords.filter(r => r.status === 'izin' || r.status === 'sakit').length,
      todayAbsent: students.length - todayRecords.filter(r => r.status === 'hadir' || r.status === 'izin' || r.status === 'sakit').length,
      totalRecords: records.length,
    });
  }, [today]);

  const now = new Date();
  const dateStr = now.toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1 flex items-center gap-2">
            <Calendar size={16} />
            {dateStr}
          </p>
        </div>
        <button
          onClick={() => onNavigate('scan')}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
        >
          <ScanBarcode size={20} />
          Mulai Scan Absensi
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<Users size={24} />}
          label="Total Siswa"
          value={stats.totalStudents}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle size={24} />}
          label="Hadir Hari Ini"
          value={stats.todayPresent}
          color="emerald"
        />
        <StatCard
          icon={<AlertTriangle size={24} />}
          label="Izin/Sakit"
          value={stats.todayLate}
          color="yellow"
        />
        <StatCard
          icon={<XCircle size={24} />}
          label="Belum Absen"
          value={stats.todayAbsent}
          color="red"
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickAction
          icon={<ScanBarcode size={28} />}
          title="Scan Barcode"
          description="Absensi menggunakan scanner CASHCOW HC-P10"
          onClick={() => onNavigate('scan')}
          color="emerald"
        />
        <QuickAction
          icon={<TrendingUp size={28} />}
          title="Rekap Bulanan"
          description="Lihat rekap kehadiran per bulan"
          onClick={() => onNavigate('monthly')}
          color="blue"
        />
        <QuickAction
          icon={<Clock size={28} />}
          title="Rekap Tahunan"
          description="Lihat rekap kehadiran per tahun"
          onClick={() => onNavigate('yearly')}
          color="purple"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Aktivitas Terbaru Hari Ini</h2>
        <RecentActivity today={today} />
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    yellow: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };

  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-80">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
        <div className="opacity-60">{icon}</div>
      </div>
    </div>
  );
}

function QuickAction({ icon, title, description, onClick, color }: {
  icon: React.ReactNode; title: string; description: string; onClick: () => void; color: string;
}) {
  const colors: Record<string, string> = {
    emerald: 'hover:border-emerald-500/50 hover:bg-emerald-500/5',
    blue: 'hover:border-blue-500/50 hover:bg-blue-500/5',
    purple: 'hover:border-purple-500/50 hover:bg-purple-500/5',
  };

  return (
    <button
      onClick={onClick}
      className={`bg-gray-900 rounded-2xl border border-gray-800 p-6 text-left transition-all ${colors[color]}`}
    >
      <div className="text-gray-400 mb-3">{icon}</div>
      <h3 className="text-white font-semibold">{title}</h3>
      <p className="text-gray-500 text-sm mt-1">{description}</p>
    </button>
  );
}

function RecentActivity({ today }: { today: string }) {
  const records = getAttendance().filter(r => r.date === today).slice(-10).reverse();

  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock size={40} className="mx-auto mb-3 opacity-30" />
        <p>Belum ada aktivitas absensi hari ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {records.map((r) => (
        <div key={r.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${r.status === 'hadir' ? 'bg-emerald-500' : r.status === 'izin' ? 'bg-yellow-500' : r.status === 'sakit' ? 'bg-orange-500' : 'bg-red-500'}`} />
            <div>
              <p className="text-sm text-white">{r.studentName}</p>
              <p className="text-xs text-gray-500">{r.className}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300">{r.time}</p>
            <p className={`text-xs font-medium ${
              r.status === 'hadir' ? 'text-emerald-400' : r.status === 'izin' ? 'text-yellow-400' : r.status === 'sakit' ? 'text-orange-400' : 'text-red-400'
            }`}>{r.status.toUpperCase()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
