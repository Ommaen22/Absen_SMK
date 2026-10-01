import { useState, useEffect } from 'react';
import { getTeacherAttendance } from '../store';
import { TeacherAttendanceRecord } from '../types';
import { GraduationCap, Download, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';

const MONTHS = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

export default function TeacherMonthlyRecap() {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [records, setRecords] = useState<TeacherAttendanceRecord[]>([]);

  useEffect(() => { loadRecords(); }, [year, month]);

  const loadRecords = () => {
    const allRecords = getTeacherAttendance();
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    setRecords(allRecords.filter(r => r.date.startsWith(monthStr)));
  };

  const teacherMap = new Map<string, { name: string; subject: string; hadir: number; izin: number; sakit: number; alpha: number; tugas: number }>();
  records.forEach(r => {
    const existing = teacherMap.get(r.teacherId);
    if (existing) {
      if (r.status === 'hadir') existing.hadir++;
      else if (r.status === 'izin') existing.izin++;
      else if (r.status === 'sakit') existing.sakit++;
      else if (r.status === 'alpha') existing.alpha++;
      else if (r.status === 'tugas') existing.tugas++;
    } else {
      teacherMap.set(r.teacherId, {
        name: r.teacherName, subject: r.subject,
        hadir: r.status === 'hadir' ? 1 : 0, izin: r.status === 'izin' ? 1 : 0,
        sakit: r.status === 'sakit' ? 1 : 0, alpha: r.status === 'alpha' ? 1 : 0,
        tugas: r.status === 'tugas' ? 1 : 0,
      });
    }
  });

  const summary = Array.from(teacherMap.entries()).map(([id, data]) => ({
    id, ...data, total: data.hadir + data.izin + data.sakit + data.alpha + data.tugas,
  })).sort((a, b) => a.name.localeCompare(b.name));

  const exportExcel = () => {
    const data = summary.map(s => ({
      'Nama': s.name, 'Mata Pelajaran': s.subject,
      'Hadir': s.hadir, 'Izin': s.izin, 'Sakit': s.sakit, 'Alpha': s.alpha, 'Tugas Luar': s.tugas, 'Total': s.total,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, `Rekap Guru ${MONTHS[month - 1]} ${year}`);
    XLSX.writeFile(wb, `rekap_guru_${MONTHS[month - 1]}_${year}.xlsx`);
  };

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - 5 + i);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <GraduationCap className="text-purple-400" />
          Rekap Bulanan Guru
        </h1>
        <p className="text-gray-400 mt-1">Laporan kehadiran guru per bulan</p>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <Filter size={16} className="text-gray-400" />
          <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none">
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none">
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={exportExcel} className="md:ml-auto bg-blue-500/20 text-blue-400 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-500/30">
            <Download size={16} /> Export Excel
          </button>
        </div>
      </div>

      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800">
          <h3 className="text-white font-semibold">Rekap Guru - {MONTHS[month - 1]} {year}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">No</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Nama</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Mapel</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-purple-400">H</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-yellow-400">I</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-orange-400">S</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-red-400">A</th>
                <th className="text-center px-4 py-3 text-sm font-medium text-blue-400">TL</th>
              </tr>
            </thead>
            <tbody>
              {summary.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-500">Tidak ada data</td></tr>
              ) : (
                summary.map((s, i) => (
                  <tr key={s.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-sm text-gray-400">{i + 1}</td>
                    <td className="px-4 py-3 text-sm text-white">{s.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{s.subject}</td>
                    <td className="px-4 py-3 text-sm text-center text-purple-400 font-semibold">{s.hadir}</td>
                    <td className="px-4 py-3 text-sm text-center text-yellow-400">{s.izin}</td>
                    <td className="px-4 py-3 text-sm text-center text-orange-400">{s.sakit}</td>
                    <td className="px-4 py-3 text-sm text-center text-red-400">{s.alpha}</td>
                    <td className="px-4 py-3 text-sm text-center text-blue-400">{s.tugas}</td>
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
