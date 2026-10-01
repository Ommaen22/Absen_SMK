import { useState, useEffect } from 'react';
import { getSettings, saveSettings } from '../store';
import { AppSettings } from '../types';
import { Settings, Save, School, Volume2, Calendar } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <Settings className="text-gray-400" />
          Pengaturan
        </h1>
        <p className="text-gray-400 mt-1">Konfigurasi aplikasi absensi</p>
      </div>

      {/* Status */}
      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl p-4">
          ✓ Pengaturan berhasil disimpan!
        </div>
      )}

      {/* School Info */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <School size={20} className="text-emerald-400" />
          Informasi Sekolah
        </h3>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Nama Sekolah</label>
            <input
              type="text"
              value={settings.schoolName}
              onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              placeholder="Nama sekolah"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Alamat Sekolah</label>
            <input
              type="text"
              value={settings.schoolAddress}
              onChange={(e) => setSettings({ ...settings, schoolAddress: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
              placeholder="Alamat sekolah"
            />
          </div>
        </div>
      </div>

      {/* Scanner Settings */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Volume2 size={20} className="text-blue-400" />
          Pengaturan Scanner
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Suara Notifikasi</p>
              <p className="text-sm text-gray-400">Bunyi beep saat scan berhasil</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, scanSound: !settings.scanSound })}
              className={`w-14 h-7 rounded-full transition-all ${settings.scanSound ? 'bg-emerald-500' : 'bg-gray-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-all mx-1 ${settings.scanSound ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white">Auto Tanggal</p>
              <p className="text-sm text-gray-400">Gunakan tanggal otomatis dari sistem</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, autoDate: !settings.autoDate })}
              className={`w-14 h-7 rounded-full transition-all ${settings.autoDate ? 'bg-emerald-500' : 'bg-gray-700'}`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-all mx-1 ${settings.autoDate ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Scanner Info */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-purple-400" />
          Informasi Scanner
        </h3>
        <div className="bg-gray-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Model</span>
            <span className="text-white font-mono">CASHCOW HC-P10 USB</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Koneksi</span>
            <span className="text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              USB HID (Keyboard Emulation)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Mode</span>
            <span className="text-white">Barcode → Text Input</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Status</span>
            <span className="text-emerald-400">Ready</span>
          </div>
        </div>
        <div className="mt-4 bg-gray-800/50 rounded-xl p-4">
          <p className="text-sm text-gray-400">
            <strong className="text-white">Cara Penggunaan:</strong><br />
            1. Hubungkan scanner CASHCOW HC-P10 ke port USB komputer<br />
            2. Scanner akan terdeteksi sebagai keyboard otomatis<br />
            3. Buka halaman Scan Absensi<br />
            4. Arahkan scanner ke barcode kartu siswa<br />
            5. Data akan otomatis tercatat
          </p>
        </div>
      </div>

      {/* App Info */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4">Tentang Aplikasi</h3>
        <div className="bg-gray-800 rounded-xl p-4 space-y-2 text-sm text-gray-400">
          <p><strong className="text-white">SIHADIR</strong> - Sistem Absensi Digital</p>
          <p>Versi 1.0.0</p>
          <p>Aplikasi web absensi sekolah dengan dukungan scanner barcode USB</p>
          <p className="mt-3 text-xs">Data disimpan secara lokal di browser (localStorage). Gunakan fitur Import/Export untuk backup data.</p>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
      >
        <Save size={20} />
        Simpan Pengaturan
      </button>
    </div>
  );
}
