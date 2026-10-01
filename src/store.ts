import { Student, AttendanceRecord, AppSettings, AppData } from './types';

const STORAGE_KEYS = {
  students: 'sihadir_students',
  attendance: 'sihadir_attendance',
  settings: 'sihadir_settings',
};

const defaultSettings: AppSettings = {
  schoolName: 'SMA Negeri 1',
  schoolAddress: 'Jl. Pendidikan No. 1',
  scanSound: true,
  autoDate: true,
};

export function getStudents(): Student[] {
  const data = localStorage.getItem(STORAGE_KEYS.students);
  return data ? JSON.parse(data) : [];
}

export function saveStudents(students: Student[]): void {
  localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(students));
}

export function getAttendance(): AttendanceRecord[] {
  const data = localStorage.getItem(STORAGE_KEYS.attendance);
  return data ? JSON.parse(data) : [];
}

export function saveAttendance(records: AttendanceRecord[]): void {
  localStorage.setItem(STORAGE_KEYS.attendance, JSON.stringify(records));
}

export function getSettings(): AppSettings {
  const data = localStorage.getItem(STORAGE_KEYS.settings);
  return data ? JSON.parse(data) : defaultSettings;
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
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

export function addAttendance(record: AttendanceRecord): void {
  const records = getAttendance();
  records.push(record);
  saveAttendance(records);
}

export function getAllData(): AppData {
  return {
    students: getStudents(),
    attendance: getAttendance(),
    settings: getSettings(),
  };
}

export function importAllData(data: AppData): void {
  if (data.students) saveStudents(data.students);
  if (data.attendance) saveAttendance(data.attendance);
  if (data.settings) saveSettings(data.settings);
}

export function clearAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.students);
  localStorage.removeItem(STORAGE_KEYS.attendance);
  localStorage.removeItem(STORAGE_KEYS.settings);
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
