const STATUS_CONFIG = {
  // Appointment statuses
  pending:     { label: 'Pending',     classes: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' },
  confirmed:   { label: 'Confirmed',   classes: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  in_progress: { label: 'In Progress', classes: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  completed:   { label: 'Completed',   classes: 'bg-green-500/10 text-green-400 border-green-500/30' },
  cancelled:   { label: 'Cancelled',   classes: 'bg-red-500/10 text-red-400 border-red-500/30' },
  // Payment statuses
  paid:        { label: 'Paid',        classes: 'bg-green-500/10 text-green-400 border-green-500/30' },
  // Job statuses
  created:     { label: 'Created',     classes: 'bg-gray-500/10 text-gray-400 border-gray-500/30' },
  waiting_parts: { label: 'Waiting Parts', classes: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  // Vehicle statuses
  active:      { label: 'Active',      classes: 'bg-green-500/10 text-green-400 border-green-500/30' },
  in_service:  { label: 'In Service',  classes: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  inactive:    { label: 'Inactive',    classes: 'bg-gray-500/10 text-gray-400 border-gray-500/30' },
};

export default function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || { label: status, classes: 'bg-gray-500/10 text-gray-400 border-gray-500/30' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.classes}`}>
      {config.label}
    </span>
  );
}
