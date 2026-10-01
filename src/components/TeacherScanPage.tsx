import { useState, useEffect, useRef, useCallback } from 'react';
import { findTeacherByNip, addTeacherAttendance, getTeacherAttendance, getTodayString, formatTime, generateId } from '../store';
import { Teacher, TeacherAttendanceRecord } from '../types';
import { ScanBarcode, CheckCircle, XCircle, AlertCircle, Clock, User, Hash, LogIn, LogOut, GraduationCap } from 'lucide-react';

export default function TeacherScanPage() {
  const [inputValue, setInputValue] = useState('');
  const [lastScanned, setLastScanned] = useState<Teacher | null>(null);
  const [lastRecord, setLastRecord] = useState<TeacherAttendanceRecord | null>(null);
  const [todayRecords, setTodayRecords] = useState<TeacherAttendanceRecord[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualStatus, setManualStatus] = useState<'hadir' | 'izin' | 'sakit' | 'alpha' | 'tugas'>('hadir');
  const [absenType, setAbsenType] = useState<'masuk' | 'pulang'>('masuk');
  const inputRef = useRef<HTMLInputElement>(null);
  const bufferRef = useRef('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const today = getTodayString();

  useEffect(() => { refreshTodayRecords(); }, []);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const refreshTodayRecords = () => {
    const records = getTeacherAttendance().filter(r => r.date === today);
    setTodayRecords(records);
  };

  const processScan = useCallback((nip: string) => {
    if (!nip.trim()) return;
    const teacher = findTeacherByNip(nip.trim());
    if (!teacher) {
      setMessage({ type: 'error', text: `Guru dengan NIP "${nip}" tidak ditemukan!` });
      setLastScanned(null);
      setLastRecord(null);
      playSound('error');
      return;
    }

    const alreadyScanned = todayRecords.find(r => r.teacherId === teacher.id && r.type === absenType);
    if (alreadyScanned) {
      setMessage({ type: 'warning', text: `${teacher.name} sudah absen ${absenType} hari ini pada ${alreadyScanned.time}` });
      setLastScanned(teacher);
      setLastRecord(alreadyScanned);
      playSound('warning');
      return;
    }

    const now = new Date();
    const record: TeacherAttendanceRecord = {
      id: generateId(),
      teacherId: teacher.id,
      teacherName: teacher.name,
      subject: teacher.subject,
      date: today,
      time: formatTime(now),
      status: 'hadir',
      method: 'barcode',
      type: absenType,
    };

    addTeacherAttendance(record);
    setLastScanned(teacher);
    setLastRecord(record);
    setMessage({ type: 'success', text: `${teacher.name} (${teacher.subject}) berhasil absen ${absenType}!` });
    refreshTodayRecords();
    playSound('success');
  }, [today, todayRecords, absenType]);

  const handleManualAbsen = () => {
    if (!inputValue.trim()) { setMessage({ type: 'error', text: 'Masukkan NIP guru!' }); return; }
    const teacher = findTeacherByNip(inputValue.trim());
    if (!teacher) { setMessage({ type: 'error', text: `Guru dengan NIP "${inputValue}" tidak ditemukan!` }); return; }
    const alreadyScanned = todayRecords.find(r => r.teacherId === teacher.id && r.type === absenType);
    if (alreadyScanned) { setMessage({ type: 'warning', text: `${teacher.name} sudah absen ${absenType} hari ini!` }); return; }

    const now = new Date();
    const record: TeacherAttendanceRecord = {
      id: generateId(),
      teacherId: teacher.id,
      teacherName: teacher.name,
      subject: teacher.subject,
      date: today,
      time: formatTime(now),
      status: manualStatus,
      method: 'manual',
      type: absenType,
    };
    addTeacherAttendance(record);
    setLastScanned(teacher);
    setLastRecord(record);
    setMessage({ type: 'success', text: `${teacher.name} absen ${absenType} - ${manualStatus.toUpperCase()}` });
    setInputValue('');
    refreshTodayRecords();
    playSound('success');
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (manualMode && document.activeElement === inputRef.current) return;
      if (e.key === 'Enter') {
        e.preventDefault();
        const nip = bufferRef.current;
        if (nip.length > 0) { processScan(nip); bufferRef.current = ''; setInputValue(''); }
        return;
      }
      if (e.key.length === 1) {
        bufferRef.current += e.key;
        setInputValue(bufferRef.current);
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          if (bufferRef.current.length > 2) processScan(bufferRef.current);
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
      osc.frequency.value = type === 'success' ? 800 : type === 'error' ? 200 : 500;
      gain.gain.value = 0.3;
      osc.start();
      osc.stop(ctx.currentTime + (type === 'error' ? 0.3 : 0.15));
    } catch (e) { /* */ }
  };

  const masukRecords = todayRecords.filter(r => r.type === 'masuk');
  const pulangRecords = todayRecords.filter(r => r.type === 'pulang');
  const hadirCount = masukRecords.filter(r => r.status === 'hadir').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <GraduationCap className="text-purple-400" />
          Scan Absensi Guru
        </h1>
        <p className="text-gray-400 mt-1">Scan barcode guru menggunakan CASHCOW HC-P10 USB</p>
      </div>

      {/* Absen Type Toggle */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <div className="flex items-center gap-4">
          <span className="text-gray-400 text-sm">Tipe Absen:</span>
          <div className="flex bg-gray-800 rounded-xl overflow-hidden">
            <button onClick={() => setAbsenType('masuk')}
              className={`px-5 py-2.5 text-sm font-medium flex items-center gap-2 transition-all ${absenType === 'masuk' ? 'bg-purple-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              <LogIn size={16} /> Masuk
            </button>
            <button onClick={() => setAbsenType('pulang')}
              className={`px-5 py-2.5 text-sm font-medium flex items-center gap-2 transition-all ${absenType === 'pulang' ? 'bg-indigo-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              <LogOut size={16} /> Pulang
            </button>
          </div>
        </div>
      </div>

      {/* Scanner Status */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${absenType === 'masuk' ? 'bg-purple-500/20' : 'bg-indigo-500/20'}`}>
              {absenType === 'masuk' ? <LogIn className="text-purple-400" size={24} /> : <LogOut className="text-indigo-400" size={24} />}
            </div>
            <div>
              <p className="text-white font-semibold">Mode Absen Guru {absenType === 'masuk' ? 'Masuk' : 'Pulang'}</p>
              <p className="text-sm text-gray-400">Arahkan barcode ke scanner atau ketik NIP</p>
            </div>
          </div>
          <div className="md:ml-auto flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse" />
            <span className="text-purple-400 text-sm font-medium">Ready</span>
          </div>
        </div>
        <input ref={inputRef} type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} className="sr-only" autoFocus />
      </div>

      {/* Message */}
      {message && (
        <div className={`rounded-xl p-4 flex items-center gap-3 ${
          message.type === 'success' ? 'bg-purple-500/10 border border-purple-500/30 text-purple-400' :
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
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${absenType === 'masuk' ? 'bg-purple-500/20' : 'bg-indigo-500/20'}`}>
              <User size={32} className={absenType === 'masuk' ? 'text-purple-400' : 'text-indigo-400'} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{lastScanned.name}</p>
              <p className="text-gray-400">{lastScanned.subject} • NIP: {lastScanned.nip}</p>
              {lastRecord && (
                <p className="text-sm mt-1">
                  <Clock size={14} className="inline mr-1" />
                  {lastRecord.time} - <span className={`font-semibold ${absenType === 'masuk' ? 'text-purple-400' : 'text-indigo-400'}`}>
                    {absenType === 'masuk' ? 'MASUK' : 'PULANG'}
                  </span>
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
          <button onClick={() => setManualMode(!manualMode)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${manualMode ? 'bg-purple-500 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {manualMode ? 'Aktif' : 'Nonaktif'}
          </button>
        </div>
        {manualMode && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Hash size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input type="text" placeholder="Masukkan NIP guru..." value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleManualAbsen(); }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none" />
              </div>
              <select value={manualStatus} onChange={(e) => setManualStatus(e.target.value as any)}
                className="bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:border-purple-500 focus:outline-none">
                <option value="hadir">Hadir</option>
                <option value="izin">Izin</option>
                <option value="sakit">Sakit</option>
                <option value="alpha">Alpha</option>
                <option value="tugas">Tugas Luar</option>
              </select>
              <button onClick={handleManualAbsen}
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-all">
                Absen
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <h3 className="text-white font-semibold mb-4">Ringkasan Guru Hari Ini ({today})</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-purple-500/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{hadirCount}</p>
            <p className="text-xs text-purple-400/70">Guru Hadir Masuk</p>
          </div>
          <div className="bg-indigo-500/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-indigo-400">{pulangRecords.length}</p>
            <p className="text-xs text-indigo-400/70">Sudah Pulang</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-400">{masukRecords.length}</p>
            <p className="text-xs text-gray-400/70">Total Absen</p>
          </div>
        </div>
        <div className="max-h-64 overflow-y-auto space-y-2">
          {todayRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Belum ada data absensi guru hari ini</p>
          ) : (
            todayRecords.slice().reverse().map((r) => (
              <div key={r.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-800/50">
                <div className="flex items-center gap-2">
                  {r.type === 'masuk' ? <LogIn size={14} className="text-purple-400" /> : <LogOut size={14} className="text-indigo-400" />}
                  <div>
                    <p className="text-sm text-white">{r.teacherName}</p>
                    <p className="text-xs text-gray-500">{r.subject}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">{r.time}</p>
                  <span className={`text-xs px-2 py-0.5 rounded ${r.type === 'masuk' ? 'bg-purple-500/20 text-purple-400' : 'bg-indigo-500/20 text-indigo-400'}`}>{r.type}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
