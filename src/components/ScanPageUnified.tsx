import { useState, useEffect, useRef, useCallback } from 'react';
import { findStudentByNis, findTeacherByNip, addAttendance, addTeacherAttendance, getAttendance, getTeacherAttendance, getTodayString, formatTime, generateId, getSettings } from '../store';
import { Student, Teacher, AttendanceRecord, TeacherAttendanceRecord } from '../types';
import { sendWhatsAppNotification, generateArrivalMessage, generateDepartureMessage } from '../whatsapp';
import { ScanBarcode, CheckCircle, XCircle, AlertCircle, Clock, User, Hash, LogIn, LogOut, MessageCircle, Users, GraduationCap } from 'lucide-react';

type ScannedPerson = 
  | { type: 'student'; data: Student; record: AttendanceRecord }
  | { type: 'teacher'; data: Teacher; record: TeacherAttendanceRecord };

export default function ScanPageUnified() {
  const [inputValue, setInputValue] = useState('');
  const [lastScanned, setLastScanned] = useState<ScannedPerson | null>(null);
  const [todayStudentRecords, setTodayStudentRecords] = useState<AttendanceRecord[]>([]);
  const [todayTeacherRecords, setTodayTeacherRecords] = useState<TeacherAttendanceRecord[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string; personType?: 'student' | 'teacher' } | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualStatus, setManualStatus] = useState<'hadir' | 'izin' | 'sakit' | 'alpha' | 'tugas'>('hadir');
  const [absenType, setAbsenType] = useState<'masuk' | 'pulang'>('masuk');
  const [notifStatus, setNotifStatus] = useState<string>('');
  const [filterTab, setFilterTab] = useState<'all' | 'student' | 'teacher'>('all');
  
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
    const studentRecords = getAttendance().filter(r => r.date === today);
    const teacherRecords = getTeacherAttendance().filter(r => r.date === today);
    setTodayStudentRecords(studentRecords);
    setTodayTeacherRecords(teacherRecords);
  };

  const sendNotif = async (student: Student, type: 'masuk' | 'pulang') => {
    if (!settings.whatsappEnabled || !student.parentPhone) return;

    const shouldNotify = type === 'masuk' ? settings.whatsappNotifyArrival : settings.whatsappNotifyDeparture;
    if (!shouldNotify) return;

    setNotifStatus('Mengirim notifikasi WA...');
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

    setNotifStatus(success ? '✓ Notifikasi WA terkirim ke orang tua' : '✗ Gagal mengirim notifikasi WA');
    setTimeout(() => setNotifStatus(''), 5000);
  };

  const processScan = useCallback((code: string) => {
    if (!code.trim()) return;

    const trimmedCode = code.trim();

    // Try to find as student first
    const student = findStudentByNis(trimmedCode);
    if (student) {
      // Check if already scanned for this type today
      const alreadyScanned = todayStudentRecords.find(r => r.studentId === student.id && r.type === absenType);
      if (alreadyScanned) {
        setMessage({ 
          type: 'warning', 
          text: `${student.name} (Siswa) sudah absen ${absenType} hari ini pada ${alreadyScanned.time}`,
          personType: 'student'
        });
        setLastScanned({ type: 'student', data: student, record: alreadyScanned });
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
      setLastScanned({ type: 'student', data: student, record });
      setMessage({ 
        type: 'success', 
        text: `✓ ${student.name} (Siswa - ${student.className}) berhasil absen ${absenType}!`,
        personType: 'student'
      });
      refreshTodayRecords();
      playSound('success');

      // Send WhatsApp notification
      sendNotif(student, absenType);
      return;
    }

    // Try to find as teacher
    const teacher = findTeacherByNip(trimmedCode);
    if (teacher) {
      const alreadyScanned = todayTeacherRecords.find(r => r.teacherId === teacher.id && r.type === absenType);
      if (alreadyScanned) {
        setMessage({ 
          type: 'warning', 
          text: `${teacher.name} (Guru) sudah absen ${absenType} hari ini pada ${alreadyScanned.time}`,
          personType: 'teacher'
        });
        setLastScanned({ type: 'teacher', data: teacher, record: alreadyScanned });
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
      setLastScanned({ type: 'teacher', data: teacher, record });
      setMessage({ 
        type: 'success', 
        text: `✓ ${teacher.name} (Guru - ${teacher.subject}) berhasil absen ${absenType}!`,
        personType: 'teacher'
      });
      refreshTodayRecords();
      playSound('success');
      return;
    }

    // Not found
    setMessage({ 
      type: 'error', 
      text: `❌ Kode "${trimmedCode}" tidak ditemukan! Bukan NIS siswa atau NIP guru.`,
    });
    setLastScanned(null);
    playSound('error');
  }, [today, todayStudentRecords, todayTeacherRecords, absenType, settings]);

  const handleManualAbsen = () => {
    if (!inputValue.trim()) {
      setMessage({ type: 'error', text: 'Masukkan NIS/NIP!' });
      return;
    }

    const trimmedCode = inputValue.trim();
    const student = findStudentByNis(trimmedCode);
    
    if (student) {
      const alreadyScanned = todayStudentRecords.find(r => r.studentId === student.id && r.type === absenType);
      if (alreadyScanned) {
        setMessage({ type: 'warning', text: `${student.name} sudah absen ${absenType} hari ini!`, personType: 'student' });
        return;
      }

      const now = new Date();
      const studentStatus = manualStatus === 'tugas' ? 'hadir' : manualStatus;
      const record: AttendanceRecord = {
        id: generateId(),
        studentId: student.id,
        studentName: student.name,
        className: student.className,
        date: today,
        time: formatTime(now),
        status: studentStatus,
        method: 'manual',
        type: absenType,
        parentNotified: false,
      };

      addAttendance(record);
      setLastScanned({ type: 'student', data: student, record });
      setMessage({ type: 'success', text: `✓ ${student.name} absen ${absenType} - ${manualStatus.toUpperCase()}`, personType: 'student' });
      setInputValue('');
      refreshTodayRecords();
      playSound('success');
      sendNotif(student, absenType);
      return;
    }

    const teacher = findTeacherByNip(trimmedCode);
    if (teacher) {
      const alreadyScanned = todayTeacherRecords.find(r => r.teacherId === teacher.id && r.type === absenType);
      if (alreadyScanned) {
        setMessage({ type: 'warning', text: `${teacher.name} sudah absen ${absenType} hari ini!`, personType: 'teacher' });
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
        status: (manualStatus === 'tugas' ? 'tugas' : manualStatus) as 'hadir' | 'izin' | 'sakit' | 'alpha' | 'tugas',
        method: 'manual',
        type: absenType,
      };

      addTeacherAttendance(record);
      setLastScanned({ type: 'teacher', data: teacher, record });
      setMessage({ type: 'success', text: `✓ ${teacher.name} absen ${absenType} - ${manualStatus.toUpperCase()}`, personType: 'teacher' });
      setInputValue('');
      refreshTodayRecords();
      playSound('success');
      return;
    }

    setMessage({ type: 'error', text: `Kode "${trimmedCode}" tidak ditemukan!` });
  };

  // USB Barcode Scanner input handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (manualMode && document.activeElement === inputRef.current) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        const code = bufferRef.current;
        if (code.length > 0) {
          processScan(code);
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

  // Stats
  const studentMasuk = todayStudentRecords.filter(r => r.type === 'masuk');
  const studentPulang = todayStudentRecords.filter(r => r.type === 'pulang');
  const teacherMasuk = todayTeacherRecords.filter(r => r.type === 'masuk');
  const teacherPulang = todayTeacherRecords.filter(r => r.type === 'pulang');

  // Combined records for display
  const allRecords = [
    ...todayStudentRecords.map(r => ({ ...r, personType: 'student' as const, name: r.studentName, detail: r.className })),
    ...todayTeacherRecords.map(r => ({ ...r, personType: 'teacher' as const, name: r.teacherName, detail: r.subject })),
  ].sort((a, b) => b.time.localeCompare(a.time));

  const filteredRecords = filterTab === 'all' ? allRecords : allRecords.filter(r => r.personType === filterTab);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
          <ScanBarcode className="text-emerald-400" />
          Scan Absensi
        </h1>
        <p className="text-gray-400 mt-1">Scan barcode siswa (NIS) atau guru (NIP) - otomatis terdeteksi</p>
      </div>

      {/* Absen Type Toggle */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
            <div className="sm:ml-auto flex items-center gap-2 text-emerald-400 text-sm">
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
              <p className="text-sm text-gray-400">Scan barcode NIS (Siswa) atau NIP (Guru)</p>
            </div>
          </div>
          <div className="md:ml-auto flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-sm font-medium">Scanner Ready</span>
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
              lastScanned.type === 'student' 
                ? (absenType === 'masuk' ? 'bg-emerald-500/20' : 'bg-blue-500/20')
                : (absenType === 'masuk' ? 'bg-purple-500/20' : 'bg-indigo-500/20')
            }`}>
              {lastScanned.type === 'student' 
                ? <Users size={32} className={absenType === 'masuk' ? 'text-emerald-400' : 'text-blue-400'} />
                : <GraduationCap size={32} className={absenType === 'masuk' ? 'text-purple-400' : 'text-indigo-400'} />
              }
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded ${
                  lastScanned.type === 'student' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'
                }`}>
                  {lastScanned.type === 'student' ? '👤 SISWA' : '🎓 GURU'}
                </span>
              </div>
              <p className="text-xl font-bold text-white">{lastScanned.data.name}</p>
              <p className="text-gray-400">
                {lastScanned.type === 'student' 
                  ? `${lastScanned.data.className} • NIS: ${lastScanned.data.nis}`
                  : `${lastScanned.data.subject} • NIP: ${lastScanned.data.nip}`
                }
              </p>
              <p className="text-sm mt-1">
                <Clock size={14} className="inline mr-1" />
                {lastScanned.record.time} - <span className={`font-semibold ${
                  absenType === 'masuk' ? 'text-emerald-400' : 'text-blue-400'
                }`}>{absenType === 'masuk' ? 'MASUK' : 'PULANG'}</span>
              </p>
              {lastScanned.type === 'student' && lastScanned.data.parentPhone && settings.whatsappEnabled && (
                <p className="text-xs text-gray-500 mt-1">📱 Ortu: {lastScanned.data.parentPhone}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Manual Mode */}
      <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold">Mode Manual (Input NIS/NIP)</h3>
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
                  placeholder="Masukkan NIS siswa atau NIP guru..."
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
                <option value="tugas">Tugas Luar</option>
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
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-emerald-500/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{studentMasuk.length}</p>
            <p className="text-xs text-emerald-400/70">Siswa Hadir</p>
          </div>
          <div className="bg-blue-500/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{studentPulang.length}</p>
            <p className="text-xs text-blue-400/70">Siswa Pulang</p>
          </div>
          <div className="bg-purple-500/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-purple-400">{teacherMasuk.length}</p>
            <p className="text-xs text-purple-400/70">Guru Hadir</p>
          </div>
          <div className="bg-indigo-500/10 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-indigo-400">{teacherPulang.length}</p>
            <p className="text-xs text-indigo-400/70">Guru Pulang</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterTab === 'all' ? 'bg-gray-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Semua ({allRecords.length})
          </button>
          <button
            onClick={() => setFilterTab('student')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterTab === 'student' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Siswa ({todayStudentRecords.length})
          </button>
          <button
            onClick={() => setFilterTab('teacher')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filterTab === 'teacher' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Guru ({todayTeacherRecords.length})
          </button>
        </div>

        {/* Records List */}
        <div className="max-h-96 overflow-y-auto space-y-2">
          {filteredRecords.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Belum ada data absensi hari ini</p>
          ) : (
            filteredRecords.map((r: any) => (
              <div key={r.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-gray-800/50">
                <div className="flex items-center gap-2">
                  {r.personType === 'student' 
                    ? <Users size={14} className="text-emerald-400" />
                    : <GraduationCap size={14} className="text-purple-400" />
                  }
                  {r.type === 'masuk' ? <LogIn size={12} className="text-emerald-400" /> : <LogOut size={12} className="text-blue-400" />}
                  <div>
                    <p className="text-sm text-white">{r.name}</p>
                    <p className="text-xs text-gray-500">{r.detail}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-300">{r.time}</p>
                  <div className="flex items-center gap-1 justify-end">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      r.personType === 'student' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>
                      {r.personType === 'student' ? 'Siswa' : 'Guru'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      r.type === 'masuk' ? 'bg-blue-500/20 text-blue-400' : 'bg-indigo-500/20 text-indigo-400'
                    }`}>
                      {r.type}
                    </span>
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
