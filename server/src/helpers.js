import jwt from 'jsonwebtoken';
import QRCode from 'qrcode';
import SmsLog from './models/SmsLog.js';

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });
}

export function formatTicket(ticketNumber, prefix = 'A') {
  const padded = String(ticketNumber).padStart(3, '0');
  return `${prefix}${padded}`;
}

export function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function getStartOfDayUTC() {
  const today = getTodayDateString();
  return new Date(`${today}T00:00:00.000Z`);
}

export async function sendMockSms({ to, message, relatedTicket = null, department = null }) {
  if (!to) return null;

  const log = await SmsLog.create({
    to: String(to).trim(),
    message,
    status: 'mock-sent',
    relatedTicket,
    department,
  });

  console.log(`[MOCK SMS] to=${to} | ${message}`);
  return log;
}

export function ticketJoinedMessage(patientName, ticketNumber, deptName, waitMinutes) {
  return `HospitalQ: Hi ${patientName}, ticket ${formatTicket(ticketNumber)} for ${deptName}. Est wait ~${waitMinutes} min.`;
}

export function ticketCalledMessage(ticketNumber, deptName) {
  return `HospitalQ: Ticket ${formatTicket(ticketNumber)} please go to ${deptName} now.`;
}

export function ticketDoneMessage(ticketNumber) {
  return `HospitalQ: Ticket ${formatTicket(ticketNumber)} visit complete. Thank you.`;
}

export async function generateDeptQR(deptSlug) {
  const url = `${process.env.CLIENT_URL}/queue/${deptSlug}`;
  return QRCode.toDataURL(url, {
    width: 400,
    margin: 2,
    color: {
      dark: '#0B6E4F',
      light: '#FFFFFF',
    },
  });
}