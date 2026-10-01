import { AppSettings, NotificationLog } from './types';
import { generateId, formatTime, addNotification } from './store';

/**
 * WhatsApp Notification Service
 * 
 * Mendukung beberapa provider API gratis:
 * 1. Fonnte (fonnte.com) - Gratis 20 pesan/hari, populer di Indonesia
 * 2. Wablas (wablas.com) - Free trial
 * 3. CallMeBot (callmebot.com) - Gratis unlimited
 * 4. URL Scheme (wa.me) - Gratis, tanpa API, langsung buka WhatsApp
 */

export interface WhatsAppMessage {
  to: string; // Nomor telepon dengan format 62xxx
  message: string;
  studentName: string;
  type: 'arrival' | 'departure';
}

// Fonnte API - Gratis 20 pesan/hari
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

// Wablas API - Free trial
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

// CallMeBot - Gratis unlimited
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

// URL Scheme - Buka WhatsApp langsung (tanpa API)
function sendViaUrlScheme(to: string, message: string): boolean {
  const cleanNumber = to.replace(/[^0-9]/g, '');
  const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
  return true;
}

// Generate pesan otomatis
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

// Main send function
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

  // Log notification
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

// Test connection
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
