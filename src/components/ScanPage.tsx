import { useState, useEffect, useRef, useCallback } from 'react';
import { findStudentByNis, addAttendance, getAttendance, getTodayString, formatTime, generateId } from '../store';
import { Student, AttendanceRecord } from '../types';
import { ScanBarcode, CheckCircle, XCircle, AlertCircle, Clock, User, Hash } from 'lucide-react';

export default function ScanPage() {
  const [inputValue, setInputValue] = useState('');
  const [lastScanned, setLastScanned] = useState<Student | null>(null);
  const [lastRecord, setLastRecord] = useState<AttendanceRecord | null>(null);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualStatus, setManualStatus] = useState<'hadir' | 'izin' | 'sakit' | 'alpha'>('hadir');
  const inputRef = useRef<HTMLInputElement>(null);
  const bufferRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const today = getTodayString();

  useEffect(() => {
    refreshTodayRecords();
  }, []);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const refreshTodayRecords = () => {
    const records = getAttendance().filter(r => r.date === today);
    setTodayRecords(records);
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

    // Check if already scanned today
    const alreadyScanned = todayRecords.find(r => r.studentId === student.id);
    if (alreadyScanned) {
      setMessage({ type: 'warning', text: `${student.name} sudah absen hari ini pada ${alreadyScanned.time}` });
      setLastScanned(student);
      setLastRecord(alreadyScanned);
      playSound('warning');
      return;
    }

    // Create attendance record
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
    };

    addAttendance(record);
    setLastScanned(student);
    setLastRecord(record);
    setMessage({ type: 'success', text: `${student.name} (${student.className}) berhasil absen!` });
    refreshTodayRecords();
    playSound('success');
  }, [today, todayRecords]);

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

    const alreadyScanned = todayRecords.find(r => r.studentId === student.id);
    if (alreadyScanned) {
      setMessage({ type: 'warning', text: `${student.name} sudah absen hari ini!` });
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
    };

    addAttendance(record);
    setLastScanned(student);
    setLastRecord(record);
    setMessage({ type: 'success', text: `${student.name} absen sebagai ${manualStatus.toUpperCase()}` });
    setInputValue('');
    refreshTodayRecords();
    playSound('success');
  };

  // USB Barcode Scanner input handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture if manual mode input is focused
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

        // Clear buffer after timeout (scanner sends characters very fast)
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          // If buffer has content but no Enter was pressed, it might be manual typing
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
    } catch (e) {
      // Audio not supported
    }
  };

  const hadirCount = todayRecords.filter(r => r.status === 'hadir').length;
  const izinCount = todayRecords.filter(r => r.status === 'izin').length;
  const sakitCount = todayRecords.filter(r => r.status === 'sakit').length;
  const alphaCount = todayRecords.filter(r => r.status === 'alpha').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <ScanBarcode className="text-emerald-400" />
          Scan Absensi
        </h1>
        <p className="text-gray-400 mt-1">Scan barcode siswa menggunakan CASHCOW HC-P10 USB atau input manual</p>
      </div>

      {/* Scanner Status */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <ScanBarcode className="text-emerald-400" size={24} />
            </div>
            <div>
              <p className="text-white font-semibold">Scanner Barcode Aktif</p>
              <p className="text-sm text-gray-400">Arahkan barcode ke scanner atau ketik NIS</p>
            </div>
          </div>
          <div className="md:ml-auto flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">Ready</span>
          </div>
        </div>

        {/* Hidden input for scanner */}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="sr-only"
          autoFocus
        />
      </div>

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
              lastRecord?.status === 'hadir' ? 'bg-emerald-500/20' :
              lastRecord?.status === 'izin' ? 'bg-yellow-500/20' :
              lastRecord?.status === 'sakit' ? 'bg-orange-500/20' : 'bg-red-500/20'
            }`}>
              <User size={32} className={
                lastRecord?.status === 'hadir' ? 'text-emerald-400' :
                lastRecord?.status === 'izin' ? 'text-yellow-400' :
                lastRecord?.status === 'sakit' ? 'text-orange-400' : 'text-red-400'
              } />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{lastScanned.name}</p>
              <p className="text-gray-400">{lastScanned.className} • NIS: {lastScanned.nis}</p>
              {lastRecord && (
                <p className="text-sm mt-1">
                  <Clock size={14} className="inline mr-1" />
                  {lastRecord.time} - <span className={`font-semibold ${
                    lastRecord.status === 'hadir' ? 'text-emerald-400' :
                    lastRecord.status === 'izin' ? 'text-yellow-400' :
                    lastRecord.status === 'sakit' ? 'text-orange-400' : 'text-red-400'
                  }`}>{lastRecord.status.toUpperCase()}</span>
                </p>
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
            <p className="text-xs text-emerald-400/70">Hadir</p>
          </div>
          <div className="bg-yellow-500/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{izinCount}</p>
            <p className="text-xs text-yellow-400/70">Izin</p>
          </div>
          <div className="bg-orange-500/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">{sakitCount}</p>
            <p className="text-xs text-orange-400/70">Sakit</p>
          </div>
          <div className="bg-red-500/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{alphaCount}</p>
            <p className="text-xs text-red-400/70">Alpha</p>
          </div>
        </div>

        {/* Today's records list */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {todayRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Belum ada data absensi hari ini</p>
          ) : (
            todayRecords.slice().reverse().map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-800/50">
                <div>
                  <p className="text-sm text-white">{r.studentName}</p>
                  <p className="text-xs text-gray-500">{r.className}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">{r.time}</p>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                    r.status === 'hadir' ? 'bg-emerald-500/20 text-emerald-400' :
                    r.status === 'izin' ? 'bg-yellow-500/20 text-yellow-400' :
                    r.status === 'sakit' ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'
                  }`}>{r.status}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
