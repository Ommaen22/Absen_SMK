import { useState, useEffect } from 'react';
import { getSettings, saveSettings, getNotifications, getStudents } from '../store';
import { AppSettings, NotificationLog } from '../types';
import { testWhatsAppConnection, generateArrivalMessage, generateDepartureMessage } from '../whatsapp';
import { MessageCircle, Send, TestTube, Settings, Bell, CheckCircle, XCircle, Clock, Trash2, Filter } from 'lucide-react';

export default function WhatsAppPage() {
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [notifications, setNotifications] = useState<NotificationLog[]>([]);
  const [saved, setSaved] = useState(false);
  const [testNumber, setTestNumber] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [previewType, setPreviewType] = useState<'arrival' | 'departure'>('arrival');
  const [filterType, setFilterType] = useState<'all' | 'arrival' | 'departure'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'sent' | 'failed'>('all');

  useEffect(() => {
    setNotifications(getNotifications());
  }, []);

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleTest = async () => {
    if (!testNumber) { alert('Masukkan nomor telepon!'); return; }
    setTestResult(null);
    const result = await testWhatsAppConnection(settings, testNumber);
    setTestResult(result);
  };

  const filteredNotifs = notifications.filter(n => {
    if (filterType !== 'all' && n.type !== filterType) return false;
    if (filterStatus !== 'all' && n.status !== filterStatus) return false;
    return true;
  }).reverse();

  const previewMsg = previewType === 'arrival'
    ? generateArrivalMessage('Ahmad Fauzi', 'X IPA 1', settings.schoolName, '07:15:30', settings.whatsappCustomMessage)
    : generateDepartureMessage('Ahmad Fauzi', 'X IPA 1', settings.schoolName, '14:00:15', settings.whatsappCustomMessage);

  const studentsWithPhone = getStudents().filter(s => s.parentPhone);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <MessageCircle className="text-green-400" />
          Notifikasi WhatsApp
        </h1>
        <p className="text-gray-400 mt-1">Kirim notifikasi otomatis ke orang tua saat siswa absen</p>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl p-4">
          ✓ Pengaturan WhatsApp berhasil disimpan!
        </div>
      )}

      {/* Provider Selection */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Settings size={20} className="text-green-400" />
          Konfigurasi API WhatsApp
        </h3>

        <div className="space-y-4">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-800 rounded-xl">
            <div>
              <p className="text-white font-medium">Aktifkan Notifikasi WhatsApp</p>
              <p className="text-sm text-gray-400">Kirim pesan otomatis saat siswa absen</p>
            </div>
            <button onClick={() => setSettings({ ...settings, whatsappEnabled: !settings.whatsappEnabled })}
              className={`w-14 h-7 rounded-full transition-all ${settings.whatsappEnabled ? 'bg-green-500' : 'bg-gray-700'}`}>
              <div className={`w-5 h-5 bg-white rounded-full transition-all mx-1 ${settings.whatsappEnabled ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
          </div>

          {/* Provider */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Provider API</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { id: 'fonnte' as const, name: 'Fonnte', desc: 'Gratis 20 pesan/hari', color: 'green' },
                { id: 'wablas' as const, name: 'Wablas', desc: 'Free trial tersedia', color: 'blue' },
                { id: 'callmebot' as const, name: 'CallMeBot', desc: 'Gratis unlimited', color: 'purple' },
                { id: 'url_scheme' as const, name: 'WA URL', desc: 'Tanpa API (gratis)', color: 'yellow' },
              ].map((p) => (
                <button key={p.id}
                  onClick={() => setSettings({ ...settings, whatsappProvider: p.id })}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    settings.whatsappProvider === p.id
                      ? 'bg-green-500/10 border-green-500/50'
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}>
                  <p className={`font-semibold ${settings.whatsappProvider === p.id ? 'text-green-400' : 'text-white'}`}>{p.name}</p>
                  <p className="text-xs text-gray-400 mt-1">{p.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* API Key */}
          {settings.whatsappProvider !== 'url_scheme' && (
            <div>
              <label className="text-sm text-gray-400 mb-1 block">
                API Key / Token
                {settings.whatsappProvider === 'fonnte' && ' (Daftar di fonnte.com)'}
                {settings.whatsappProvider === 'wablas' && ' (Daftar di wablas.com)'}
                {settings.whatsappProvider === 'callmebot' && ' (Daftar di callmebot.com)'}
              </label>
              <input type="password" value={settings.whatsappApiKey}
                onChange={(e) => setSettings({ ...settings, whatsappApiKey: e.target.value })}
                placeholder="Masukkan API Key..."
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none" />
            </div>
          )}

          {/* Notification Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-emerald-400" />
                <div>
                  <p className="text-white text-sm">Notifikasi Saat Datang</p>
                  <p className="text-xs text-gray-400">Kirim WA saat siswa absen masuk</p>
                </div>
              </div>
              <button onClick={() => setSettings({ ...settings, whatsappNotifyArrival: !settings.whatsappNotifyArrival })}
                className={`w-12 h-6 rounded-full transition-all ${settings.whatsappNotifyArrival ? 'bg-emerald-500' : 'bg-gray-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-all mx-1 ${settings.whatsappNotifyArrival ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-800 rounded-xl">
              <div className="flex items-center gap-3">
                <Bell size={18} className="text-blue-400" />
                <div>
                  <p className="text-white text-sm">Notifikasi Saat Pulang</p>
                  <p className="text-xs text-gray-400">Kirim WA saat siswa absen pulang</p>
                </div>
              </div>
              <button onClick={() => setSettings({ ...settings, whatsappNotifyDeparture: !settings.whatsappNotifyDeparture })}
                className={`w-12 h-6 rounded-full transition-all ${settings.whatsappNotifyDeparture ? 'bg-blue-500' : 'bg-gray-700'}`}>
                <div className={`w-4 h-4 bg-white rounded-full transition-all mx-1 ${settings.whatsappNotifyDeparture ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>

          {/* Custom Message */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Template Pesan Kustom (opsional)</label>
            <textarea value={settings.whatsappCustomMessage}
              onChange={(e) => setSettings({ ...settings, whatsappCustomMessage: e.target.value })}
              placeholder="Gunakan: {nama}, {kelas}, {sekolah}, {waktu}, {tipe}"
              rows={3}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none resize-none" />
            <p className="text-xs text-gray-500 mt-1">Variabel: {'{nama}'} {'{kelas}'} {'{sekolah}'} {'{waktu}'} {'{tipe}'}</p>
          </div>

          {/* Test Connection */}
          <div className="p-4 bg-gray-800 rounded-xl">
            <p className="text-white text-sm font-medium mb-3">Test Koneksi</p>
            <div className="flex gap-3">
              <input type="text" value={testNumber} onChange={(e) => setTestNumber(e.target.value)}
                placeholder="628xxxxxxxxxx"
                className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:border-green-500 focus:outline-none" />
              <button onClick={handleTest}
                className="bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all">
                <TestTube size={16} /> Test
              </button>
            </div>
            {testResult && (
              <div className={`mt-3 p-3 rounded-lg text-sm flex items-center gap-2 ${
                testResult.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {testResult.success ? <CheckCircle size={16} /> : <XCircle size={16} />}
                {testResult.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Message Preview */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Send size={20} className="text-blue-400" />
          Preview Pesan
        </h3>
        <div className="flex gap-3 mb-4">
          <button onClick={() => setPreviewType('arrival')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${previewType === 'arrival' ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
            Pesan Datang
          </button>
          <button onClick={() => setPreviewType('departure')}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${previewType === 'departure' ? 'bg-blue-500 text-white' : 'bg-gray-800 text-gray-400'}`}>
            Pesan Pulang
          </button>
        </div>
        <div className="bg-[#1a2e1a] rounded-2xl p-4 border border-green-900/30">
          <div className="bg-[#05463d] rounded-lg p-3 max-w-xs ml-auto">
            <pre className="text-green-100 text-sm whitespace-pre-wrap font-sans">{previewMsg}</pre>
            <p className="text-green-300/50 text-xs text-right mt-1">14:30 ✓✓</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <p className="text-sm text-gray-400">Total Notifikasi</p>
          <p className="text-2xl font-bold text-white mt-1">{notifications.length}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <p className="text-sm text-gray-400">Berhasil Terkirim</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{notifications.filter(n => n.status === 'sent').length}</p>
        </div>
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-5">
          <p className="text-sm text-gray-400">Siswa Terdaftar No. Ortu</p>
          <p className="text-2xl font-bold text-blue-400 mt-1">{studentsWithPhone.length}</p>
        </div>
      </div>

      {/* Notification Log */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h3 className="text-white font-semibold">Log Notifikasi</h3>
          <div className="flex gap-2">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none">
              <option value="all">Semua Tipe</option>
              <option value="arrival">Datang</option>
              <option value="departure">Pulang</option>
            </select>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value as any)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none">
              <option value="all">Semua Status</option>
              <option value="sent">Terkirim</option>
              <option value="failed">Gagal</option>
            </select>
          </div>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {filteredNotifs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p>Belum ada notifikasi terkirim</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800/50">
              {filteredNotifs.map((n) => (
                <div key={n.id} className="px-4 py-3 hover:bg-gray-800/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {n.status === 'sent' ? <CheckCircle size={16} className="text-green-400" /> : <XCircle size={16} className="text-red-400" />}
                      <div>
                        <p className="text-sm text-white">
                          {n.type === 'arrival' ? '📥 Datang' : '📤 Pulang'} - {n.studentName}
                        </p>
                        <p className="text-xs text-gray-500">Ke: {n.recipient}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{n.date} {n.time}</p>
                      <span className={`text-xs ${n.status === 'sent' ? 'text-green-400' : 'text-red-400'}`}>
                        {n.status === 'sent' ? 'Terkirim' : 'Gagal'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* API Info */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4">Panduan API WhatsApp Gratis</h3>
        <div className="space-y-4">
          <div className="bg-gray-800 rounded-xl p-4">
            <h4 className="text-green-400 font-medium mb-2">🟢 Fonnte (fonnte.com)</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Gratis 20 pesan/hari untuk akun free</li>
              <li>• Daftar → Dashboard → Copy API Token</li>
              <li>• Scan QR WhatsApp di dashboard Fonnte</li>
              <li>• Format nomor: 628xxxxxxxxxx</li>
            </ul>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <h4 className="text-purple-400 font-medium mb-2">🟣 CallMeBot (callmebot.com)</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Gratis unlimited pesan</li>
              <li>• Daftar → Dapatkan API Key via WhatsApp</li>
              <li>• Kirim pesan "I allow callmebot to send..." ke bot</li>
              <li>• Cocok untuk personal/notifikasi diri sendiri</li>
            </ul>
          </div>
          <div className="bg-gray-800 rounded-xl p-4">
            <h4 className="text-yellow-400 font-medium mb-2">🟡 WhatsApp URL Scheme (Tanpa API)</h4>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• 100% gratis, tidak perlu API key</li>
              <li>• Membuka WhatsApp Web/App langsung</li>
              <li>• Perlu konfirmasi manual untuk setiap pesan</li>
              <li>• Cocok untuk testing/demo</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button onClick={handleSave}
        className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-500/20">
        <CheckCircle size={20} />
        Simpan Pengaturan WhatsApp
      </button>
    </div>
  );
}
