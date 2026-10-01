import { useState, useEffect } from 'react';
import { Teacher } from '../types';
import { getTeachers, saveTeachers, addTeacher, updateTeacher, deleteTeacher, generateId } from '../store';
import { Users, Plus, Edit2, Trash2, Search, Download, Upload, X, UserPlus } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function TeacherManager() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState({ nip: '', name: '', subject: '', position: 'Guru', gender: 'L' as 'L' | 'P', phone: '', email: '', address: '' });

  useEffect(() => { loadTeachers(); }, []);

  const loadTeachers = () => setTeachers(getTeachers());

  const filtered = teachers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.nip.toLowerCase().includes(search.toLowerCase()) ||
    s.subject.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = () => {
    if (!form.nip || !form.name || !form.subject) {
      alert('NIP, Nama, dan Mata Pelajaran wajib diisi!');
      return;
    }
    if (editTeacher) {
      updateTeacher({ ...editTeacher, ...form });
    } else {
      if (teachers.find(t => t.nip === form.nip)) {
        alert('NIP sudah terdaftar!');
        return;
      }
      addTeacher({ id: generateId(), ...form, createdAt: new Date().toISOString() });
    }
    resetForm();
    loadTeachers();
  };

  const handleEdit = (teacher: Teacher) => {
    setEditTeacher(teacher);
    setForm({
      nip: teacher.nip, name: teacher.name, subject: teacher.subject,
      position: teacher.position, gender: teacher.gender,
      phone: teacher.phone || '', email: teacher.email || '', address: teacher.address || '',
    });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Yakin ingin menghapus data guru ini?')) {
      deleteTeacher(id);
      loadTeachers();
    }
  };

  const resetForm = () => {
    setForm({ nip: '', name: '', subject: '', position: 'Guru', gender: 'L', phone: '', email: '', address: '' });
    setEditTeacher(null);
    setShowForm(false);
  };

  const exportExcel = () => {
    const data = teachers.map(t => ({
      'NIP': t.nip, 'Nama': t.name, 'Mata Pelajaran': t.subject,
      'Jabatan': t.position, 'Gender': t.gender === 'L' ? 'Laki-laki' : 'Perempuan',
      'Telepon': t.phone || '', 'Email': t.email || '', 'Alamat': t.address || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Data Guru');
    XLSX.writeFile(wb, 'data_guru.xlsx');
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
        const imported: Teacher[] = jsonData.map((row) => ({
          id: generateId(),
          nip: String(row['NIP'] || row['nip'] || ''),
          name: String(row['Nama'] || row['nama'] || row['Name'] || ''),
          subject: String(row['Mata Pelajaran'] || row['Mapel'] || row['subject'] || ''),
          position: String(row['Jabatan'] || row['position'] || 'Guru'),
          gender: (String(row['Gender'] || row['gender'] || 'L') === 'P' ? 'P' : 'L') as 'L' | 'P',
          phone: String(row['Telepon'] || row['phone'] || ''),
          email: String(row['Email'] || row['email'] || ''),
          address: String(row['Alamat'] || row['address'] || ''),
          createdAt: new Date().toISOString(),
        })).filter(t => t.nip && t.name);

        if (imported.length === 0) { alert('Tidak ada data valid!'); return; }
        if (confirm(`Import ${imported.length} data guru?`)) {
          const existing = getTeachers();
          const newTeachers = imported.filter(t => !existing.find(e => e.nip === t.nip));
          saveTeachers([...existing, ...newTeachers]);
          loadTeachers();
          alert(`Berhasil import ${newTeachers.length} guru baru!`);
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
            <Users className="text-purple-400" />
            Data Guru
          </h1>
          <p className="text-gray-400 mt-1">Kelola data guru untuk absensi</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-purple-500 hover:bg-purple-600 text-white px-5 py-3 rounded-xl font-semibold flex items-center gap-2 transition-all">
          <UserPlus size={20} /> Tambah Guru
        </button>
      </div>

      {/* Actions */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input type="text" placeholder="Cari nama, NIP, atau mapel..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none" />
          </div>
          <button onClick={exportExcel} className="bg-blue-500/20 text-blue-400 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-blue-500/30">
            <Download size={16} /> Excel
          </button>
          <label className="bg-yellow-500/20 text-yellow-400 px-4 py-2.5 rounded-xl flex items-center gap-2 hover:bg-yellow-500/30 cursor-pointer">
            <Upload size={16} /> Import
            <input type="file" accept=".xlsx,.xls,.csv" onChange={importFile} className="hidden" />
          </label>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={resetForm}>
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">{editTeacher ? 'Edit Guru' : 'Tambah Guru'}</h3>
              <button onClick={resetForm} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">NIP *</label>
                <input type="text" value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value })}
                  placeholder="Nomor Induk Pegawai"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Nama Lengkap *</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama guru"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Mata Pelajaran *</label>
                <input type="text" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="Contoh: Matematika"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Jabatan</label>
                <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none">
                  <option value="Guru">Guru</option>
                  <option value="Kepala Sekolah">Kepala Sekolah</option>
                  <option value="Wakil Kepala Sekolah">Wakil Kepala Sekolah</option>
                  <option value="TU">Tata Usaha</option>
                  <option value="BK">Bimbingan Konseling</option>
                  <option value="Pustakawan">Pustakawan</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Gender</label>
                <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value as 'L' | 'P' })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white focus:border-purple-500 focus:outline-none">
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Telepon</label>
                <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Nomor telepon/WhatsApp"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Email</label>
                <input type="text" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none" />
              </div>
              <button onClick={handleSubmit}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 rounded-xl font-semibold transition-all">
                {editTeacher ? 'Update' : 'Simpan'}
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
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">NIP</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Nama</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Mapel</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Jabatan</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-400">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">
                  {teachers.length === 0 ? 'Belum ada data guru' : 'Tidak ada hasil pencarian'}
                </td></tr>
              ) : (
                filtered.map((teacher) => (
                  <tr key={teacher.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                    <td className="px-4 py-3 text-sm text-purple-400 font-mono">{teacher.nip}</td>
                    <td className="px-4 py-3 text-sm text-white">{teacher.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-300">{teacher.subject}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded bg-purple-500/20 text-purple-400">{teacher.position}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleEdit(teacher)} className="text-blue-400 hover:text-blue-300 p-1"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(teacher.id)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-3 border-t border-gray-800 text-sm text-gray-500">
          Menampilkan {filtered.length} dari {teachers.length} guru
        </div>
      </div>
    </div>
  );
}
