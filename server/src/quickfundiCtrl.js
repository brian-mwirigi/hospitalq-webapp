import { asyncHandler } from './helpers.js';

const BASE =
  process.env.QUICKFUNDI_URL || 'https://team12-webapp-production.up.railway.app';

async function readQuickFundiBody(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { message: text };
  }
}

async function fetchQuickFundi(path, options) {
  const res = await fetch(`${BASE}${path}`, options);
  const body = await readQuickFundiBody(res);
  return { status: res.status, body };
}

export const searchWorkers = asyncHandler(async (req, res) => {
  const jobType = req.query.jobType;
  const location = req.query.location;

  if (!jobType || !location) {
    return res.status(400).json({
      success: false,
      message: 'jobType and location are required.',
      error: 'MISSING_FIELDS',
    });
  }

  const qs = new URLSearchParams({ jobType: String(jobType), location: String(location) });
  const upstream = await fetchQuickFundi(`/workers?${qs.toString()}`);

  if (upstream.status >= 400) {
    return res.status(upstream.status).json({
      success: false,
      message: upstream.body?.message || 'QuickFundi search failed.',
      error: 'QUICKFUNDI_ERROR',
      data: upstream.body,
    });
  }

  res.json({
    success: true,
    data: upstream.body,
  });
});

export const getWorker = asyncHandler(async (req, res) => {
  const upstream = await fetchQuickFundi(`/workers/${encodeURIComponent(req.params.id)}`);

  if (upstream.status === 404) {
    return res.status(404).json({
      success: false,
      message: 'Worker not found on QuickFundi.',
      error: 'WORKER_NOT_FOUND',
    });
  }

  if (upstream.status >= 400) {
    return res.status(upstream.status).json({
      success: false,
      message: upstream.body?.message || 'QuickFundi lookup failed.',
      error: 'QUICKFUNDI_ERROR',
    });
  }

  res.json({
    success: true,
    data: upstream.body,
  });
});

export const createBooking = asyncHandler(async (req, res) => {
  const { workerId, jobType, location, scheduledFor, requestedBy } = req.body || {};

  if (!workerId || !jobType || !location || !scheduledFor) {
    return res.status(400).json({
      success: false,
      message: 'workerId, jobType, location, and scheduledFor are required.',
      error: 'MISSING_FIELDS',
    });
  }

  const payload = {
    workerId: String(workerId),
    jobType: String(jobType),
    location: String(location),
    scheduledFor: String(scheduledFor),
    requestedBy: requestedBy ? String(requestedBy) : 'HospitalQ Facilities Desk',
  };

  const upstream = await fetchQuickFundi('/bookings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (upstream.status >= 400) {
    return res.status(upstream.status).json({
      success: false,
      message: upstream.body?.message || 'QuickFundi booking failed.',
      error: upstream.body?.code || 'QUICKFUNDI_ERROR',
      data: upstream.body,
    });
  }

  res.status(201).json({
    success: true,
    data: upstream.body,
    message: 'Booking created on QuickFundi',
  });
});

export const getBooking = asyncHandler(async (req, res) => {
  const id = req.params.id;
  if (!id || !String(id).trim()) {
    return res.status(400).json({
      success: false,
      message: 'Booking id is required.',
      error: 'MISSING_FIELDS',
    });
  }

  const upstream = await fetchQuickFundi(`/bookings/${encodeURIComponent(id)}`);

  if (upstream.status === 404) {
    return res.status(404).json({
      success: false,
      message: 'Booking not found on QuickFundi.',
      error: 'BOOKING_NOT_FOUND',
    });
  }

  if (upstream.status >= 400) {
    return res.status(upstream.status).json({
      success: false,
      message: upstream.body?.message || 'QuickFundi booking lookup failed.',
      error: upstream.body?.code || 'QUICKFUNDI_ERROR',
    });
  }

  res.json({
    success: true,
    data: upstream.body,
  });
});
