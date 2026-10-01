import { useState, useEffect } from 'react';
import { getAttendance, getStudents } from '../store';
import { AttendanceRecord } from '../types';
import { CalendarDays, Download, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export default function MonthlyRecap() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [className, setClassName] = useState('');
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [classes, setClasses] = useState<string[]>([]);

  useEffect(() => {
    const students = getStudents();
    const cls = [...new Set(students.map(s => s.className))].sort();
    setClasses(cls);
  }, []);

  useEffect(() => {
    loadRecords();
  }, [year, month, className]);

  const loadRecords = () => {
    const allRecords = getAttendance();
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    let filtered = allRecords.filter(r => r.date.startsWith(monthStr));
    if (className) {
      filtered = filtered.filter(r => r.className === className);
    }
    setRecords(filtered);
  };

  // Group by student
  const studentMap = new Map<string, { name: string; className: string; hadir: number; izin: number; sakit: number; alpha: number }>();
  records.forEach(r => {
    const existing = studentMap.get(r.studentId);
    if (existing) {
      existing[r.status]++;
    } else {
      studentMap.set(r.studentId, {
        name: r.studentName,
        className: r.className,
        hadir: r.status === 'hadir' ? 1 : 0,
        izin: r.status === 'izin' ? 1 : 0,
        sakit: r.status === 'sakit' ? 1 : 0,
        alpha: r.status === 'alpha' ? 1 : 0,
      });
    }
  });

  const summary = Array.from(studentMap.entries()).map(([id, data]) => ({
    id,
    ...data,
    total: data.hadir + data.izin + data.sakit + data.alpha,
  })).sort((a, b) => a.name.localeCompare(b.name));

  const totalHadir = summary.reduce((s, r) => s + r.hadir, 0);
  const totalIzin = summary.reduce((s, r) => s + r.izin, 0);
  const totalSakit = summary.reduce((s, r) => s + r.sakit, 0);
  const totalAlpha = summary.reduce((s, r) => s + r.alpha, 0);

  const exportExcel = () => {
    const data = summary.map(s => ({
      'Nama': s.name,
      'Kelas': s.className,
      'Hadir': s.hadir,
      'Izin': s.izin,
      'Sakit': s.sakit,
      'Alpha': s.alpha,
      'Total': s.total,
      'Persentase Hadir': s.total > 0 ? `${((s.hadir / s.total) * 100).toFixed(1)}%` : '0%',
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Rekap ${MONTHS[month - 1]} ${year}`);
    XLSX.writeFile(wb, `rekap_bulanan_${MONTHS[month - 1]}_${year}.xlsx`);
  };

  const exportCSV = () => {
    const data = summary.map(s => ({
      Nama: s.name,
      Kelas: s.className,
      Hadir: s.hadir,
      Izin: s.izin,
      Sakit: s.sakit,
      Alpha: s.alpha,
      Total: s.total,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rekap_bulanan_${MONTHS[month - 1]}_${year}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <CalendarDays className="text-blue-400" />
          Rekap Bulanan
        </h1>
        <p className="text-gray-400 mt-1">Laporan kehadiran siswa per bulan</p>
      </div>

      {/* Filters */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <Filter size={16} className="text-gray-400" />
          <select
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none"
          >
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
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
          <div className="md:ml-auto flex gap-2">
            <button onClick={exportExcel} className="bg-blue-500/20 text-blue-400 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-500/30 transition-all">
              <Download size={16} /> Excel
            </button>
            <button onClick={exportCSV} className="bg-purple-500/20 text-purple-400 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-purple-500/30 transition-all">
              <Download size={16} /> CSV
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{totalHadir}</p>
          <p className="text-xs text-emerald-400/70">Total Hadir</p>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{totalIzin}</p>
          <p className="text-xs text-yellow-400/70">Total Izin</p>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-orange-400">{totalSakit}</p>
          <p className="text-xs text-orange-400/70">Total Sakit</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{totalAlpha}</p>
          <p className="text-xs text-red-400/70">Total Alpha</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-white font-semibold">Rekap {MONTHS[month - 1]} {year}</h3>
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
              {summary.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">
                    Tidak ada data absensi untuk periode ini
                  </td>
                </tr>
              ) : (
                summary.map((s, i) => (
                  <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 text-sm text-white">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{s.className}</td>
                    <td className="px-4 py-3 text-sm text-center text-emerald-400 font-semibold">{s.hadir}</td>
                    <td className="px-4 py-3 text-sm text-center text-yellow-400">{s.izin}</td>
                    <td className="px-4 py-3 text-sm text-center text-orange-400">{s.sakit}</td>
                    <td className="px-4 py-3 text-sm text-center text-red-400">{s.alpha}</td>
                    <td className="px-4 py-3 text-sm text-center">
                      <span className={`font-semibold ${
                        s.total > 0 && (s.hadir / s.total) >= 0.75 ? 'text-emerald-400' :
                        s.total > 0 && (s.hadir / s.total) >= 0.5 ? 'text-yellow-400' : 'text-red-400'
                      }`}>
                        {s.total > 0 ? `${((s.hadir / s.total) * 100).toFixed(0)}%` : '-'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
