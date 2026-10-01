import { useState, useEffect } from 'react';
import { getAttendance } from '../store';
import { AttendanceRecord } from '../types';
import { CalendarRange, Download, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
  'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'
];

export default function YearlyRecap() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [className, setClassName] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'student' | 'monthly'>('student');

  useEffect(() => {
    const students = getAttendance();
    const cls = [...new Set(students.map(s => s.className))].sort();
    setClasses(cls);
  }, []);

  useEffect(() => {
    loadRecords();
  }, [year, className]);

  const loadRecords = () => {
    const allRecords = getAttendance();
    const yearStr = `${year}`;
    let filtered = allRecords.filter(r => r.date.startsWith(yearStr));
    if (className) {
      filtered = filtered.filter(r => r.className === className);
    }
    setRecords(filtered);
  };

  // Student view
  const studentMap = new Map<string, {
    name: string; className: string;
    months: { hadir: number; izin: number; sakit: number; alpha: number }[];
  }>();

  records.forEach(r => {
    const monthIdx = parseInt(r.date.split('-')[1]) - 1;
    const existing = studentMap.get(r.studentId);
    if (existing) {
      existing.months[monthIdx][r.status]++;
    } else {
      const months = Array.from({ length: 12 }, () => ({ hadir: 0, izin: 0, sakit: 0, alpha: 0 }));
      months[monthIdx][r.status]++;
      studentMap.set(r.studentId, { name: r.studentName, className: r.className, months });
    }
  });

  const studentSummary = Array.from(studentMap.entries()).map(([id, data]) => {
    const totalHadir = data.months.reduce((s, m) => s + m.hadir, 0);
    const totalIzin = data.months.reduce((s, m) => s + m.izin, 0);
    const totalSakit = data.months.reduce((s, m) => s + m.sakit, 0);
    const totalAlpha = data.months.reduce((s, m) => s + m.alpha, 0);
    const total = totalHadir + totalIzin + totalSakit + totalAlpha;
    return {
      id, ...data,
      totalHadir, totalIzin, totalSakit, totalAlpha, total,
      percentage: total > 0 ? ((totalHadir / total) * 100).toFixed(1) : '0',
    };
  }).sort((a, b) => a.name.localeCompare(b.name));

  // Monthly view
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const monthRecords = records.filter(r => parseInt(r.date.split('-')[1]) - 1 === i);
    return {
      month: MONTHS[i],
      hadir: monthRecords.filter(r => r.status === 'hadir').length,
      izin: monthRecords.filter(r => r.status === 'izin').length,
      sakit: monthRecords.filter(r => r.status === 'sakit').length,
      alpha: monthRecords.filter(r => r.status === 'alpha').length,
      total: monthRecords.length,
    };
  });

  const exportExcel = () => {
    const data = studentSummary.map(s => ({
      'Nama': s.name,
      'Kelas': s.className,
      'Total Hadir': s.totalHadir,
      'Total Izin': s.totalIzin,
      'Total Sakit': s.totalSakit,
      'Total Alpha': s.totalAlpha,
      'Total Keseluruhan': s.total,
      'Persentase Kehadiran': `${s.percentage}%`,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Rekap Tahunan ${year}`);

    // Add monthly sheet
    const monthlySheet = monthlyData.map(m => ({
      'Bulan': m.month,
      'Hadir': m.hadir,
      'Izin': m.izin,
      'Sakit': m.sakit,
      'Alpha': m.alpha,
      'Total': m.total,
    }));
    const ws2 = XLSX.utils.json_to_sheet(monthlySheet);
    XLSX.utils.book_append_sheet(wb, ws2, 'Per Bulan');

    XLSX.writeFile(wb, `rekap_tahunan_${year}.xlsx`);
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <CalendarRange className="text-purple-400" />
          Rekap Tahunan
        </h1>
        <p className="text-gray-400 mt-1">Laporan kehadiran siswa per tahun</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <Filter size={16} className="text-gray-400" />
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="">Semua Kelas</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex bg-gray-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setViewMode('student')}
              className={`px-4 py-2.5 text-sm font-medium transition-all ${viewMode === 'student' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}
            >
              Per Siswa
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2.5 text-sm font-medium transition-all ${viewMode === 'monthly' ? 'bg-emerald-500 text-white' : 'text-gray-400'}`}
            >
              Per Bulan
            </button>
          </div>
          <button onClick={exportExcel} className="md:ml-auto bg-blue-500/20 text-blue-400 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-500/30 transition-all">
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>

      {viewMode === 'student' ? (
        <>
          {/* Year Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-emerald-400">{studentSummary.reduce((s, r) => s + r.totalHadir, 0)}</p>
              <p className="text-xs text-emerald-400/70">Total Hadir</p>
            </div>
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-yellow-400">{studentSummary.reduce((s, r) => s + r.totalIzin, 0)}</p>
              <p className="text-xs text-yellow-400/70">Total Izin</p>
            </div>
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-orange-400">{studentSummary.reduce((s, r) => s + r.totalSakit, 0)}</p>
              <p className="text-xs text-orange-400/70">Total Sakit</p>
            </div>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-red-400">{studentSummary.reduce((s, r) => s + r.totalAlpha, 0)}</p>
              <p className="text-xs text-red-400/70">Total Alpha</p>
            </div>
          </div>

          {/* Student Table */}
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-800">
              <h3 className="text-white font-semibold">Rekap Per Siswa - Tahun {year}</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">No</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Nama</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Kelas</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-emerald-400">H</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-yellow-400">I</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-orange-400">S</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-red-400">A</th>
                    <th className="text-center px-4 py-3 text-sm font-medium text-gray-400">%</th>
                  </tr>
                </thead>
                <tbody>
                  {studentSummary.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-gray-500">
                        Tidak ada data absensi untuk tahun ini
                      </td>
                    </tr>
                  ) : (
                    studentSummary.map((s, i) => (
                      <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                        <td className="px-4 py-3 text-sm text-white">{s.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{s.className}</td>
                        <td className="px-4 py-3 text-sm text-center text-emerald-400 font-semibold">{s.totalHadir}</td>
                        <td className="px-4 py-3 text-sm text-center text-yellow-400">{s.totalIzin}</td>
                        <td className="px-4 py-3 text-sm text-center text-orange-400">{s.totalSakit}</td>
                        <td className="px-4 py-3 text-sm text-center text-red-400">{s.totalAlpha}</td>
                        <td className="px-4 py-3 text-sm text-center">
                          <span className={`font-semibold ${
                            parseFloat(s.percentage) >= 75 ? 'text-emerald-400' :
                            parseFloat(s.percentage) >= 50 ? 'text-yellow-400' : 'text-red-400'
                          }`}>{s.percentage}%</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Monthly View */
        <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-800">
            <h3 className="text-white font-semibold">Rekap Per Bulan - Tahun {year}</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Bulan</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-emerald-400">Hadir</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-yellow-400">Izin</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-orange-400">Sakit</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-red-400">Alpha</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-400">Total</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((m, i) => (
                  <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-sm text-white font-medium">{m.month} {year}</td>
                    <td className="px-4 py-3 text-sm text-center text-emerald-400 font-semibold">{m.hadir}</td>
                    <td className="px-4 py-3 text-sm text-center text-yellow-400">{m.izin}</td>
                    <td className="px-4 py-3 text-sm text-center text-orange-400">{m.sakit}</td>
                    <td className="px-4 py-3 text-sm text-center text-red-400">{m.alpha}</td>
                    <td className="px-4 py-3 text-sm text-center text-gray-300">{m.total}</td>
                  </tr>
                ))}
                <tr className="bg-gray-800/50 font-semibold">
                  <td className="px-4 py-3 text-sm text-white">TOTAL</td>
                  <td className="px-4 py-3 text-sm text-center text-emerald-400">{monthlyData.reduce((s, m) => s + m.hadir, 0)}</td>
                  <td className="px-4 py-3 text-sm text-center text-yellow-400">{monthlyData.reduce((s, m) => s + m.izin, 0)}</td>
                  <td className="px-4 py-3 text-sm text-center text-orange-400">{monthlyData.reduce((s, m) => s + m.sakit, 0)}</td>
                  <td className="px-4 py-3 text-sm text-center text-red-400">{monthlyData.reduce((s, m) => s + m.alpha, 0)}</td>
                  <td className="px-4 py-3 text-sm text-center text-white">{monthlyData.reduce((s, m) => s + m.total, 0)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Visual Bar Chart */}
          <div className="p-6">
            <h4 className="text-sm text-gray-400 mb-4">Grafik Kehadiran Bulanan</h4>
            <div className="flex items-end gap-2 h-40">
              {monthlyData.map((m, i) => {
                const maxTotal = Math.max(...monthlyData.map(d => d.total), 1);
                const height = (m.total / maxTotal) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center" style={{ height: '120px' }}>
                      <div
                        className="w-full bg-emerald-500/30 rounded-t-lg transition-all"
                        style={{ height: `${height}%`, minHeight: m.total > 0 ? '4px' : '0' }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
