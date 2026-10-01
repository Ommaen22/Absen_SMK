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

// Students
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

// Teachers
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

// Student Attendance
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

// Teacher Attendance
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

// Settings
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

// Notifications
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
  // Keep only last 500 notifications
  if (notifications.length > 500) {
    notifications.splice(0, notifications.length - 500);
  }
  saveNotifications(notifications);
}

// All Data
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
