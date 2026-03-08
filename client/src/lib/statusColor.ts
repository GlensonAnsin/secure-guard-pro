export const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'assigned':
    case 'active':
    case 'present':
      return 'bg-green-100 text-green-700 ring-green-600/20';
    case 'late':
    case 'half_day':
    case 'maintenance':
      return 'bg-amber-100 text-amber-700 ring-amber-600/20';
    case 'unassigned':
    case 'on_duty':
    case 'issued':
      return 'bg-blue-100 text-blue-700 ring-blue-600/20';
    case 'on_leave':
      return 'bg-yellow-100 text-yellow-700 ring-yellow-600/20';
    case 'resigned':
    case 'dismissed':
    case 'absent':
    case 'expired':
      return 'bg-red-100 text-red-700 ring-red-600/20';
    case 'completed':
    case 'available':
      return 'bg-green-100 text-green-700 ring-green-600/20';
    default:
      return 'bg-slate-100 text-slate-700 ring-slate-500/20';
  }
};
