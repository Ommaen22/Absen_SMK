import { useState } from 'react';
import { getAllData, importAllData, clearAllData, getStudents, getTeachers, getAttendance, getTeacherAttendance, getNotifications } from '../store';
import { AppData } from '../types';
import { Database, Download, Upload, FileJson, FileSpreadsheet, Trash2, AlertTriangle, HardDrive, MessageCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function DataManager() {
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const students = getStudents();
  const teachers = getTeachers();
  const attendance = getAttendance();
  const teacherAttendance = getTeacherAttendance();
  const notifications = getNotifications();

  const exportJSON = () => {
    const data = getAllData();
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `sihadir_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  };

  const exportExcel = () => {
    const data = getAllData();
    const wb = XLSX.utils.book_new();

    // Students
    const studentsData = data.students.map(s => ({
      'NIS': s.nis, 'Nama': s.name, 'Kelas': s.className,
      'Gender': s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      'Telepon': s.phone || '', 'Alamat': s.address || '',
      'No WA Ortu': s.parentPhone || '', 'Nama Ortu': s.parentName || '',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(studentsData), 'Data Siswa');

    // Teachers
    const teachersData = data.teachers.map(t => ({
      'NIP': t.nip, 'Nama': t.name, 'Mapel': t.subject,
      'Jabatan': t.position, 'Gender': t.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      'Telepon': t.phone || '', 'Email': t.email || '',
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teachersData), 'Data Guru');

    // Student Attendance
    const attendanceData = data.attendance.map(a => ({
      'Tanggal': a.date, 'Waktu': a.time, 'NIS': a.studentId,
      'Nama': a.studentName, 'Kelas': a.className,
      'Status': a.status, 'Tipe': a.type, 'Metode': a.method,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(attendanceData), 'Absensi Siswa');

    // Teacher Attendance
    const teacherAttData = data.teacherAttendance.map(a => ({
      'Tanggal': a.date, 'Waktu': a.time, 'NIP': a.teacherId,
      'Nama': a.teacherName, 'Mapel': a.subject,
      'Status': a.status, 'Tipe': a.type, 'Metode': a.method,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teacherAttData), 'Absensi Guru');

    XLSX.writeFile(wb, `sihadir_full_backup_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportAttendanceCSV = () => {
    const data = getAttendance();
    const csvData = data.map(a => ({
      'Tanggal': a.date, 'Waktu': a.time, 'NIS': a.studentId,
      'Nama': a.studentName, 'Kelas': a.className,
      'Status': a.status, 'Tipe': a.type, 'Metode': a.method,
    }));
    const ws = XLSX.utils.json_to_sheet(csvData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    downloadFile(csv, `absensi_siswa_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const exportStudentsCSV = () => {
    const data = getStudents();
    const csvData = data.map(s => ({
      NIS: s.nis, Nama: s.name, Kelas: s.className, Gender: s.gender,
      'No WA Ortu': s.parentPhone || '', 'Nama Ortu': s.parentName || '',
    }));
    const ws = XLSX.utils.json_to_sheet(csvData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    downloadFile(csv, `data_siswa_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const exportTeacherCSV = () => {
    const data = getTeachers();
    const csvData = data.map(t => ({
      NIP: t.nip, Nama: t.name, Mapel: t.subject, Jabatan: t.position, Gender: t.gender,
    }));
    const ws = XLSX.utils.json_to_sheet(csvData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    downloadFile(csv, `data_guru_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string) as AppData;
        if (data.students || data.attendance || data.settings) {
          const msg = `Import data?\n- Siswa: ${data.students?.length || 0}\n- Guru: ${data.teachers?.length || 0}\n- Absensi Siswa: ${data.attendance?.length || 0}\n- Absensi Guru: ${data.teacherAttendance?.length || 0}`;
          if (confirm(msg + '\n\nData lama akan ditimpa!')) {
            importAllData(data);
            setImportStatus({ type: 'success', text: 'Data berhasil diimport!' });
          }
        } else {
          setImportStatus({ type: 'error', text: 'Format file tidak valid!' });
        }
      } catch (err) { setImportStatus({ type: 'error', text: 'Gagal membaca file JSON!' }); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const importExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const wb = XLSX.read(data, { type: 'binary' });
        if (wb.SheetNames.length > 0) {
          const ws = wb.Sheets[wb.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(ws) as any[];
          if (jsonData.length > 0 && confirm(`Import ${jsonData.length} baris data?`)) {
            setImportStatus({ type: 'success', text: `Berhasil membaca ${jsonData.length} baris data!` });
          }
        }
      } catch (err) { setImportStatus({ type: 'error', text: 'Gagal membaca file!' }); }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleClearAll = () => {
    if (confirm('PERINGATAN: Semua data akan dihapus permanen!')) {
      if (confirm('Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan!')) {
        clearAllData();
        setImportStatus({ type: 'success', text: 'Semua data telah dihapus!' });
      }
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  const totalSize = (new Blob([JSON.stringify(getAllData())]).size / 1024).toFixed(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Database className="text-cyan-400" />
          Import / Export Data
        </h1>
        <p className="text-gray-400 mt-1">Kelola backup dan restore data aplikasi</p>
      </div>

      {importStatus && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${
          importStatus.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
          'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>{importStatus.text}</div>
      )}

      {/* Data Summary */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <HardDrive size={20} className="text-cyan-400" /> Ringkasan Data
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Siswa</p>
            <p className="text-2xl font-bold text-white mt-1">{students.length}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Guru</p>
            <p className="text-2xl font-bold text-purple-400 mt-1">{teachers.length}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Absen Siswa</p>
            <p className="text-2xl font-bold text-emerald-400 mt-1">{attendance.length}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Absen Guru</p>
            <p className="text-2xl font-bold text-indigo-400 mt-1">{teacherAttendance.length}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Notif WA</p>
            <p className="text-2xl font-bold text-green-400 mt-1">{notifications.length}</p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4">Total ukuran data: {totalSize} KB</p>
      </div>

      {/* Export */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Download size={20} className="text-emerald-400" /> Export Data
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button onClick={exportJSON}
            className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-emerald-500/50 rounded-xl p-5 text-left transition-all">
            <FileJson size={28} className="text-emerald-400 mb-3" />
            <p className="text-white font-semibold">Full Backup (JSON)</p>
            <p className="text-sm text-gray-400 mt-1">Semua data termasuk pengaturan</p>
          </button>
          <button onClick={exportExcel}
            className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-500/50 rounded-xl p-5 text-left transition-all">
            <FileSpreadsheet size={28} className="text-blue-400 mb-3" />
            <p className="text-white font-semibold">Full Backup (Excel)</p>
            <p className="text-sm text-gray-400 mt-1">Multi-sheet: Siswa, Guru, Absensi</p>
          </button>
          <button onClick={exportStudentsCSV}
            className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-purple-500/50 rounded-xl p-5 text-left transition-all">
            <Download size={28} className="text-purple-400 mb-3" />
            <p className="text-white font-semibold">Data Siswa (CSV)</p>
            <p className="text-sm text-gray-400 mt-1">Termasuk no. WA orang tua</p>
          </button>
          <button onClick={exportTeacherCSV}
            className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-indigo-500/50 rounded-xl p-5 text-left transition-all">
            <Download size={28} className="text-indigo-400 mb-3" />
            <p className="text-white font-semibold">Data Guru (CSV)</p>
            <p className="text-sm text-gray-400 mt-1">Export data guru saja</p>
          </button>
          <button onClick={exportAttendanceCSV}
            className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-yellow-500/50 rounded-xl p-5 text-left transition-all">
            <Download size={28} className="text-yellow-400 mb-3" />
            <p className="text-white font-semibold">Absensi Siswa (CSV)</p>
            <p className="text-sm text-gray-400 mt-1">Data absen masuk & pulang</p>
          </button>
        </div>
      </div>

      {/* Import */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Upload size={20} className="text-blue-400" /> Import Data
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-emerald-500/50 rounded-xl p-5 text-left transition-all cursor-pointer">
            <FileJson size={28} className="text-emerald-400 mb-3" />
            <p className="text-white font-semibold">Import JSON Backup</p>
            <p className="text-sm text-gray-400 mt-1">Restore semua data dari backup</p>
            <input type="file" accept=".json" onChange={importJSON} className="hidden" />
          </label>
          <label className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-500/50 rounded-xl p-5 text-left transition-all cursor-pointer">
            <FileSpreadsheet size={28} className="text-blue-400 mb-3" />
            <p className="text-white font-semibold">Import Excel/CSV</p>
            <p className="text-sm text-gray-400 mt-1">Import dari file Excel atau CSV</p>
            <input type="file" accept=".xlsx,.xls,.csv" onChange={importExcel} className="hidden" />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-gray-900 rounded-2xl border border-red-500/30 p-6">
        <h3 className="text-red-400 font-semibold mb-4 flex items-center gap-2">
          <AlertTriangle size={20} /> Zona Berbahaya
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          Tindakan ini akan menghapus SEMUA data termasuk data siswa, guru, absensi, dan notifikasi.
        </p>
        <button onClick={handleClearAll}
          className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all">
          <Trash2 size={18} /> Hapus Semua Data
        </button>
      </div>
    </div>
  );
}
