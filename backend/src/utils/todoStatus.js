function toLocalDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getTodoStatus({ startDate, endDate, isDone }, today = new Date()) {
  if (isDone) return 'done';
  const todayStr = typeof today === 'string' ? today : toLocalDateStr(today);
  if (todayStr < startDate) return 'not_started';
  if (todayStr <= endDate) return 'in_progress';
  return 'overdue';
}

module.exports = { getTodoStatus, toLocalDateStr };
