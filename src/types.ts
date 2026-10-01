export interface Student {
  id: string;
  nis: string;
  name: string;
  className: string;
  gender: 'L' | 'P';
  phone?: string;
  address?: string;
  parentPhone?: string; // Nomor WhatsApp orang tua
  parentName?: string;
  createdAt: string;
}

export interface Teacher {
  id: string;
  nip: string; // Nomor Induk Pegawai
  name: string;
  subject: string; // Mata pelajaran
  position: string; // Jabatan (Guru, Kepala Sekolah, dll)
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
  type: 'masuk' | 'pulang'; // Tipe absensi: masuk atau pulang
  parentNotified?: boolean; // Apakah orang tua sudah dinotifikasi
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
  // WhatsApp settings
  whatsappEnabled: boolean;
  whatsappApiKey: string;
  whatsappProvider: 'fonnte' | 'wablas' | 'callmebot' | 'url_scheme';
  whatsappNotifyArrival: boolean;
  whatsappNotifyDeparture: boolean;
  whatsappCustomMessage: string;
  // School hours
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
