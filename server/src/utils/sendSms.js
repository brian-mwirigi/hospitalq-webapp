import SmsLog from '../models/SmsLog.js';
import { formatTicket } from './ticketFormatter.js';

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
