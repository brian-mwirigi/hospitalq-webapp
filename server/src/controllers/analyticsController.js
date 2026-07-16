import QueueEntry from '../models/QueueEntry.js';
import Department from '../models/Department.js';
import SmsLog from '../models/SmsLog.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { getStartOfDayUTC } from '../utils/ticketFormatter.js';

async function countWaiting(departmentId) {
  const queueDate = getStartOfDayUTC();
  return QueueEntry.countDocuments({
    department: departmentId,
    queueDate,
    status: 'waiting',
  });
}

export async function getAvgConsultMinutes(departmentId) {
  const queueDate = getStartOfDayUTC();
  const done = await QueueEntry.find({
    department: departmentId,
    queueDate,
    status: 'done',
    calledAt: { $ne: null },
    completedAt: { $ne: null },
  })
    .sort({ completedAt: -1 })
    .limit(10);

  if (done.length === 0) return 10;

  const total = done.reduce((sum, e) => {
    return sum + (new Date(e.completedAt) - new Date(e.calledAt)) / 60000;
  }, 0);

  return Math.max(1, Math.round(total / done.length));
}

export const getBusyOverview = asyncHandler(async (req, res) => {
  const departments = await Department.find({ isActive: true }).sort({ name: 1 });
  const queueDate = getStartOfDayUTC();

  const rows = [];
  for (const dept of departments) {
    const entries = await QueueEntry.find({ department: dept._id, queueDate });
    const waiting = entries.filter((e) => e.status === 'waiting').length;
    const inProgress = entries.filter((e) => e.status === 'in-progress').length;
    const done = entries.filter((e) => e.status === 'done').length;
    const noShow = entries.filter((e) => e.status === 'no-show').length;
    const avgMinutes = await getAvgConsultMinutes(dept._id);

    rows.push({
      departmentId: dept._id,
      name: dept.name,
      slug: dept.slug,
      waiting,
      inProgress,
      done,
      noShow,
      walkOuts: noShow,
      avgConsultMinutes: avgMinutes,
      predictedWaitMinutes: waiting * avgMinutes,
      busy: waiting >= 5,
    });
  }

  rows.sort((a, b) => b.waiting - a.waiting);

  const leastBusy = [...rows].sort((a, b) => a.waiting - b.waiting)[0] || null;

  res.json({
    success: true,
    data: {
      departments: rows,
      leastBusy,
      totals: {
        waiting: rows.reduce((s, r) => s + r.waiting, 0),
        done: rows.reduce((s, r) => s + r.done, 0),
        walkOuts: rows.reduce((s, r) => s + r.walkOuts, 0),
      },
    },
  });
});

export const suggestRedirect = asyncHandler(async (req, res) => {
  const currentId = req.params.deptId;
  const departments = await Department.find({ isActive: true });

  let best = null;
  let bestWaiting = Infinity;

  for (const dept of departments) {
    const waiting = await countWaiting(dept._id);
    if (String(dept._id) === String(currentId)) continue;
    if (waiting < bestWaiting) {
      bestWaiting = waiting;
      best = { ...dept.toObject(), waiting };
    }
  }

  const currentWaiting = await countWaiting(currentId);
  const currentAvg = await getAvgConsultMinutes(currentId);

  res.json({
    success: true,
    data: {
      currentWaiting,
      predictedWaitMinutes: currentWaiting * currentAvg,
      avgConsultMinutes: currentAvg,
      suggestRedirect: best && bestWaiting < currentWaiting,
      quieterDepartment: best,
    },
  });
});

export const getSmsLogs = asyncHandler(async (req, res) => {
  const logs = await SmsLog.find()
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('department', 'name slug');

  res.json({
    success: true,
    data: logs,
  });
});
