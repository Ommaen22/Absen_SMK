import { useState, useEffect } from 'react';
import { Student } from '../types';
import { getStudents, saveStudents, addStudent, updateStudent, deleteStudent, generateId } from '../store';
import { Users, Plus, Edit2, Trash2, Search, Download, Upload, X, UserPlus, MessageCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function StudentManager() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [form, setForm] = useState({ nis: '', name: '', className: '', gender: 'L' as 'L' | 'P', phone: '', address: '', parentPhone: '', parentName: '' });
  const [filterClass, setFilterClass] = useState('');

  useEffect(() => { loadStudents(); }, []);

  const loadStudents = () => setStudents(getStudents());

  const classes = [...new Set(students.map(s => s.className))].sort();

  const filtered = students.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.nis.toLowerCase().includes(search.toLowerCase());
    const matchClass = !filterClass || s.className === filterClass;
    return matchSearch && matchClass;
  });

  const handleSubmit = () => {
    if (!form.nis || !form.name || !form.className) {
      alert('NIS, Nama, dan Kelas wajib diisi!');
      return;
    }
    if (editStudent) {
      updateStudent({ ...editStudent, ...form });
    } else {
      if (students.find(s => s.nis === form.nis)) { alert('NIS sudah terdaftar!'); return; }
      addStudent({ id: generateId(), ...form, createdAt: new Date().toISOString() });
    }
    resetForm();
    loadStudents();
  };

  const handleEdit = (student: Student) => {
    setEditStudent(student);
    setForm({
      nis: student.nis, name: student.name, className: student.className,
      gender: student.gender, phone: student.phone || '', address: student.address || '',
      parentPhone: student.parentPhone || '', parentName: student.parentName || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus siswa ini?')) { deleteStudent(id); loadStudents(); }
  };

  const resetForm = () => {
    setForm({ nis: '', name: '', className: '', gender: 'L', phone: '', address: '', parentPhone: '', parentName: '' });
    setEditStudent(null);
    setShowForm(false);
  };

  const exportExcel = () => {
    const data = students.map(s => ({
      'NIS': s.nis, 'Nama': s.name, 'Kelas': s.className,
      'Gender': s.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      'Telepon': s.phone || '', 'Alamat': s.address || '',
      'No. WA Orang Tua': s.parentPhone || '', 'Nama Orang Tua': s.parentName || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Siswa');
    XLSX.writeFile(wb, 'data_siswa.xlsx');
  };

  const exportCSV = () => {
    const data = students.map(s => ({
      NIS: s.nis, Nama: s.name, Kelas: s.className, Gender: s.gender,
      Telepon: s.phone || '', Alamat: s.address || '',
      'No WA Ortu': s.parentPhone || '', 'Nama Ortu': s.parentName || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'data_siswa.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const importFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = evt.target?.result;
        const wb = XLSX.read(data, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(ws) as any[];
        const imported: Student[] = jsonData.map((row) => ({
          id: generateId(),
          nis: String(row['NIS'] || row['nis'] || ''),
          name: String(row['Nama'] || row['nama'] || row['Name'] || ''),
          className: String(row['Kelas'] || row['kelas'] || row['Class'] || ''),
          gender: (String(row['Gender'] || row['gender'] || 'L') === 'P' ? 'P' : 'L') as 'L' | 'P',
          phone: String(row['Telepon'] || row['telepon'] || row['Phone'] || ''),
          address: String(row['Alamat'] || row['alamat'] || row['Address'] || ''),
          parentPhone: String(row['No. WA Orang Tua'] || row['No WA Ortu'] || row['parentPhone'] || ''),
          parentName: String(row['Nama Orang Tua'] || row['Nama Ortu'] || row['parentName'] || ''),
          createdAt: new Date().toISOString(),
        })).filter(s => s.nis && s.name && s.className);

        if (imported.length === 0) { alert('Tidak ada data valid!'); return; }
        if (confirm(`Import ${imported.length} data siswa?`)) {
          const existing = getStudents();
          const newStudents = imported.filter(s => !existing.find(e => e.nis === s.nis));
          saveStudents([...existing, ...newStudents]);
          loadStudents();
          alert(`Berhasil import ${newStudents.length} siswa baru!`);
        }
      } catch (err) { alert('Gagal membaca file!'); }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Users className="text-blue-400" />
            Data Siswa
          </h1>
          <p className="text-gray-400 mt-1">Kelola data siswa untuk absensi & notifikasi WhatsApp</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all">
          <UserPlus size={20} /> Tambah Siswa
        </button>
      </div>

      {/* Actions */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Cari nama atau NIS..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none" />
          </div>
          <select value={filterClass} onChange={(e) => setFilterClass(e.target.value)}
            className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none">
            <option value="">Semua Kelas</option>
            {classes.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="flex gap-2">
            <button onClick={exportExcel} className="bg-blue-500/20 text-blue-400 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-500/30">
              <Download size={16} /> Excel
            </button>
            <button onClick={exportCSV} className="bg-purple-500/20 text-purple-400 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-purple-500/30">
              <Download size={16} /> CSV
            </button>
            <label className="bg-yellow-500/20 text-yellow-400 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-yellow-500/30 cursor-pointer">
              <Upload size={16} /> Import
              <input type="file" accept=".xlsx,.xls,.csv" onChange={importFile} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">{editStudent ? 'Edit Siswa' : 'Tambah Siswa'}</h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">NIS (Barcode) *</label>
                <input type="text" value={form.nis} onChange={(e) => setForm({ ...form, nis: e.target.value })}
                  placeholder="Contoh: 2024001"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Nama Lengkap *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama siswa"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Kelas *</label>
                <input type="text" value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })}
                  placeholder="Contoh: X IPA 1"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as 'L' | 'P' })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-emerald-500 focus:outline-none">
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Telepon Siswa</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Nomor telepon"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Alamat</label>
                <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Alamat"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none" />
              </div>

              {/* Parent Info */}
              <div className="border-t border-gray-700 pt-4">
                <p className="text-sm text-green-400 font-medium mb-3 flex items-center gap-2">
                  <MessageCircle size={16} /> Data Orang Tua (untuk Notifikasi WA)
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Nama Orang Tua</label>
                    <input type="text" value={form.parentName} onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                      placeholder="Nama ayah/ibu"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">No. WhatsApp Orang Tua</label>
                    <input type="text" value={form.parentPhone} onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                      placeholder="628xxxxxxxxxx"
                      className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none" />
                    <p className="text-xs text-gray-500 mt-1">Format: 62xxx (tanpa + atau 0 di depan)</p>
                  </div>
                </div>
              </div>

              <button onClick={handleSubmit}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-semibold transition-all">
                {editStudent ? 'Update' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">NIS</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Nama</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Kelas</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">WA Ortu</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">
                  {students.length === 0 ? 'Belum ada data siswa' : 'Tidak ada hasil pencarian'}
                </td></tr>
              ) : (
                filtered.map((student) => (
                  <tr key={student.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-sm text-emerald-400 font-mono">{student.nis}</td>
                    <td className="px-4 py-3 text-sm text-white">{student.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{student.className}</td>
                    <td className="px-4 py-3">
                      {student.parentPhone ? (
                        <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 flex items-center gap-1">
                          <MessageCircle size={12} /> {student.parentPhone}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-600">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(student)} className="text-blue-400 hover:text-blue-300 p-1"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(student.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-800 text-sm text-gray-500">
          Menampilkan {filtered.length} dari {students.length} siswa | {students.filter(s => s.parentPhone).length} punya no. WA ortu
        </div>
      </div>
    </div>
  );
}
