import { useState } from 'react';
import { getAllData, importAllData, clearAllData, getStudents, getAttendance } from '../store';
import { AppData } from '../types';
import { Database, Download, Upload, FileJson, FileSpreadsheet, Trash2, AlertTriangle, HardDrive } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function DataManager() {
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const students = getStudents();
  const attendance = getAttendance();

  // Export all data as JSON
  const exportJSON = () => {
    const data = getAllData();
    const json = JSON.stringify(data, null, 2);
    downloadFile(json, `sihadir_backup_${new Date().toISOString().split('T')[0]}.json`, 'application/json');
  };

  // Export all data as Excel
  const exportExcel = () => {
    const data = getAllData();
    const wb = XLSX.utils.book_new();

    // Students sheet
    const studentsData = data.students.map(s => ({
      'ID': s.id,
      'NIS': s.nis,
      'Nama': s.name,
      'Kelas': s.className,
      'Gender': s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      'Telepon': s.phone || '',
      'Alamat': s.address || '',
      'Dibuat': s.createdAt,
    }));
    const ws1 = XLSX.utils.json_to_sheet(studentsData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Data Siswa');

    // Attendance sheet
    const attendanceData = data.attendance.map(a => ({
      'ID': a.id,
      'Student ID': a.studentId,
      'Nama Siswa': a.studentName,
      'Kelas': a.className,
      'Tanggal': a.date,
      'Waktu': a.time,
      'Status': a.status,
      'Metode': a.method,
    }));
    const ws2 = XLSX.utils.json_to_sheet(attendanceData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Data Absensi');

    // Settings sheet
    const settingsData = [{
      'Nama Sekolah': data.settings.schoolName,
      'Alamat': data.settings.schoolAddress,
      'Suara Scan': data.settings.scanSound ? 'Ya' : 'Tidak',
      'Auto Tanggal': data.settings.autoDate ? 'Ya' : 'Tidak',
    }];
    const ws3 = XLSX.utils.json_to_sheet(settingsData);
    XLSX.utils.book_append_sheet(wb, ws3, 'Pengaturan');

    XLSX.writeFile(wb, `sihadir_full_backup_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Export attendance only as CSV
  const exportAttendanceCSV = () => {
    const data = getAttendance();
    const csvData = data.map(a => ({
      'Tanggal': a.date,
      'Waktu': a.time,
      'NIS': a.studentId,
      'Nama': a.studentName,
      'Kelas': a.className,
      'Status': a.status,
      'Metode': a.method,
    }));
    const ws = XLSX.utils.json_to_sheet(csvData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    downloadFile(csv, `data_absensi_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  // Export students only as CSV
  const exportStudentsCSV = () => {
    const data = getStudents();
    const csvData = data.map(s => ({
      'NIS': s.nis,
      'Nama': s.name,
      'Kelas': s.className,
      'Gender': s.gender,
      'Telepon': s.phone || '',
      'Alamat': s.address || '',
    }));
    const ws = XLSX.utils.json_to_sheet(csvData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    downloadFile(csv, `data_siswa_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  };

  // Import JSON backup
  const importJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string) as AppData;
        if (data.students || data.attendance || data.settings) {
          if (confirm(`Import data?\n- Siswa: ${data.students?.length || 0}\n- Absensi: ${data.attendance?.length || 0}\n\nData lama akan ditimpa!`)) {
            importAllData(data);
            setImportStatus({ type: 'success', text: 'Data berhasil diimport!' });
          }
        } else {
          setImportStatus({ type: 'error', text: 'Format file tidak valid!' });
        }
      } catch (err) {
        setImportStatus({ type: 'error', text: 'Gagal membaca file JSON!' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Import Excel
  const importExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const wb = XLSX.read(data, { type: 'binary' });

        // Try to import students from first sheet
        if (wb.SheetNames.length > 0) {
          const ws = wb.Sheets[wb.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(ws) as any[];

          if (jsonData.length > 0) {
            if (confirm(`Import ${jsonData.length} baris data dari file Excel?`)) {
              setImportStatus({ type: 'success', text: `Berhasil membaca ${jsonData.length} baris data!` });
            }
          }
        }
      } catch (err) {
        setImportStatus({ type: 'error', text: 'Gagal membaca file Excel!' });
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // Clear all data
  const handleClearAll = () => {
    if (confirm('PERINGATAN: Semua data akan dihapus permanen! Lanjutkan?')) {
      if (confirm('Apakah Anda yakin? Tindakan ini tidak dapat dibatalkan!')) {
        clearAllData();
        setImportStatus({ type: 'success', text: 'Semua data telah dihapus!' });
      }
    }
  };

  const downloadFile = (content: string, filename: string, type: string) => {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Database className="text-cyan-400" />
          Import / Export Data
        </h1>
        <p className="text-gray-400 mt-1">Kelola backup dan restore data aplikasi</p>
      </div>

      {/* Status */}
      {importStatus && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${
          importStatus.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
          'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>
          {importStatus.text}
        </div>
      )}

      {/* Data Summary */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <HardDrive size={20} className="text-cyan-400" />
          Ringkasan Data
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Data Siswa</p>
            <p className="text-2xl font-bold text-white mt-1">{students.length}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Data Absensi</p>
            <p className="text-2xl font-bold text-white mt-1">{attendance.length}</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <p className="text-sm text-gray-400">Penyimpanan</p>
            <p className="text-2xl font-bold text-white mt-1">
              {(new Blob([JSON.stringify(getAllData())]).size / 1024).toFixed(1)} KB
            </p>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Download size={20} className="text-emerald-400" />
          Export Data
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={exportJSON}
            className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-emerald-500/50 rounded-xl p-5 text-left transition-all group"
          >
            <FileJson size={28} className="text-emerald-400 mb-3" />
            <p className="text-white font-semibold">Full Backup (JSON)</p>
            <p className="text-sm text-gray-400 mt-1">Semua data dalam format JSON</p>
          </button>
          <button
            onClick={exportExcel}
            className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-500/50 rounded-xl p-5 text-left transition-all group"
          >
            <FileSpreadsheet size={28} className="text-blue-400 mb-3" />
            <p className="text-white font-semibold">Full Backup (Excel)</p>
            <p className="text-sm text-gray-400 mt-1">Semua data dalam format XLSX</p>
          </button>
          <button
            onClick={exportStudentsCSV}
            className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-purple-500/50 rounded-xl p-5 text-left transition-all group"
          >
            <Download size={28} className="text-purple-400 mb-3" />
            <p className="text-white font-semibold">Data Siswa (CSV)</p>
            <p className="text-sm text-gray-400 mt-1">Export data siswa saja</p>
          </button>
          <button
            onClick={exportAttendanceCSV}
            className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-yellow-500/50 rounded-xl p-5 text-left transition-all group"
          >
            <Download size={28} className="text-yellow-400 mb-3" />
            <p className="text-white font-semibold">Data Absensi (CSV)</p>
            <p className="text-sm text-gray-400 mt-1">Export data absensi saja</p>
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Upload size={20} className="text-blue-400" />
          Import Data
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-emerald-500/50 rounded-xl p-5 text-left transition-all cursor-pointer group">
            <FileJson size={28} className="text-emerald-400 mb-3" />
            <p className="text-white font-semibold">Import JSON Backup</p>
            <p className="text-sm text-gray-400 mt-1">Restore dari file backup JSON</p>
            <input type="file" accept=".json" onChange={importJSON} className="hidden" />
          </label>
          <label className="bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-blue-500/50 rounded-xl p-5 text-left transition-all cursor-pointer group">
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
          <AlertTriangle size={20} />
          Zona Berbahaya
        </h3>
        <p className="text-gray-400 text-sm mb-4">
          Tindakan di bawah ini akan menghapus data secara permanen dan tidak dapat dikembalikan.
          Pastikan Anda sudah membuat backup sebelum melanjutkan.
        </p>
        <button
          onClick={handleClearAll}
          className="bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all"
        >
          <Trash2 size={18} />
          Hapus Semua Data
        </button>
      </div>
    </div>
  );
}
