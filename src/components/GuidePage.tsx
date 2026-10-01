import { useState } from 'react';
import { BookOpen, Globe, Usb, MessageCircle, Smartphone, Monitor, Server, Download, Copy, CheckCircle, ChevronDown, ChevronRight, ExternalLink, Wifi, Cloud, HardDrive, Zap, Shield, HelpCircle } from 'lucide-react';

type GuideSection = 'overview' | 'deploy' | 'scanner' | 'whatsapp' | 'devices' | 'troubleshoot';

export default function GuidePage() {
  const [activeSection, setActiveSection] = useState<GuideSection>('overview');
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (id: string) => {
    const newSet = new Set(expandedSteps);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedSteps(newSet);
  };

  const sections: { id: GuideSection; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'overview', label: 'Gambaran Umum', icon: <BookOpen size={18} />, color: 'emerald' },
    { id: 'deploy', label: 'Deploy Online', icon: <Globe size={18} />, color: 'blue' },
    { id: 'scanner', label: 'Setup Scanner', icon: <Usb size={18} />, color: 'purple' },
    { id: 'whatsapp', label: 'Setup WhatsApp', icon: <MessageCircle size={18} />, color: 'green' },
    { id: 'devices', label: 'Akses Multi-Device', icon: <Smartphone size={18} />, color: 'indigo' },
    { id: 'troubleshoot', label: 'Troubleshooting', icon: <HelpCircle size={18} />, color: 'red' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <BookOpen className="text-cyan-400" />
          Panduan Lengkap SIHADIR
        </h1>
        <p className="text-gray-400 mt-1">Langkah-langkah menjalankan aplikasi di perangkat mana saja</p>
      </div>

      {/* Section Tabs */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-2">
        <div className="flex flex-wrap gap-2">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                activeSection === s.id
                  ? `bg-${s.color}-500/20 text-${s.color}-400 border border-${s.color}-500/30`
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
              style={activeSection === s.id ? {
                backgroundColor: s.color === 'emerald' ? 'rgba(16,185,129,0.15)' :
                  s.color === 'blue' ? 'rgba(59,130,246,0.15)' :
                  s.color === 'purple' ? 'rgba(168,85,247,0.15)' :
                  s.color === 'green' ? 'rgba(34,197,94,0.15)' :
                  s.color === 'indigo' ? 'rgba(99,102,241,0.15)' :
                  'rgba(239,68,68,0.15)',
                color: s.color === 'emerald' ? '#34d399' :
                  s.color === 'blue' ? '#60a5fa' :
                  s.color === 'purple' ? '#c084fc' :
                  s.color === 'green' ? '#4ade80' :
                  s.color === 'indigo' ? '#818cf8' :
                  '#f87171',
              } : {}}
            >
              {s.icon}
              <span className="hidden sm:inline">{s.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        {activeSection === 'overview' && <OverviewSection />}
        {activeSection === 'deploy' && <DeploySection expandedSteps={expandedSteps} toggleStep={toggleStep} />}
        {activeSection === 'scanner' && <ScannerSection expandedSteps={expandedSteps} toggleStep={toggleStep} />}
        {activeSection === 'whatsapp' && <WhatsAppSection expandedSteps={expandedSteps} toggleStep={toggleStep} />}
        {activeSection === 'devices' && <DevicesSection />}
        {activeSection === 'troubleshoot' && <TroubleshootSection />}
      </div>
    </div>
  );
}

// Collapsible Step Component
function Step({ id, number, title, expanded, onToggle, children }: {
  id: string; number: number; title: string; expanded: boolean; onToggle: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-800 rounded-xl overflow-hidden mb-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-4 hover:bg-gray-800/50 transition-all text-left"
      >
        <span className="w-8 h-8 bg-emerald-500/20 text-emerald-400 rounded-lg flex items-center justify-center text-sm font-bold">
          {number}
        </span>
        <span className="text-white font-medium flex-1">{title}</span>
        {expanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-0 border-t border-gray-800">
          <div className="pl-11 text-gray-300 text-sm space-y-2">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-950 rounded-lg border border-gray-700 overflow-hidden my-2">
      {label && (
        <div className="px-3 py-1.5 bg-gray-800 border-b border-gray-700 flex items-center justify-between">
          <span className="text-xs text-gray-400">{label}</span>
          <button onClick={copy} className="text-xs text-gray-400 hover:text-white flex items-center gap-1">
            {copied ? <><CheckCircle size={12} /> Tersalin!</> : <><Copy size={12} /> Salin</>}
          </button>
        </div>
      )}
      <pre className="p-3 text-xs text-emerald-400 overflow-x-auto font-mono">{code}</pre>
    </div>
  );
}

function InfoBox({ type, children }: { type: 'info' | 'warning' | 'success' | 'tip'; children: React.ReactNode }) {
  const styles = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    tip: 'bg-purple-500/10 border-purple-500/30 text-purple-300',
  };
  return (
    <div className={`rounded-lg border p-3 text-sm ${styles[type]}`}>
      {children}
    </div>
  );
}

// ===== SECTIONS =====

function OverviewSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">🎯 Gambaran Umum</h2>
      
      <div className="bg-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">Apa itu SIHADIR?</h3>
        <p className="text-gray-300 text-sm leading-relaxed">
          SIHADIR adalah <strong>Sistem Absensi Digital</strong> berbasis web yang dirancang untuk sekolah. 
          Aplikasi ini menggunakan scanner barcode <strong>CASHCOW HC-P10 USB</strong> untuk mencatat kehadiran 
          siswa dan guru secara otomatis, serta mengirim notifikasi ke orang tua via WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-800 rounded-xl p-5">
          <h3 className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
            <Monitor size={18} /> Fitur Utama
          </h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Absensi siswa & guru via barcode</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Mode masuk & pulang</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Notifikasi WhatsApp ke orang tua</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Rekap bulanan & tahunan</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Import/Export database</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Akses dari perangkat manapun</li>
          </ul>
        </div>
        <div className="bg-gray-800 rounded-xl p-5">
          <h3 className="text-blue-400 font-semibold mb-3 flex items-center gap-2">
            <Zap size={18} /> Cara Akses
          </h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-start gap-2"><span className="text-blue-400">1.</span> <strong>Online:</strong> Deploy ke hosting gratis</li>
            <li className="flex items-start gap-2"><span className="text-blue-400">2.</span> <strong>LAN:</strong> Jalankan di komputer sekolah</li>
            <li className="flex items-start gap-2"><span className="text-blue-400">3.</span> <strong>Offline:</strong> Buka file HTML langsung</li>
            <li className="flex items-start gap-2"><span className="text-blue-400">4.</span> <strong>Multi-device:</strong> HP, tablet, PC</li>
          </ul>
        </div>
      </div>

      <InfoBox type="info">
        <strong>💡 Penting:</strong> Data disimpan di browser (localStorage) masing-masing perangkat. 
        Gunakan fitur Import/Export untuk sinkronisasi data antar perangkat.
      </InfoBox>

      <div className="bg-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">📋 Yang Anda Butuhkan:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-gray-900 rounded-lg p-3 text-center">
            <Usb size={24} className="text-purple-400 mx-auto mb-2" />
            <p className="text-sm text-white font-medium">Scanner</p>
            <p className="text-xs text-gray-400">CASHCOW HC-P10 USB</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 text-center">
            <Monitor size={24} className="text-blue-400 mx-auto mb-2" />
            <p className="text-sm text-white font-medium">Komputer</p>
            <p className="text-xs text-gray-400">Windows/Mac/Linux</p>
          </div>
          <div className="bg-gray-900 rounded-lg p-3 text-center">
            <Globe size={24} className="text-emerald-400 mx-auto mb-2" />
            <p className="text-sm text-white font-medium">Internet</p>
            <p className="text-xs text-gray-400">Untuk notifikasi WA</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DeploySection({ expandedSteps, toggleStep }: { expandedSteps: Set<string>; toggleStep: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">🌐 Deploy Online (Akses dari Mana Saja)</h2>
      <p className="text-gray-400 text-sm">Pilih salah satu cara di bawah untuk menghosting aplikasi secara online:</p>

      {/* Option 1: Netlify */}
      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-teal-500/10 to-transparent border-b border-gray-800">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Cloud size={18} className="text-teal-400" />
            Opsi 1: Netlify Drop (Paling Mudah - 2 Menit)
          </h3>
          <p className="text-xs text-gray-400 mt-1">Gratis, tanpa akun, tanpa coding</p>
        </div>
        <div className="p-4 space-y-3">
          <Step id="netlify-1" number={1} title="Download file aplikasi" expanded={expandedSteps.has('netlify-1')} onToggle={() => toggleStep('netlify-1')}>
            <p>File aplikasi sudah di-build. Anda akan mendapatkan folder <code className="bg-gray-800 px-1.5 py-0.5 rounded text-emerald-400">dist/</code> yang berisi:</p>
            <CodeBlock code={`dist/
├── index.html
└── assets/
    ├── index-xxxxx.css
    └── index-xxxxx.js`} label="Struktur folder" />
          </Step>

          <Step id="netlify-2" number={2} title="Buka Netlify Drop" expanded={expandedSteps.has('netlify-2')} onToggle={() => toggleStep('netlify-2')}>
            <p>Buka browser dan kunjungi:</p>
            <CodeBlock code="https://app.netlify.com/drop" label="URL" />
            <InfoBox type="tip">Tidak perlu daftar akun untuk cara ini!</InfoBox>
          </Step>

          <Step id="netlify-3" number={3} title="Drag & Drop folder dist" expanded={expandedSteps.has('netlify-3')} onToggle={() => toggleStep('netlify-3')}>
            <p>Seret folder <code className="bg-gray-800 px-1.5 py-0.5 rounded text-emerald-400">dist/</code> ke area upload di Netlify Drop.</p>
            <p className="text-yellow-300">⚠️ Pastikan yang di-drag adalah ISI folder dist, bukan folder dist-nya.</p>
          </Step>

          <Step id="netlify-4" number={4} title="Selesai! Dapatkan URL" expanded={expandedSteps.has('netlify-4')} onToggle={() => toggleStep('netlify-4')}>
            <p>Netlify akan memberikan URL seperti:</p>
            <CodeBlock code="https://sihadir-sekolah.netlify.app" label="Contoh URL" />
            <p>URL ini bisa diakses dari <strong>perangkat manapun</strong> yang terhubung internet!</p>
            <InfoBox type="success">✅ Aplikasi Anda sekarang bisa diakses dari HP, tablet, atau komputer mana saja!</InfoBox>
          </Step>
        </div>
      </div>

      {/* Option 2: Vercel */}
      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-gray-500/10 to-transparent border-b border-gray-800">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Server size={18} className="text-gray-300" />
            Opsi 2: Vercel (Gratis, Permanen)
          </h3>
          <p className="text-xs text-gray-400 mt-1">Perlu akun GitHub, hosting permanen gratis</p>
        </div>
        <div className="p-4 space-y-3">
          <Step id="vercel-1" number={1} title="Upload ke GitHub" expanded={expandedSteps.has('vercel-1')} onToggle={() => toggleStep('vercel-1')}>
            <p>Buat repository baru di GitHub, lalu upload folder project:</p>
            <CodeBlock code={`# Di terminal, masuk ke folder project
cd folder-project-sihadir

# Inisialisasi git
git init
git add .
git commit -m "Initial commit"

# Push ke GitHub
git remote add origin https://github.com/username/sihadir.git
git push -u origin main`} label="Terminal commands" />
          </Step>

          <Step id="vercel-2" number={2} title="Deploy di Vercel" expanded={expandedSteps.has('vercel-2')} onToggle={() => toggleStep('vercel-2')}>
            <p>Buka <code className="bg-gray-800 px-1.5 py-0.5 rounded text-emerald-400">https://vercel.com</code> dan login dengan GitHub.</p>
            <p>Klik "Import Project" → pilih repository → Deploy.</p>
            <InfoBox type="info">Vercel akan otomatis detect framework Vite dan build.</InfoBox>
          </Step>

          <Step id="vercel-3" number={3} title="Aplikasi Live!" expanded={expandedSteps.has('vercel-3')} onToggle={() => toggleStep('vercel-3')}>
            <p>Vercel memberikan URL seperti:</p>
            <CodeBlock code="https://sihadir.vercel.app" label="URL Vercel" />
            <p>Setiap kali push ke GitHub, otomatis deploy ulang!</p>
          </Step>
        </div>
      </div>

      {/* Option 3: Local Network */}
      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-transparent border-b border-gray-800">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Wifi size={18} className="text-blue-400" />
            Opsi 3: Jaringan Lokal (LAN Sekolah)
          </h3>
          <p className="text-xs text-gray-400 mt-1">Tanpa internet, hanya di jaringan sekolah</p>
        </div>
        <div className="p-4 space-y-3">
          <Step id="lan-1" number={1} title="Install Node.js di komputer server" expanded={expandedSteps.has('lan-1')} onToggle={() => toggleStep('lan-1')}>
            <p>Download dan install Node.js dari:</p>
            <CodeBlock code="https://nodejs.org" label="Download Node.js" />
          </Step>

          <Step id="lan-2" number={2} title="Install serve (web server sederhana)" expanded={expandedSteps.has('lan-2')} onToggle={() => toggleStep('lan-2')}>
            <p>Buka terminal/CMD dan jalankan:</p>
            <CodeBlock code="npm install -g serve" label="Terminal" />
          </Step>

          <Step id="lan-3" number={3} title="Jalankan server di folder dist" expanded={expandedSteps.has('lan-3')} onToggle={() => toggleStep('lan-3')}>
            <CodeBlock code={`# Masuk ke folder dist
cd path/ke/dist

# Jalankan server di port 3000, bisa diakses dari LAN
serve -s . -l 3000`} label="Terminal" />
          </Step>

          <Step id="lan-4" number={4} title="Akses dari perangkat lain" expanded={expandedSteps.has('lan-4')} onToggle={() => toggleStep('lan-4')}>
            <p>Cari IP Address komputer server:</p>
            <CodeBlock code={`# Windows
ipconfig
# Cari "IPv4 Address" (contoh: 192.168.1.100)

# Mac/Linux
ifconfig`} label="Cek IP Address" />
            <p>Di perangkat lain (HP/tablet), buka browser dan kunjungi:</p>
            <CodeBlock code="http://192.168.1.100:3000" label="URL di LAN" />
            <InfoBox type="warning">⚠️ Semua perangkat harus terhubung ke WiFi/jaringan yang sama!</InfoBox>
          </Step>
        </div>
      </div>

      {/* Option 4: Offline */}
      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-orange-500/10 to-transparent border-b border-gray-800">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <HardDrive size={18} className="text-orange-400" />
            Opsi 4: Offline (Tanpa Server)
          </h3>
          <p className="text-xs text-gray-400 mt-1">Buka langsung dari file HTML</p>
        </div>
        <div className="p-4 space-y-3">
          <Step id="offline-1" number={1} title="Buka file index.html" expanded={expandedSteps.has('offline-1')} onToggle={() => toggleStep('offline-1')}>
            <p>Cukup buka file <code className="bg-gray-800 px-1.5 py-0.5 rounded text-emerald-400">dist/index.html</code> langsung di browser (Chrome/Edge/Firefox).</p>
            <InfoBox type="info">💡 Bisa juga di-copy ke flashdisk dan dijalankan di komputer manapun.</InfoBox>
          </Step>
          <Step id="offline-2" number={2} title="Catatan penting" expanded={expandedSteps.has('offline-2')} onToggle={() => toggleStep('offline-2')}>
            <ul className="list-disc list-inside space-y-1">
              <li>Data tersimpan di browser masing-masing komputer</li>
              <li>Notifikasi WhatsApp <strong>tidak berfungsi</strong> tanpa internet</li>
              <li>Scanner barcode tetap berfungsi (via USB)</li>
            </ul>
          </Step>
        </div>
      </div>
    </div>
  );
}

function ScannerSection({ expandedSteps, toggleStep }: { expandedSteps: Set<string>; toggleStep: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">📟 Setup Scanner CASHCOW HC-P10</h2>
      
      <div className="bg-gray-800 rounded-xl p-5">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center">
            <Usb size={32} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-lg">CASHCOW HC-P10 USB</h3>
            <p className="text-sm text-gray-400">Barcode Scanner - USB HID Mode</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm">
          Scanner ini bekerja sebagai <strong>keyboard emulator</strong>. Saat barcode di-scan, 
          scanner otomatis "mengetikkan" nomor barcode ke komputer, diikuti tombol Enter.
        </p>
      </div>

      <Step id="scanner-1" number={1} title="Hubungkan Scanner ke USB" expanded={expandedSteps.has('scanner-1')} onToggle={() => toggleStep('scanner-1')}>
        <ol className="list-decimal list-inside space-y-2">
          <li>Colokkan kabel USB scanner ke port USB komputer</li>
          <li>Tunggu hingga komputer mendeteksi perangkat (biasanya 3-5 detik)</li>
          <li>Tidak perlu install driver (plug & play)</li>
        </ol>
        <InfoBox type="success">✅ Scanner akan otomatis terdeteksi sebagai keyboard USB</InfoBox>
      </Step>

      <Step id="scanner-2" number={2} title="Verifikasi Scanner Berfungsi" expanded={expandedSteps.has('scanner-2')} onToggle={() => toggleStep('scanner-2')}>
        <ol className="list-decimal list-inside space-y-2">
          <li>Buka aplikasi Notepad atau text editor</li>
          <li>Klik di area text (pastikan cursor aktif)</li>
          <li>Arahkan scanner ke barcode (kartu siswa/NIS)</li>
          <li>Tekan tombol scan di scanner</li>
          <li>Nomor barcode akan muncul di Notepad + cursor pindah baris (Enter)</li>
        </ol>
        <CodeBlock code={`Contoh hasil scan di Notepad:
2024001
2024002
2024003`} label="Hasil scan" />
      </Step>

      <Step id="scanner-3" number={3} title="Gunakan di Aplikasi SIHADIR" expanded={expandedSteps.has('scanner-3')} onToggle={() => toggleStep('scanner-3')}>
        <ol className="list-decimal list-inside space-y-2">
          <li>Buka halaman <strong>"Scan Absensi"</strong> (satu halaman untuk siswa & guru)</li>
          <li>Pilih mode <strong>Masuk</strong> atau <strong>Pulang</strong></li>
          <li>Klik di area halaman (agar fokus aktif)</li>
          <li>Arahkan scanner ke barcode kartu siswa (NIS) atau guru (NIP)</li>
          <li>Sistem otomatis mendeteksi apakah itu siswa atau guru ✓</li>
          <li>Absensi tercatat + notifikasi WA terkirim (untuk siswa)! ✓</li>
        </ol>
        <InfoBox type="tip">💡 Tips: Scan barcode NIS untuk siswa, NIP untuk guru - semua di satu halaman!</InfoBox>
      </Step>

      <Step id="scanner-4" number={4} title="Buat Barcode/ID Card Siswa" expanded={expandedSteps.has('scanner-4')} onToggle={() => toggleStep('scanner-4')}>
        <p>Untuk membuat kartu barcode siswa, Anda bisa menggunakan:</p>
        <ul className="list-disc list-inside space-y-1 mt-2">
          <li><strong>Website gratis:</strong> barcode.tec-it.com, barcode-generator.org</li>
          <li><strong>Format:</strong> Code 128 atau Code 39 (paling kompatibel)</li>
          <li><strong>Isi barcode:</strong> NIS siswa (contoh: 2024001)</li>
        </ul>
        <CodeBlock code={`Langkah membuat barcode:
1. Buka https://barcode.tec-it.com
2. Pilih tipe: Code 128
3. Masukkan NIS (contoh: 2024001)
4. Download gambar barcode
5. Cetak dan tempel di kartu siswa`} label="Tutorial" />
        <InfoBox type="info">💡 Anda juga bisa menggunakan QR Code. Scanner HC-P10 mendukung QR Code juga.</InfoBox>
      </Step>

      <div className="bg-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">⚙️ Pengaturan Scanner (Opsional)</h3>
        <p className="text-sm text-gray-400 mb-3">Scanner HC-P10 bisa diatur melalui barcode konfigurasi di manual:</p>
        <ul className="text-sm text-gray-300 space-y-2">
          <li className="flex items-start gap-2"><span className="text-purple-400">•</span> <strong>Suffix Enter:</strong> Aktifkan agar otomatis tekan Enter setelah scan</li>
          <li className="flex items-start gap-2"><span className="text-purple-400">•</span> <strong>Prefix/Suffix:</strong> Bisa tambah karakter depan/belakang</li>
          <li className="flex items-start gap-2"><span className="text-purple-400">•</span> <strong>Mode:</strong> USB HID (keyboard) - ini yang kita gunakan</li>
          <li className="flex items-start gap-2"><span className="text-purple-400">•</span> <strong>Beep:</strong> Aktifkan bunyi saat scan berhasil</li>
        </ul>
      </div>
    </div>
  );
}

function WhatsAppSection({ expandedSteps, toggleStep }: { expandedSteps: Set<string>; toggleStep: (id: string) => void }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">💬 Setup Notifikasi WhatsApp</h2>
      <p className="text-gray-400 text-sm">Pilih salah satu provider API WhatsApp gratis:</p>

      {/* Provider Comparison */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800">
              <th className="text-left px-3 py-2 text-gray-400">Provider</th>
              <th className="text-center px-3 py-2 text-gray-400">Gratis</th>
              <th className="text-center px-3 py-2 text-gray-400">Limit</th>
              <th className="text-center px-3 py-2 text-gray-400">Rekomendasi</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-800/50">
              <td className="px-3 py-2 text-green-400 font-medium">Fonnte</td>
              <td className="px-3 py-2 text-center text-white">20 pesan/hari</td>
              <td className="px-3 py-2 text-center text-gray-300">Cukup untuk demo</td>
              <td className="px-3 py-2 text-center"><span className="bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded text-xs">⭐ Populer</span></td>
            </tr>
            <tr className="border-b border-gray-800/50">
              <td className="px-3 py-2 text-purple-400 font-medium">CallMeBot</td>
              <td className="px-3 py-2 text-center text-white">Unlimited</td>
              <td className="px-3 py-2 text-center text-gray-300">1 pesan/10 detik</td>
              <td className="px-3 py-2 text-center"><span className="bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-xs">✅ Terbaik</span></td>
            </tr>
            <tr className="border-b border-gray-800/50">
              <td className="px-3 py-2 text-blue-400 font-medium">Wablas</td>
              <td className="px-3 py-2 text-center text-white">Trial 3 hari</td>
              <td className="px-3 py-2 text-center text-gray-300">Unlimited saat trial</td>
              <td className="px-3 py-2 text-center"><span className="bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded text-xs">🔵 Trial</span></td>
            </tr>
            <tr>
              <td className="px-3 py-2 text-yellow-400 font-medium">WA URL</td>
              <td className="px-3 py-2 text-center text-white">Unlimited</td>
              <td className="px-3 py-2 text-center text-gray-300">Manual konfirmasi</td>
              <td className="px-3 py-2 text-center"><span className="bg-gray-500/20 text-gray-400 px-2 py-0.5 rounded text-xs">📱 Testing</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Fonnte Setup */}
      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-green-500/10 to-transparent border-b border-gray-800">
          <h3 className="text-white font-semibold">🟢 Setup Fonnte (Paling Mudah)</h3>
        </div>
        <div className="p-4 space-y-3">
          <Step id="fonnte-1" number={1} title="Daftar Akun Fonnte" expanded={expandedSteps.has('fonnte-1')} onToggle={() => toggleStep('fonnte-1')}>
            <ol className="list-decimal list-inside space-y-2">
              <li>Buka <code className="bg-gray-800 px-1.5 py-0.5 rounded text-emerald-400">https://fonnte.com</code></li>
              <li>Klik "Daftar" atau "Register"</li>
              <li>Isi data: Nama, Email, Password</li>
              <li>Verifikasi email</li>
              <li>Login ke dashboard</li>
            </ol>
          </Step>

          <Step id="fonnte-2" number={2} title="Hubungkan WhatsApp" expanded={expandedSteps.has('fonnte-2')} onToggle={() => toggleStep('fonnte-2')}>
            <ol className="list-decimal list-inside space-y-2">
              <li>Di dashboard Fonnte, klik menu <strong>"Device"</strong></li>
              <li>Klik <strong>"Add Device"</strong></li>
              <li>Akan muncul QR Code</li>
              <li>Buka WhatsApp di HP → Menu → Linked Devices → Scan QR</li>
              <li>Tunggu hingga terhubung (status: Connected)</li>
            </ol>
            <InfoBox type="warning">⚠️ Gunakan nomor WhatsApp yang tidak terlalu aktif, karena akan menjadi "bot" pengirim pesan.</InfoBox>
          </Step>

          <Step id="fonnte-3" number={3} title="Dapatkan API Token" expanded={expandedSteps.has('fonnte-3')} onToggle={() => toggleStep('fonnte-3')}>
            <ol className="list-decimal list-inside space-y-2">
              <li>Di dashboard, klik menu <strong>"API"</strong></li>
              <li>Copy token API Anda</li>
              <li>Token terlihat seperti: <code className="bg-gray-800 px-1.5 py-0.5 rounded text-emerald-400">abc123xyz456...</code></li>
            </ol>
          </Step>

          <Step id="fonnte-4" number={4} title="Masukkan Token di SIHADIR" expanded={expandedSteps.has('fonnte-4')} onToggle={() => toggleStep('fonnte-4')}>
            <ol className="list-decimal list-inside space-y-2">
              <li>Buka menu <strong>"Notifikasi WhatsApp"</strong> di SIHADIR</li>
              <li>Pilih provider <strong>"Fonnte"</strong></li>
              <li>Paste token API di kolom "API Key"</li>
              <li>Aktifkan toggle "Aktifkan Notifikasi WhatsApp"</li>
              <li>Klik "Simpan Pengaturan"</li>
              <li>Test koneksi dengan memasukkan nomor HP Anda</li>
            </ol>
          </Step>
        </div>
      </div>

      {/* CallMeBot Setup */}
      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-transparent border-b border-gray-800">
          <h3 className="text-white font-semibold">🟣 Setup CallMeBot (Unlimited Gratis)</h3>
        </div>
        <div className="p-4 space-y-3">
          <Step id="cbot-1" number={1} title="Aktivasi via WhatsApp" expanded={expandedSteps.has('cbot-1')} onToggle={() => toggleStep('cbot-1')}>
            <ol className="list-decimal list-inside space-y-2">
              <li>Simpan nomor CallMeBot: <code className="bg-gray-800 px-1.5 py-0.5 rounded text-emerald-400">+34 644 59 79 78</code></li>
              <li>Kirim pesan WhatsApp ke nomor tersebut:</li>
            </ol>
            <CodeBlock code="I allow callmebot to send me messages" label="Pesan aktivasi" />
            <p className="mt-2">Anda akan menerima balasan berisi API Key.</p>
          </Step>

          <Step id="cbot-2" number={2} title="Gunakan API Key di SIHADIR" expanded={expandedSteps.has('cbot-2')} onToggle={() => toggleStep('cbot-2')}>
            <ol className="list-decimal list-inside space-y-2">
              <li>Buka menu <strong>"Notifikasi WhatsApp"</strong></li>
              <li>Pilih provider <strong>"CallMeBot"</strong></li>
              <li>Masukkan API Key yang diterima</li>
              <li>Simpan dan test koneksi</li>
            </ol>
            <InfoBox type="info">💡 CallMeBot hanya bisa mengirim ke nomor yang sudah diaktivasi (nomor Anda sendiri).</InfoBox>
          </Step>
        </div>
      </div>

      {/* URL Scheme */}
      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-yellow-500/10 to-transparent border-b border-gray-800">
          <h3 className="text-white font-semibold">🟡 Setup WA URL Scheme (Tanpa API)</h3>
        </div>
        <div className="p-4 space-y-3">
          <Step id="url-1" number={1} title="Tidak Perlu Setup!" expanded={expandedSteps.has('url-1')} onToggle={() => toggleStep('url-1')}>
            <p>Provider ini <strong>tidak memerlukan API key</strong>. Cukup:</p>
            <ol className="list-decimal list-inside space-y-2 mt-2">
              <li>Pilih provider <strong>"WA URL"</strong> di pengaturan</li>
              <li>Setiap kali ada absensi, browser akan membuka tab WhatsApp baru</li>
              <li>Pesan sudah terisi otomatis, tinggal klik kirim</li>
            </ol>
            <InfoBox type="warning">⚠️ Perlu konfirmasi manual untuk setiap pesan. Cocok untuk testing.</InfoBox>
          </Step>
        </div>
      </div>

      {/* Format Nomor */}
      <div className="bg-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-3">📱 Format Nomor WhatsApp</h3>
        <p className="text-sm text-gray-300 mb-3">Gunakan format internasional tanpa tanda + atau 0:</p>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-red-400 text-sm">✗ Salah:</span>
            <code className="bg-gray-900 px-2 py-1 rounded text-sm">081234567890</code>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-red-400 text-sm">✗ Salah:</span>
            <code className="bg-gray-900 px-2 py-1 rounded text-sm">+6281234567890</code>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-emerald-400 text-sm">✓ Benar:</span>
            <code className="bg-gray-900 px-2 py-1 rounded text-sm text-emerald-400">6281234567890</code>
          </div>
        </div>
      </div>
    </div>
  );
}

function DevicesSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">📱 Akses dari Berbagai Perangkat</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PC/Laptop */}
        <div className="bg-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <Monitor size={24} className="text-blue-400" />
            <h3 className="text-white font-semibold">Komputer / Laptop</h3>
          </div>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-start gap-2"><span className="text-blue-400">1.</span> Buka browser (Chrome/Edge/Firefox)</li>
            <li className="flex items-start gap-2"><span className="text-blue-400">2.</span> Ketik URL aplikasi</li>
            <li className="flex items-start gap-2"><span className="text-blue-400">3.</span> Hubungkan scanner USB</li>
            <li className="flex items-start gap-2"><span className="text-blue-400">4.</span> Mulai scan absensi</li>
          </ul>
          <InfoBox type="success">✅ Scanner barcode hanya bisa digunakan di komputer/laptop (via USB)</InfoBox>
        </div>

        {/* Smartphone */}
        <div className="bg-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <Smartphone size={24} className="text-emerald-400" />
            <h3 className="text-white font-semibold">Smartphone / HP</h3>
          </div>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-start gap-2"><span className="text-emerald-400">1.</span> Buka browser di HP</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400">2.</span> Ketik URL aplikasi</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400">3.</span> Bisa lihat data & rekap</li>
            <li className="flex items-start gap-2"><span className="text-emerald-400">4.</span> Input absensi manual</li>
          </ul>
          <InfoBox type="tip">💡 Tambahkan ke Home Screen agar seperti aplikasi native!</InfoBox>
        </div>

        {/* Tablet */}
        <div className="bg-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <h3 className="text-white font-semibold">Tablet / iPad</h3>
          </div>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-start gap-2"><span className="text-purple-400">1.</span> Sama seperti smartphone</li>
            <li className="flex items-start gap-2"><span className="text-purple-400">2.</span> Layar lebih besar, nyaman</li>
            <li className="flex items-start gap-2"><span className="text-purple-400">3.</span> Bisa pakai scanner Bluetooth</li>
            <li className="flex items-start gap-2"><span className="text-purple-400">4.</span> Cocok untuk guru piket</li>
          </ul>
        </div>

        {/* Add to Home Screen */}
        <div className="bg-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <Download size={24} className="text-yellow-400" />
            <h3 className="text-white font-semibold">Jadikan Aplikasi (PWA)</h3>
          </div>
          <ul className="text-sm text-gray-300 space-y-2">
            <li className="flex items-start gap-2"><span className="text-yellow-400">📱</span> <strong>Android:</strong> Menu ⋮ → "Add to Home screen"</li>
            <li className="flex items-start gap-2"><span className="text-yellow-400">🍎</span> <strong>iPhone:</strong> Share → "Add to Home Screen"</li>
            <li className="flex items-start gap-2"><span className="text-yellow-400">💻</span> <strong>Chrome PC:</strong> Menu → "Install app"</li>
          </ul>
          <InfoBox type="success">Setelah ditambah, aplikasi bisa dibuka seperti aplikasi biasa!</InfoBox>
        </div>
      </div>

      {/* Multi-user scenario */}
      <div className="bg-gray-800 rounded-xl p-5">
        <h3 className="text-white font-semibold mb-4">🏫 Skenario Penggunaan di Sekolah</h3>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-emerald-400 text-sm font-bold">1</span>
            </div>
            <div>
              <p className="text-white font-medium">Pintu Masuk Sekolah</p>
              <p className="text-sm text-gray-400">Komputer + Scanner USB → Siswa scan saat datang</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-blue-400 text-sm font-bold">2</span>
            </div>
            <div>
              <p className="text-white font-medium">Ruang Guru</p>
              <p className="text-sm text-gray-400">Komputer + Scanner → Guru scan absensi</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-purple-400 text-sm font-bold">3</span>
            </div>
            <div>
              <p className="text-white font-medium">Kepala Sekolah / Admin</p>
              <p className="text-sm text-gray-400">HP/Tablet → Monitor absensi real-time dari mana saja</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-yellow-400 text-sm font-bold">4</span>
            </div>
            <div>
              <p className="text-white font-medium">Orang Tua</p>
              <p className="text-sm text-gray-400">HP → Menerima notifikasi WhatsApp otomatis</p>
            </div>
          </div>
        </div>
      </div>

      <InfoBox type="info">
        <strong>🔒 Keamanan Data:</strong> Data tersimpan di browser masing-masing perangkat. 
        Untuk berbagi data antar perangkat, gunakan fitur Import/Export di menu "Import/Export Data".
      </InfoBox>
    </div>
  );
}

function TroubleshootSection() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">🔧 Troubleshooting</h2>

      <div className="space-y-3">
        <div className="bg-gray-800 rounded-xl p-5">
          <h3 className="text-red-400 font-semibold mb-2">❌ Scanner tidak merespon</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Pastikan scanner terhubung ke USB (cek lampu indikator)</li>
            <li>• Coba cabut dan colokkan kembali kabel USB</li>
            <li>• Pastikan halaman scan sudah terbuka dan area input aktif</li>
            <li>• Test di Notepad dulu - apakah barcode muncul saat di-scan?</li>
            <li>• Coba port USB yang berbeda</li>
          </ul>
        </div>

        <div className="bg-gray-800 rounded-xl p-5">
          <h3 className="text-red-400 font-semibold mb-2">❌ "Siswa tidak ditemukan" saat scan</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Pastikan NIS di barcode sama persis dengan NIS di data siswa</li>
            <li>• Cek apakah data siswa sudah diinput di menu "Data Siswa"</li>
            <li>• Perhatikan huruf besar/kecil (case-sensitive)</li>
            <li>• Cek apakah ada spasi di awal/akhir barcode</li>
          </ul>
        </div>

        <div className="bg-gray-800 rounded-xl p-5">
          <h3 className="text-red-400 font-semibold mb-2">❌ Notifikasi WhatsApp tidak terkirim</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Pastikan fitur WhatsApp sudah diaktifkan di pengaturan</li>
            <li>• Cek API Key sudah benar (copy-paste tanpa spasi)</li>
            <li>• Pastikan nomor orang tua format internasional (62xxx)</li>
            <li>• Cek koneksi internet aktif</li>
            <li>• Untuk Fonnte: pastikan device masih connected (scan QR ulang jika perlu)</li>
            <li>• Cek log notifikasi di menu "Notifikasi WhatsApp"</li>
          </ul>
        </div>

        <div className="bg-gray-800 rounded-xl p-5">
          <h3 className="text-red-400 font-semibold mb-2">❌ Data hilang setelah pindah perangkat</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Data tersimpan di browser masing-masing perangkat</li>
            <li>• Gunakan fitur <strong>"Export JSON"</strong> di perangkat lama</li>
            <li>• Gunakan fitur <strong>"Import JSON"</strong> di perangkat baru</li>
            <li>• Lakukan backup rutin untuk mencegah kehilangan data</li>
          </ul>
        </div>

        <div className="bg-gray-800 rounded-xl p-5">
          <h3 className="text-red-400 font-semibold mb-2">❌ Aplikasi tidak bisa diakses dari HP</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• Pastikan komputer server dan HP terhubung WiFi yang sama</li>
            <li>• Cek IP Address komputer server (ipconfig/ifconfig)</li>
            <li>• Pastikan firewall tidak memblokir port 3000</li>
            <li>• Jika pakai Netlify/Vercel, pastikan ada koneksi internet</li>
            <li>• Coba akses via IP Address, bukan localhost</li>
          </ul>
        </div>

        <div className="bg-gray-800 rounded-xl p-5">
          <h3 className="text-yellow-400 font-semibold mb-2">⚠️ Tips Penting</h3>
          <ul className="text-sm text-gray-300 space-y-2">
            <li>• <strong>Backup rutin:</strong> Export data setiap hari/minggu</li>
            <li>• <strong>Gunakan Chrome:</strong> Kompatibilitas terbaik dengan scanner</li>
            <li>• <strong>Jangan clear browser data:</strong> Data akan hilang!</li>
            <li>• <strong>Update berkala:</strong> Deploy versi terbaru dari build</li>
            <li>• <strong>Test dulu:</strong> Coba semua fitur sebelum hari-H</li>
          </ul>
        </div>
      </div>

      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
        <h3 className="text-emerald-400 font-semibold mb-2">💬 Butuh Bantuan?</h3>
        <p className="text-sm text-gray-300">
          Jika masih mengalami kendala, pastikan:
        </p>
        <ul className="text-sm text-gray-300 space-y-1 mt-2">
          <li>✓ Browser yang digunakan: Chrome/Edge versi terbaru</li>
          <li>✓ Scanner sudah terdeteksi di Device Manager</li>
          <li>✓ Koneksi internet stabil (untuk notifikasi WA)</li>
          <li>✓ Data siswa/guru sudah diinput dengan benar</li>
        </ul>
      </div>
    </div>
  );
}
