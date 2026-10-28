import { asyncHandler } from './helpers.js';
import { fetchWithRetry } from './resilientFetch.js';

const PARTNER_TIMEOUT_MS = 2000;
const PARTNER_RETRIES = 2;
const PARTNER_DELAY_MS = 200;
const lastGoodWorkers = new Map();

function partnerUrl() {
  return (
    process.env.PARTNER_URL ||
    process.env.QUICKFUNDI_URL ||
    'https://team12-webapp-production.up.railway.app'
  );
}

function partnerHeaders(extra = {}) {
  const headers = { ...extra };
  const key = (process.env.PARTNER_API_KEY || '').trim();
  if (key) headers['X-API-Key'] = key;
  return headers;
}

async function readQuickFundiBody(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return { message: text };
  }
}

function shapeWorkerSummary(row) {
  return {
    id: row.id,
    name: row.name,
    jobType: row.jobType,
    location: row.location,
    rating: row.rating,
    ratePerHour: row.ratePerHour,
  };
}

function shapeWorkerProfile(row) {
  return {
    ...shapeWorkerSummary(row),
    experienceYears: row.experienceYears,
    reviews: Array.isArray(row.reviews)
      ? row.reviews.map((review) => ({
          author: review.author,
          comment: review.comment,
          rating: review.rating,
        }))
      : [],
  };
}

function shapeBooking(row) {
  return {
    id: row.id,
    workerId: row.workerId,
    jobType: row.jobType,
    location: row.location,
    scheduledFor: row.scheduledFor,
    status: row.status,
  };
}

async function fetchQuickFundi(path, options = {}) {
  const url = `${partnerUrl()}${path}`;
  const method = options.method || 'GET';
  console.log('partner call', method, url, 'header names:', Object.keys(partnerHeaders(options.headers)).join(','));

  try {
    const res = await fetchWithRetry(
      url,
      {
        ...options,
        headers: partnerHeaders(options.headers),
      },
      {
        timeoutMs: PARTNER_TIMEOUT_MS,
        retries: PARTNER_RETRIES,
        delayMs: PARTNER_DELAY_MS,
      }
    );
    const body = await readQuickFundiBody(res);
    if (!res.ok) console.error('partner returned', res.status);
    return { status: res.status, body };
  } catch (err) {
    const reason =
      err.name === 'TimeoutError'
        ? 'timeout'
        : err.cause?.code || err.cause?.errors?.[0]?.code || err.message;
    console.error('partner call failed:', reason);
    return { status: 0, body: null };
  }
}

function partnerDown(res) {
  return res.status(502).json({
    success: false,
    message: 'QuickFundi is unavailable right now.',
    error: 'PARTNER_UNAVAILABLE',
  });
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
  const cacheKey = `${jobType}|${location}`;
  const upstream = await fetchQuickFundi(`/workers?${qs.toString()}`);

  if (upstream.status === 0 || upstream.status >= 500) {
    return savedWorkersOrDown(res, cacheKey);
  }

  if (upstream.status >= 400) {
    return res.status(upstream.status).json({
      success: false,
      message: upstream.body?.message || 'QuickFundi search failed.',
      error: upstream.body?.code || 'QUICKFUNDI_ERROR',
    });
  }

  if (!Array.isArray(upstream.body)) {
    console.error('partner returned', upstream.status, 'but workers was not a list');
    return savedWorkersOrDown(res, cacheKey);
  }

  const data = upstream.body.map(shapeWorkerSummary);
  const asOf = new Date().toISOString();
  lastGoodWorkers.set(cacheKey, { data, asOf });

  res.json({
    success: true,
    data,
    stale: false,
    asOf,
  });
});

function savedWorkersOrDown(res, cacheKey) {
  const saved = lastGoodWorkers.get(cacheKey);
  if (saved) {
    return res.json({
      success: true,
      data: saved.data,
      stale: true,
      asOf: saved.asOf,
    });
  }
  return partnerDown(res);
}

export const getWorker = asyncHandler(async (req, res) => {
  const upstream = await fetchQuickFundi(`/workers/${encodeURIComponent(req.params.id)}`);

  if (upstream.status === 0 || upstream.status >= 500) {
    return partnerDown(res);
  }

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
    data: shapeWorkerProfile(upstream.body),
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

  if (upstream.status === 0 || upstream.status >= 500) {
    return partnerDown(res);
  }

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
    data: shapeBooking(upstream.body || {}),
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

  if (upstream.status === 0 || upstream.status >= 500) {
    return partnerDown(res);
  }

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
    data: shapeBooking(upstream.body || {}),
  });
});
