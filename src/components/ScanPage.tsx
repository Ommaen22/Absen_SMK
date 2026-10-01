import { useState, useEffect, useRef, useCallback } from 'react';
import { findStudentByNis, addAttendance, getAttendance, getTodayString, formatTime, generateId, getSettings } from '../store';
import { Student, AttendanceRecord } from '../types';
import { sendWhatsAppNotification, generateArrivalMessage, generateDepartureMessage } from '../whatsapp';
import { ScanBarcode, CheckCircle, XCircle, AlertCircle, Clock, User, Hash, LogIn, LogOut, MessageCircle } from 'lucide-react';

export default function ScanPage() {
  const [inputValue, setInputValue] = useState('');
  const [lastScanned, setLastScanned] = useState<Student | null>(null);
  const [lastRecord, setLastRecord] = useState<AttendanceRecord | null>(null);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualStatus, setManualStatus] = useState<'hadir' | 'izin' | 'sakit' | 'alpha'>('hadir');
  const [absenType, setAbsenType] = useState<'masuk' | 'pulang'>('masuk');
  const [notifStatus, setNotifStatus] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);
  const bufferRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const today = getTodayString();
  const settings = getSettings();

  useEffect(() => {
    refreshTodayRecords();
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const refreshTodayRecords = () => {
    const records = getAttendance().filter(r => r.date === today);
    setTodayRecords(records);
  };

  const sendNotif = async (student: Student, type: 'masuk' | 'pulang') => {
    if (!settings.whatsappEnabled || !student.parentPhone) return;

    const shouldNotify = type === 'masuk' ? settings.whatsappNotifyArrival : settings.whatsappNotifyDeparture;
    if (!shouldNotify) return;

    setNotifStatus('Mengirim notifikasi...');
    const time = formatTime(new Date());
    const msg = type === 'masuk'
      ? generateArrivalMessage(student.name, student.className, settings.schoolName, time, settings.whatsappCustomMessage)
      : generateDepartureMessage(student.name, student.className, settings.schoolName, time, settings.whatsappCustomMessage);

    const success = await sendWhatsAppNotification(settings, {
      to: student.parentPhone,
      message: msg,
      studentName: student.name,
      type: type === 'masuk' ? 'arrival' : 'departure',
    });

    setNotifStatus(success ? '✓ Notifikasi terkirim ke orang tua' : '✗ Gagal mengirim notifikasi');
    setTimeout(() => setNotifStatus(''), 5000);
  };

  const processScan = useCallback((nis: string) => {
    if (!nis.trim()) return;

    const student = findStudentByNis(nis.trim());
    if (!student) {
      setMessage({ type: 'error', text: `Siswa dengan NIS "${nis}" tidak ditemukan!` });
      setLastScanned(null);
      setLastRecord(null);
      playSound('error');
      return;
    }

    // Check if already scanned for this type today
    const alreadyScanned = todayRecords.find(r => r.studentId === student.id && r.type === absenType);
    if (alreadyScanned) {
      setMessage({ type: 'warning', text: `${student.name} sudah absen ${absenType} hari ini pada ${alreadyScanned.time}` });
      setLastScanned(student);
      setLastRecord(alreadyScanned);
      playSound('warning');
      return;
    }

    const now = new Date();
    const record: AttendanceRecord = {
      id: generateId(),
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      date: today,
      time: formatTime(now),
      status: 'hadir',
      method: 'barcode',
      type: absenType,
      parentNotified: false,
    };

    addAttendance(record);
    setLastScanned(student);
    setLastRecord(record);
    setMessage({ type: 'success', text: `${student.name} (${student.className}) berhasil absen ${absenType}!` });
    refreshTodayRecords();
    playSound('success');

    // Send WhatsApp notification
    sendNotif(student, absenType);
  }, [today, todayRecords, absenType, settings]);

  const handleManualAbsen = () => {
    if (!inputValue.trim()) {
      setMessage({ type: 'error', text: 'Masukkan NIS siswa!' });
      return;
    }

    const student = findStudentByNis(inputValue.trim());
    if (!student) {
      setMessage({ type: 'error', text: `Siswa dengan NIS "${inputValue}" tidak ditemukan!` });
      return;
    }

    const alreadyScanned = todayRecords.find(r => r.studentId === student.id && r.type === absenType);
    if (alreadyScanned) {
      setMessage({ type: 'warning', text: `${student.name} sudah absen ${absenType} hari ini!` });
      return;
    }

    const now = new Date();
    const record: AttendanceRecord = {
      id: generateId(),
      studentId: student.id,
      studentName: student.name,
      className: student.className,
      date: today,
      time: formatTime(now),
      status: manualStatus,
      method: 'manual',
      type: absenType,
      parentNotified: false,
    };

    addAttendance(record);
    setLastScanned(student);
    setLastRecord(record);
    setMessage({ type: 'success', text: `${student.name} absen ${absenType} - ${manualStatus.toUpperCase()}` });
    setInputValue('');
    refreshTodayRecords();
    playSound('success');

    // Send WhatsApp notification
    sendNotif(student, absenType);
  };

  // USB Barcode Scanner input handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (manualMode && document.activeElement === inputRef.current) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        const nis = bufferRef.current;
        if (nis.length > 0) {
          processScan(nis);
          bufferRef.current = '';
          setInputValue('');
        }
        return;
      }

      if (e.key.length === 1) {
        bufferRef.current += e.key;
        setInputValue(bufferRef.current);

        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          if (bufferRef.current.length > 2) {
            processScan(bufferRef.current);
          }
          bufferRef.current = '';
          setInputValue('');
        }, 100);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [processScan, manualMode]);

  const playSound = (type: 'success' | 'error' | 'warning') => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'success') {
        osc.frequency.value = 800;
        gain.gain.value = 0.3;
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'error') {
        osc.frequency.value = 200;
        gain.gain.value = 0.3;
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        osc.frequency.value = 500;
        gain.gain.value = 0.2;
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch (e) { /* Audio not supported */ }
  };

  const masukRecords = todayRecords.filter(r => r.type === 'masuk');
  const pulangRecords = todayRecords.filter(r => r.type === 'pulang');
  const hadirCount = masukRecords.filter(r => r.status === 'hadir').length;
  const izinCount = masukRecords.filter(r => r.status === 'izin').length;
  const sakitCount = masukRecords.filter(r => r.status === 'sakit').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <ScanBarcode className="text-emerald-400" />
          Scan Absensi Siswa
        </h1>
        <p className="text-gray-400 mt-1">Scan barcode siswa menggunakan CASHCOW HC-P10 USB</p>
      </div>

      {/* Absen Type Toggle */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Tipe Absen:</span>
          <div className="flex bg-gray-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setAbsenType('masuk')}
              className={`px-5 py-2.5 text-sm font-medium flex items-center gap-2 transition-all ${
                absenType === 'masuk' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <LogIn size={16} /> Masuk
            </button>
            <button
              onClick={() => setAbsenType('pulang')}
              className={`px-5 py-2.5 text-sm font-medium flex items-center gap-2 transition-all ${
                absenType === 'pulang' ? 'bg-blue-500 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <LogOut size={16} /> Pulang
            </button>
          </div>
          {settings.whatsappEnabled && (
            <div className="ml-auto flex items-center gap-2 text-emerald-400 text-sm">
              <MessageCircle size={16} />
              <span>Notif WA Aktif</span>
            </div>
          )}
        </div>
      </div>

      {/* Scanner Status */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              absenType === 'masuk' ? 'bg-emerald-500/20' : 'bg-blue-500/20'
            }`}>
              {absenType === 'masuk' ? <LogIn className="text-emerald-400" size={24} /> : <LogOut className="text-blue-400" size={24} />}
            </div>
            <div>
              <p className="text-white font-semibold">Mode Absen {absenType === 'masuk' ? 'Masuk' : 'Pulang'}</p>
              <p className="text-sm text-gray-400">Arahkan barcode ke scanner atau ketik NIS</p>
            </div>
          </div>
          <div className="md:ml-auto flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">Ready</span>
          </div>
        </div>
        <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="sr-only" autoFocus />
      </div>

      {/* Notification Status */}
      {notifStatus && (
        <div className={`rounded-xl p-3 flex items-center gap-2 text-sm ${
          notifStatus.includes('✓') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
          notifStatus.includes('✗') ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
          'bg-blue-500/10 text-blue-400 border border-blue-500/30'
        }`}>
          <MessageCircle size={16} />
          {notifStatus}
        </div>
      )}

      {/* Message */}
      {message && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${
          message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' :
          message.type === 'error' ? 'bg-red-500/10 border border-red-500/30 text-red-400' :
          'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
        }`}>
          {message.type === 'success' && <CheckCircle size={20} />}
          {message.type === 'error' && <XCircle size={20} />}
          {message.type === 'warning' && <AlertCircle size={20} />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Last Scanned */}
      {lastScanned && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h3 className="text-sm text-gray-400 mb-3">Terakhir Discan</h3>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              absenType === 'masuk' ? 'bg-emerald-500/20' : 'bg-blue-500/20'
            }`}>
              <User size={32} className={absenType === 'masuk' ? 'text-emerald-400' : 'text-blue-400'} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{lastScanned.name}</p>
              <p className="text-gray-400">{lastScanned.className} • NIS: {lastScanned.nis}</p>
              {lastRecord && (
                <p className="text-sm mt-1">
                  <Clock size={14} className="inline mr-1" />
                  {lastRecord.time} - <span className={`font-semibold ${
                    absenType === 'masuk' ? 'text-emerald-400' : 'text-blue-400'
                  }`}>{absenType === 'masuk' ? 'MASUK' : 'PULANG'}</span>
                </p>
              )}
              {lastScanned.parentPhone && settings.whatsappEnabled && (
                <p className="text-xs text-gray-500 mt-1">📱 Ortu: {lastScanned.parentPhone}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Mode */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Mode Manual</h3>
          <button
            onClick={() => setManualMode(!manualMode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              manualMode ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {manualMode ? 'Aktif' : 'Nonaktif'}
          </button>
        </div>

        {manualMode && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Masukkan NIS siswa..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleManualAbsen(); }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-emerald-500 focus:outline-none"
                />
              </div>
              <select
                value={manualStatus}
                onChange={(e) => setManualStatus(e.target.value as any)}
                className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="hadir">Hadir</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
                <option value="alpha">Alpha</option>
              </select>
              <button
                onClick={handleManualAbsen}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Absen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Today's Summary */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4">Ringkasan Hari Ini ({today})</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-emerald-500/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{hadirCount}</p>
            <p className="text-xs text-emerald-400/70">Hadir Masuk</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{izinCount}</p>
            <p className="text-xs text-yellow-400/70">Izin</p>
          </div>
          <div className="bg-orange-500/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">{sakitCount}</p>
            <p className="text-xs text-orange-400/70">Sakit</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{pulangRecords.length}</p>
            <p className="text-xs text-blue-400/70">Sudah Pulang</p>
          </div>
        </div>

        {/* Today's records */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {todayRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Belum ada data absensi hari ini</p>
          ) : (
            todayRecords.slice().reverse().map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-800/50">
                <div className="flex items-center gap-2">
                  {r.type === 'masuk' ? <LogIn size={14} className="text-emerald-400" /> : <LogOut size={14} className="text-blue-400" />}
                  <div>
                    <p className="text-sm text-white">{r.studentName}</p>
                    <p className="text-xs text-gray-500">{r.className}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">{r.time}</p>
                  <div className="flex items-center gap-1 justify-end">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      r.type === 'masuk' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                    }`}>{r.type}</span>
                    {r.parentNotified && <MessageCircle size={12} className="text-green-400" />}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
