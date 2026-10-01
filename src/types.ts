export interface Student {
  id: string;
  nis: string; // Nomor Induk Siswa - used as barcode
  name: string;
  className: string;
  gender: 'L' | 'P';
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  className: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  status: 'hadir' | 'izin' | 'sakit' | 'alpha';
  method: 'barcode' | 'manual';
}

export interface AppData {
  students: Student[];
  attendance: AttendanceRecord[];
  settings: AppSettings;
}

export interface AppSettings {
  schoolName: string;
  schoolAddress: string;
  scanSound: boolean;
  autoDate: boolean;
}

export type PageType = 'dashboard' | 'scan' | 'students' | 'monthly' | 'yearly' | 'data' | 'settings';
