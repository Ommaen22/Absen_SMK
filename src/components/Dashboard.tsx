import { useEffect, useState } from 'react';
import { PageType } from '../types';
import { getStudents, getTeachers, getAttendance, getTeacherAttendance, getTodayString, getNotifications } from '../store';
import { Users, CheckCircle, XCircle, Clock, ScanBarcode, TrendingUp, Calendar, AlertTriangle, GraduationCap, MessageCircle, UserCheck } from 'lucide-react';

interface DashboardProps {
  onNavigate: (page: PageType) => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    todayStudentPresent: 0,
    todayTeacherPresent: 0,
    todayStudentPulang: 0,
    todayTeacherPulang: 0,
    totalRecords: 0,
    notificationsSent: 0,
  });
  const today = getTodayString();

  useEffect(() => {
    const students = getStudents();
    const teachers = getTeachers();
    const records = getAttendance();
    const teacherRecords = getTeacherAttendance();
    const notifications = getNotifications();

    const todayStudentRecords = records.filter(r => r.date === today);
    const todayTeacherRecords = teacherRecords.filter(r => r.date === today);
    const todayStudentMasuk = todayStudentRecords.filter(r => r.type === 'masuk');
    const todayTeacherMasuk = todayTeacherRecords.filter(r => r.type === 'masuk');

    setStats({
      totalStudents: students.length,
      totalTeachers: teachers.length,
      todayStudentPresent: todayStudentMasuk.filter(r => r.status === 'hadir').length,
      todayTeacherPresent: todayTeacherMasuk.filter(r => r.status === 'hadir').length,
      todayStudentPulang: todayStudentRecords.filter(r => r.type === 'pulang').length,
      todayTeacherPulang: todayTeacherRecords.filter(r => r.type === 'pulang').length,
      totalRecords: records.length + teacherRecords.length,
      notificationsSent: notifications.filter(n => n.status === 'sent' && n.date === today).length,
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
        <div className="flex gap-3">
          <button onClick={() => onNavigate('scan')}
            className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20">
            <ScanBarcode size={18} /> Mulai Scan Absensi
          </button>
        </div>
      </div>

      {/* Stats Cards - Siswa */}
      <div>
        <h2 className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-3">Absensi Siswa Hari Ini</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={<Users size={22} />} label="Total Siswa" value={stats.totalStudents} color="blue" />
          <StatCard icon={<CheckCircle size={22} />} label="Siswa Hadir" value={stats.todayStudentPresent} color="emerald" />
          <StatCard icon={<Clock size={22} />} label="Sudah Pulang" value={stats.todayStudentPulang} color="indigo" />
          <StatCard icon={<MessageCircle size={22} />} label="Notif WA Terkirim" value={stats.notificationsSent} color="green" />
        </div>
      </div>

      {/* Stats Cards - Guru */}
      <div>
        <h2 className="text-sm text-gray-500 uppercase tracking-wider font-semibold mb-3">Absensi Guru Hari Ini</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={<GraduationCap size={22} />} label="Total Guru" value={stats.totalTeachers} color="purple" />
          <StatCard icon={<CheckCircle size={22} />} label="Guru Hadir" value={stats.todayTeacherPresent} color="purple" />
          <StatCard icon={<Clock size={22} />} label="Guru Pulang" value={stats.todayTeacherPulang} color="indigo" />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction icon={<ScanBarcode size={24} />} title="Scan Absensi" description="Absen siswa & guru (otomatis)" onClick={() => onNavigate('scan')} color="emerald" />
        <QuickAction icon={<TrendingUp size={24} />} title="Rekap Bulanan" description="Laporan kehadiran siswa" onClick={() => onNavigate('monthly')} color="blue" />
        <QuickAction icon={<MessageCircle size={24} />} title="WhatsApp" description="Kelola notifikasi ortu" onClick={() => onNavigate('whatsapp')} color="green" />
        <QuickAction icon={<GraduationCap size={24} />} title="Rekap Guru" description="Laporan kehadiran guru" onClick={() => onNavigate('teacher-monthly')} color="purple" />
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
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
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
    green: 'hover:border-green-500/50 hover:bg-green-500/5',
  };

  return (
    <button onClick={onClick}
      className={`bg-gray-900 rounded-2xl border border-gray-800 p-5 text-left transition-all ${colors[color]}`}>
      <div className="text-gray-400 mb-3">{icon}</div>
      <h3 className="text-white font-semibold">{title}</h3>
      <p className="text-gray-500 text-sm mt-1">{description}</p>
    </button>
  );
}

function RecentActivity({ today }: { today: string }) {
  const studentRecords = getAttendance().filter(r => r.date === today).slice(-5).reverse();
  const teacherRecords = getTeacherAttendance().filter(r => r.date === today).slice(-5).reverse();
  const allRecords = [
    ...studentRecords.map(r => ({ ...r, isTeacher: false })),
    ...teacherRecords.map(r => ({ ...r, isTeacher: true, studentName: r.teacherName, className: r.subject })),
  ].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 10);

  if (allRecords.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Clock size={40} className="mx-auto mb-3 opacity-30" />
        <p>Belum ada aktivitas absensi hari ini</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {allRecords.map((r: any) => (
        <div key={r.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-800/50">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${r.isTeacher ? 'bg-purple-500' : 'bg-emerald-500'}`} />
            <div>
              <p className="text-sm text-white">{r.studentName}</p>
              <p className="text-xs text-gray-500">{r.className} {r.isTeacher ? '• Guru' : ''}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-300">{r.time}</p>
            <span className={`text-xs font-medium ${r.type === 'masuk' ? 'text-emerald-400' : 'text-blue-400'}`}>
              {r.type === 'masuk' ? '↓ Masuk' : '↑ Pulang'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
