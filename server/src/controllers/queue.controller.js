import QueueEntry from '../models/QueueEntry.model.js';
import DailyCounter from '../models/DailyCounter.model.js';
import Department from '../models/Department.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getTodayDateString, getStartOfDayUTC } from '../utils/ticketFormatter.js';

async function getNextTicketNumber(departmentId) {
  const date = getTodayDateString();

  const counter = await DailyCounter.findOneAndUpdate(
    { department: departmentId, date },
    { $inc: { lastNumber: 1 } },
    { upsert: true, new: true }
  );

  return counter.lastNumber;
}

async function getActiveQueue(departmentId) {
  const queueDate = getStartOfDayUTC();

  return QueueEntry.find({
    department: departmentId,
    queueDate,
    status: { $in: ['waiting', 'in-progress'] },
  })
    .populate('doctor', 'name email')
    .populate('department', 'name slug')
    .sort({ priority: -1, createdAt: 1 });
}

async function emitQueueUpdated(req, departmentId) {
  if (!req.io) return;

  const queue = await getActiveQueue(departmentId);
  const deptId = String(departmentId);

  req.io.to(deptId).emit('queue:updated', {
    deptId,
    queue,
  });
}

export const getQueue = asyncHandler(async (req, res) => {
  const { deptId } = req.params;

  const department = await Department.findById(deptId);
  if (!department || !department.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Department not found.',
      error: 'DEPT_NOT_FOUND',
    });
  }

  const queue = await getActiveQueue(deptId);

  res.json({
    success: true,
    data: queue,
  });
});

export const addPatient = asyncHandler(async (req, res) => {
  const {
    patientName,
    department,
    priority = 'normal',
    notes = '',
    patientPhone = '',
    patientAge,
    gender,
  } = req.body;

  if (!patientName || !department) {
    return res.status(400).json({
      success: false,
      message: 'Patient name and department are required.',
      error: 'MISSING_FIELDS',
    });
  }

  const dept = await Department.findById(department);
  if (!dept || !dept.isActive) {
    return res.status(404).json({
      success: false,
      message: 'Department not found.',
      error: 'DEPT_NOT_FOUND',
    });
  }

  const ticketNumber = await getNextTicketNumber(department);
  const queueDate = getStartOfDayUTC();

  const entry = await QueueEntry.create({
    ticketNumber,
    patientName: patientName.trim(),
    patientPhone,
    patientAge: patientAge || null,
    gender: gender || null,
    department,
    priority,
    notes,
    queueDate,
    status: 'waiting',
  });

  const populated = await QueueEntry.findById(entry._id)
    .populate('department', 'name slug')
    .populate('doctor', 'name email');

  await emitQueueUpdated(req, department);

  if (req.io) {
    req.io.to(String(department)).emit('queue:entry-added', {
      entry: populated,
    });
  }

  res.status(201).json({
    success: true,
    data: populated,
    message: 'Patient added to queue',
  });
});

export const markDone = asyncHandler(async (req, res) => {
  const entry = await QueueEntry.findById(req.params.id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Queue entry not found.',
      error: 'ENTRY_NOT_FOUND',
    });
  }

  entry.status = 'done';
  entry.completedAt = new Date();
  if (!entry.doctor) {
    entry.doctor = req.user._id;
  }
  await entry.save();

  const queueDate = getStartOfDayUTC();
  const nextEntry = await QueueEntry.findOne({
    department: entry.department,
    queueDate,
    status: 'waiting',
  }).sort({ priority: -1, createdAt: 1 });

  await emitQueueUpdated(req, entry.department);

  if (req.io) {
    req.io.to(String(entry.department)).emit('queue:entry-done', {
      entryId: entry._id,
      nextEntry,
    });
  }

  const populated = await QueueEntry.findById(entry._id)
    .populate('department', 'name slug')
    .populate('doctor', 'name email');

  res.json({
    success: true,
    data: populated,
    message: 'Patient marked as done',
  });
});

export const markNoShow = asyncHandler(async (req, res) => {
  const entry = await QueueEntry.findById(req.params.id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Queue entry not found.',
      error: 'ENTRY_NOT_FOUND',
    });
  }

  entry.status = 'no-show';
  entry.completedAt = new Date();
  if (!entry.doctor) {
    entry.doctor = req.user._id;
  }
  await entry.save();

  await emitQueueUpdated(req, entry.department);

  const populated = await QueueEntry.findById(entry._id)
    .populate('department', 'name slug')
    .populate('doctor', 'name email');

  res.json({
    success: true,
    data: populated,
    message: 'Patient marked as no-show',
  });
});

export const markInProgress = asyncHandler(async (req, res) => {
  const entry = await QueueEntry.findById(req.params.id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Queue entry not found.',
      error: 'ENTRY_NOT_FOUND',
    });
  }

  if (entry.status !== 'waiting') {
    return res.status(400).json({
      success: false,
      message: 'Only waiting patients can be called.',
      error: 'INVALID_STATUS',
    });
  }

  entry.status = 'in-progress';
  entry.calledAt = new Date();
  entry.doctor = req.user._id;
  await entry.save();

  await emitQueueUpdated(req, entry.department);

  const populated = await QueueEntry.findById(entry._id)
    .populate('department', 'name slug')
    .populate('doctor', 'name email');

  res.json({
    success: true,
    data: populated,
    message: 'Patient called in',
  });
});

export const skipPatient = asyncHandler(async (req, res) => {
  const entry = await QueueEntry.findById(req.params.id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Queue entry not found.',
      error: 'ENTRY_NOT_FOUND',
    });
  }

  entry.status = 'skipped';
  entry.completedAt = new Date();
  await entry.save();

  await emitQueueUpdated(req, entry.department);

  const populated = await QueueEntry.findById(entry._id)
    .populate('department', 'name slug')
    .populate('doctor', 'name email');

  res.json({
    success: true,
    data: populated,
    message: 'Patient skipped',
  });
});

export const removePatient = asyncHandler(async (req, res) => {
  const entry = await QueueEntry.findById(req.params.id);

  if (!entry) {
    return res.status(404).json({
      success: false,
      message: 'Queue entry not found.',
      error: 'ENTRY_NOT_FOUND',
    });
  }

  if (entry.status !== 'waiting') {
    return res.status(400).json({
      success: false,
      message: 'Only waiting patients can be removed.',
      error: 'INVALID_STATUS',
    });
  }

  const departmentId = entry.department;
  await entry.deleteOne();

  await emitQueueUpdated(req, departmentId);

  res.json({
    success: true,
    data: null,
    message: 'Patient removed from queue',
  });
});

export const getStats = asyncHandler(async (req, res) => {
  const { deptId } = req.params;
  const queueDate = getStartOfDayUTC();

  const entries = await QueueEntry.find({
    department: deptId,
    queueDate,
  });

  const total = entries.length;
  const waiting = entries.filter((e) => e.status === 'waiting').length;
  const done = entries.filter((e) => e.status === 'done').length;
  const inProgress = entries.filter((e) => e.status === 'in-progress').length;

  const completedWithTimes = entries.filter(
    (e) => e.status === 'done' && e.calledAt && e.completedAt
  );

  let avgWaitMinutes = 10;
  if (completedWithTimes.length > 0) {
    const lastTen = completedWithTimes.slice(-10);
    const totalMinutes = lastTen.reduce((sum, e) => {
      const mins = (new Date(e.completedAt) - new Date(e.calledAt)) / 60000;
      return sum + mins;
    }, 0);
    avgWaitMinutes = Math.round(totalMinutes / lastTen.length) || 10;
  }

  res.json({
    success: true,
    data: {
      total,
      waiting,
      done,
      inProgress,
      avgWaitMinutes,
    },
  });
});
