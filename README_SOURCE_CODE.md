# 📋 SIHADIR - Source Code Lengkap
## Sistem Absensi Digital Sekolah dengan Scanner Barcode CASHCOW HC-P10

---

## 🚀 CARA SETUP PROJECT

### Langkah 1: Buat Folder Project
```bash
mkdir sihadir
cd sihadir
```

### Langkah 2: Initialize Project
```bash
npm create vite@latest . -- --template react-ts
```

### Langkah 3: Install Dependencies
```bash
npm install
npm install xlsx lucide-react
```

### Langkah 4: Copy Semua File Berikut
Copy-paste setiap file sesuai lokasi yang tertera di bawah.

### Langkah 5: Build Project
```bash
npm run build
```

### Langkah 6: Deploy
Folder `dist/` akan terbuat. Deploy ke Netlify Drop atau hosting lainnya.

---

## 📁 STRUKTUR FOLDER

```
sihadir/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.js
└── src/
    ├── main.tsx
    ├── index.css
    ├── types.ts
    ├── store.ts
    ├── whatsapp.ts
    ├── App.tsx
    └── components/
        ├── Sidebar.tsx
        ├── Dashboard.tsx
        ├── ScanPageUnified.tsx
        ├── StudentManager.tsx
        ├── TeacherManager.tsx
        ├── MonthlyRecap.tsx
        ├── YearlyRecap.tsx
        ├── TeacherMonthlyRecap.tsx
        ├── DataManager.tsx
        ├── WhatsAppPage.tsx
        ├── SettingsPage.tsx
        └── GuidePage.tsx
```

---

## 📄 FILE 1: `package.json`

```json
{
  "name": "sihadir",
  "private": true,
  "version": "2.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "xlsx": "^0.18.5",
    "lucide-react": "^0.294.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@vitejs/plugin-react": "^4.2.1",
    "typescript": "^5.2.2",
    "vite": "^5.0.8",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
```

---

## 📄 FILE 2: `vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
})
```

---

## 📄 FILE 3: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

---

## 📄 FILE 4: `index.html`

```html
<!doctype html>
<html lang="id" class="dark">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SIHADIR - Sistem Absensi Sekolah</title>
    <meta name="description" content="Sistem Absensi Digital Sekolah dengan Scanner Barcode CASHCOW HC-P10 USB" />
    <meta name="theme-color" content="#030712" />
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📋</text></svg>" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        background-color: #030712 !important;
        color: #f3f4f6;
      }
      html.dark, html.dark body {
        background-color: #030712 !important;
        color: #f3f4f6;
      }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## 📄 FILE 5: `src/main.tsx`

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
```

---

## 📄 FILE 6: `src/index.css`

```css
@import "tailwindcss";

:root {
  color-scheme: dark;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  background-color: #030712;
  color: #f3f4f6;
}

* {
  scrollbar-width: thin;
  scrollbar-color: #374151 #111827;
}

*::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

*::-webkit-scrollbar-track {
  background: #111827;
}

*::-webkit-scrollbar-thumb {
  background: #374151;
  border-radius: 3px;
}

*::-webkit-scrollbar-thumb:hover {
  background: #4b5563;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}

select {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 0.5rem center;
  background-repeat: no-repeat;
  background-size: 1.5em 1.5em;
  padding-right: 2.5rem;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

@media print {
  body {
    background: white !important;
    color: black !important;
  }
}
```

---

## 📄 FILE 7: `src/types.ts`

```typescript
export interface Student {
  id: string;
  nis: string;
  name: string;
  className: string;
  gender: 'L' | 'P';
  phone?: string;
  address?: string;
  parentPhone?: string;
  parentName?: string;
  createdAt: string;
}

export interface Teacher {
  id: string;
  nip: string;
  name: string;
  subject: string;
  position: string;
  gender: 'L' | 'P';
  phone?: string;
  email?: string;
  address?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string;
  time: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpha';
  method: 'barcode' | 'manual';
  type: 'masuk' | 'pulang';
  parentNotified?: boolean;
}

export interface TeacherAttendanceRecord {
  id: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  date: string;
  time: string;
  status: 'hadir' | 'izin' | 'sakit' | 'alpha' | 'tugas';
  method: 'barcode' | 'manual';
  type: 'masuk' | 'pulang';
}

export interface AppData {
  students: Student[];
  teachers: Teacher[];
  attendance: AttendanceRecord[];
  teacherAttendance: TeacherAttendanceRecord[];
  settings: AppSettings;
}

export interface AppSettings {
  schoolName: string;
  schoolAddress: string;
  scanSound: boolean;
  autoDate: boolean;
  whatsappEnabled: boolean;
  whatsappApiKey: string;
  whatsappProvider: 'fonnte' | 'wablas' | 'callmebot' | 'url_scheme';
  whatsappNotifyArrival: boolean;
  whatsappNotifyDeparture: boolean;
  whatsappCustomMessage: string;
  schoolStartTime: string;
  schoolEndTime: string;
}

export type PageType = 'dashboard' | 'scan' | 'students' | 'teachers' | 'monthly' | 'yearly' | 'teacher-monthly' | 'data' | 'whatsapp' | 'settings' | 'guide';

export interface NotificationLog {
  id: string;
  date: string;
  time: string;
  recipient: string;
  recipientName: string;
  studentName: string;
  message: string;
  status: 'sent' | 'failed' | 'pending';
  type: 'arrival' | 'departure';
}
```

---

## 📄 FILE 8: `src/store.ts`

```typescript
import { Student, Teacher, AttendanceRecord, TeacherAttendanceRecord, AppSettings, AppData, NotificationLog } from './types';

const STORAGE_KEYS = {
  students: 'sihadir_students',
  teachers: 'sihadir_teachers',
  attendance: 'sihadir_attendance',
  teacherAttendance: 'sihadir_teacher_attendance',
  settings: 'sihadir_settings',
  notifications: 'sihadir_notifications',
};

const defaultSettings: AppSettings = {
  schoolName: 'SMA Negeri 1',
  schoolAddress: 'Jl. Pendidikan No. 1',
  scanSound: true,
  autoDate: true,
  whatsappEnabled: false,
  whatsappApiKey: '',
  whatsappProvider: 'fonnte',
  whatsappNotifyArrival: true,
  whatsappNotifyDeparture: true,
  whatsappCustomMessage: '',
  schoolStartTime: '07:00',
  schoolEndTime: '14:00',
};

export function getStudents(): Student[] {
  const data = localStorage.getItem(STORAGE_KEYS.students);
  return data ? JSON.parse(data) : [];
}

export function saveStudents(students: Student[]): void {
  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
}

export function addStudent(student: Student): void {
  const students = getStudents();
  students.push(student);
  saveStudents(students);
}

export function updateStudent(updated: Student): void {
  const students = getStudents();
  const idx = students.findIndex(s => s.id === updated.id);
  if (idx !== -1) {
    students[idx] = updated;
    saveStudents(students);
  }
}

export function deleteStudent(id: string): void {
  const students = getStudents().filter(s => s.id !== id);
  saveStudents(students);
}

export function findStudentByNis(nis: string): Student | undefined {
  return getStudents().find(s => s.nis.toLowerCase() === nis.toLowerCase());
}

export function getTeachers(): Teacher[] {
  const data = localStorage.getItem(STORAGE_KEYS.teachers);
  return data ? JSON.parse(data) : [];
}

export function saveTeachers(teachers: Teacher[]): void {
  localStorage.setItem(STORAGE_KEYS.teachers, JSON.stringify(teachers));
}

export function addTeacher(teacher: Teacher): void {
  const teachers = getTeachers();
  teachers.push(teacher);
  saveTeachers(teachers);
}

export function updateTeacher(updated: Teacher): void {
  const teachers = getTeachers();
  const idx = teachers.findIndex(t => t.id === updated.id);
  if (idx !== -1) {
    teachers[idx] = updated;
    saveTeachers(teachers);
  }
}

export function deleteTeacher(id: string): void {
  const teachers = getTeachers().filter(t => t.id !== id);
  saveTeachers(teachers);
}

export function findTeacherByNip(nip: string): Teacher | undefined {
  return getTeachers().find(t => t.nip.toLowerCase() === nip.toLowerCase());
}

export function getAttendance(): AttendanceRecord[] {
  const data = localStorage.getItem(STORAGE_KEYS.attendance);
  return data ? JSON.parse(data) : [];
}

export function saveAttendance(records: AttendanceRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.attendance, JSON.stringify(records));
}

export function addAttendance(record: AttendanceRecord): void {
  const records = getAttendance();
  records.push(record);
  saveAttendance(records);
}

export function getTeacherAttendance(): TeacherAttendanceRecord[] {
  const data = localStorage.getItem(STORAGE_KEYS.teacherAttendance);
  return data ? JSON.parse(data) : [];
}

export function saveTeacherAttendance(records: TeacherAttendanceRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.teacherAttendance, JSON.stringify(records));
}

export function addTeacherAttendance(record: TeacherAttendanceRecord): void {
  const records = getTeacherAttendance();
  records.push(record);
  saveTeacherAttendance(records);
}

export function getSettings(): AppSettings {
  const data = localStorage.getItem(STORAGE_KEYS.settings);
  if (data) {
    const parsed = JSON.parse(data);
    return { ...defaultSettings, ...parsed };
  }
  return defaultSettings;
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
}

export function getNotifications(): NotificationLog[] {
  const data = localStorage.getItem(STORAGE_KEYS.notifications);
  return data ? JSON.parse(data) : [];
}

export function saveNotifications(notifications: NotificationLog[]): void {
  localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(notifications));
}

export function addNotification(notification: NotificationLog): void {
  const notifications = getNotifications();
  notifications.push(notification);
  if (notifications.length > 500) {
    notifications.splice(0, notifications.length - 500);
  }
  saveNotifications(notifications);
}

export function getAllData(): AppData {
  return {
    students: getStudents(),
    teachers: getTeachers(),
    attendance: getAttendance(),
    teacherAttendance: getTeacherAttendance(),
    settings: getSettings(),
  };
}

export function importAllData(data: Partial<AppData>): void {
  if (data.students) saveStudents(data.students);
  if (data.teachers) saveTeachers(data.teachers);
  if (data.attendance) saveAttendance(data.attendance);
  if (data.teacherAttendance) saveTeacherAttendance(data.teacherAttendance);
  if (data.settings) saveSettings(data.settings);
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.students);
  localStorage.removeItem(STORAGE_KEYS.teachers);
  localStorage.removeItem(STORAGE_KEYS.attendance);
  localStorage.removeItem(STORAGE_KEYS.teacherAttendance);
  localStorage.removeItem(STORAGE_KEYS.settings);
  localStorage.removeItem(STORAGE_KEYS.notifications);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatTime(date: Date): string {
  return date.toTimeString().split(' ')[0];
}

export function getTodayString(): string {
  return formatDate(new Date());
}
```

---

## 📄 FILE 9: `src/whatsapp.ts`

```typescript
import { AppSettings, NotificationLog } from './types';
import { generateId, formatTime, addNotification } from './store';

export interface WhatsAppMessage {
  to: string;
  message: string;
  studentName: string;
  type: 'arrival' | 'departure';
}

async function sendViaFonnte(apiKey: string, to: string, message: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.fonnte.com/send', {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        target: to,
        message: message,
      }),
    });
    const data = await response.json();
    return data.status === true || data.reason === undefined;
  } catch (error) {
    console.error('Fonnte API Error:', error);
    return false;
  }
}

async function sendViaWablas(token: string, to: string, message: string): Promise<boolean> {
  try {
    const response = await fetch('https://solo.wablas.com/api/send-message', {
      method: 'POST',
      headers: {
        'Authorization': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: to,
        message: message,
      }),
    });
    const data = await response.json();
    return data.status === 'success';
  } catch (error) {
    console.error('Wablas API Error:', error);
    return false;
  }
}

async function sendViaCallMeBot(apiKey: string, to: string, message: string): Promise<boolean> {
  try {
    const url = `https://api.callmebot.com/whatsapp.php?phone=${to}&text=${encodeURIComponent(message)}&apikey=${apiKey}`;
    const response = await fetch(url);
    const text = await response.text();
    return text.includes('OK') || response.ok;
  } catch (error) {
    console.error('CallMeBot API Error:', error);
    return false;
  }
}

function sendViaUrlScheme(to: string, message: string): boolean {
  const cleanNumber = to.replace(/[^0-9]/g, '');
  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
  return true;
}

export function generateArrivalMessage(studentName: string, className: string, schoolName: string, time: string, customMsg: string): string {
  if (customMsg) {
    return customMsg
      .replace('{nama}', studentName)
      .replace('{kelas}', className)
      .replace('{sekolah}', schoolName)
      .replace('{waktu}', time)
      .replace('{tipe}', 'DATANG');
  }
  return `📋 *NOTIFIKASI ABSENSI*
━━━━━━━━━━━━━━━━━━
🏫 ${schoolName}

✅ *Siswa Telah Datang*
👤 Nama: ${studentName}
📚 Kelas: ${className}
🕐 Waktu: ${time}
📅 Tanggal: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

━━━━━━━━━━━━━━━━━━
💬 Pesan otomatis dari SIHADIR`;
}

export function generateDepartureMessage(studentName: string, className: string, schoolName: string, time: string, customMsg: string): string {
  if (customMsg) {
    return customMsg
      .replace('{nama}', studentName)
      .replace('{kelas}', className)
      .replace('{sekolah}', schoolName)
      .replace('{waktu}', time)
      .replace('{tipe}', 'PULANG');
  }
  return `📋 *NOTIFIKASI ABSENSI*
━━━━━━━━━━━━━━━━━━
🏫 ${schoolName}

🏠 *Siswa Telah Pulang*
👤 Nama: ${studentName}
📚 Kelas: ${className}
🕐 Waktu: ${time}
📅 Tanggal: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

━━━━━━━━━━━━━━━━━━
💬 Pesan otomatis dari SIHADIR`;
}

export async function sendWhatsAppNotification(
  settings: AppSettings,
  msg: WhatsAppMessage
): Promise<boolean> {
  const { whatsappProvider, whatsappApiKey } = settings;

  let success = false;

  switch (whatsappProvider) {
    case 'fonnte':
      success = await sendViaFonnte(whatsappApiKey, msg.to, msg.message);
      break;
    case 'wablas':
      success = await sendViaWablas(whatsappApiKey, msg.to, msg.message);
      break;
    case 'callmebot':
      success = await sendViaCallMeBot(whatsappApiKey, msg.to, msg.message);
      break;
    case 'url_scheme':
      success = sendViaUrlScheme(msg.to, msg.message);
      break;
    default:
      success = sendViaUrlScheme(msg.to, msg.message);
  }

  const notification: NotificationLog = {
    id: generateId(),
    date: new Date().toISOString().split('T')[0],
    time: formatTime(new Date()),
    recipient: msg.to,
    recipientName: '',
    studentName: msg.studentName,
    message: msg.message,
    status: success ? 'sent' : 'failed',
    type: msg.type,
  };

  addNotification(notification);
  return success;
}

export async function testWhatsAppConnection(settings: AppSettings, testNumber: string): Promise<{ success: boolean; message: string }> {
  const testMsg = `🔔 *Test Koneksi SIHADIR*
━━━━━━━━━━━━━━━━━━
Koneksi WhatsApp API berhasil!
Provider: ${settings.whatsappProvider}
Waktu: ${new Date().toLocaleString('id-ID')}
━━━━━━━━━━━━━━━━━━`;

  try {
    const success = await sendWhatsAppNotification(settings, {
      to: testNumber,
      message: testMsg,
      studentName: 'Test',
      type: 'arrival',
    });

    return {
      success,
      message: success ? 'Pesan test berhasil dikirim!' : 'Gagal mengirim pesan. Periksa API Key dan nomor tujuan.',
    };
  } catch (error) {
    return {
      success: false,
      message: 'Error: ' + (error as Error).message,
    };
  }
}
```

---

## 📄 FILE 10: `src/App.tsx`

```tsx
import { useState, useEffect } from 'react';
import { PageType } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ScanPageUnified from './components/ScanPageUnified';
import StudentManager from './components/StudentManager';
import TeacherManager from './components/TeacherManager';
import TeacherMonthlyRecap from './components/TeacherMonthlyRecap';
import MonthlyRecap from './components/MonthlyRecap';
import YearlyRecap from './components/YearlyRecap';
import DataManager from './components/DataManager';
import WhatsAppPage from './components/WhatsAppPage';
import SettingsPage from './components/SettingsPage';
import GuidePage from './components/GuidePage';
import { Menu, X } from 'lucide-react';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentPage} />;
      case 'scan': return <ScanPageUnified />;
      case 'students': return <StudentManager />;
      case 'teachers': return <TeacherManager />;
      case 'monthly': return <MonthlyRecap />;
      case 'yearly': return <YearlyRecap />;
      case 'teacher-monthly': return <TeacherMonthlyRecap />;
      case 'data': return <DataManager />;
      case 'whatsapp': return <WhatsAppPage />;
      case 'settings': return <SettingsPage />;
      case 'guide': return <GuidePage />;
      default: return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page: PageType) => { setCurrentPage(page); setSidebarOpen(false); }}
        />
      </div>

      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <div className="lg:hidden flex items-center justify-between p-4 bg-gray-900 border-b border-gray-800">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-300 hover:text-white">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-lg font-bold text-emerald-400">SIHADIR</h1>
          <div className="w-6" />
        </div>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
```

---

Karena file-file komponen sangat banyak dan panjang, saya akan membuat file terpisah untuk setiap komponen. Mari saya lanjutkan dengan membuat file-file komponen:

<tool_call>