/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Get status color classes for boolean-based status flags.
 */

export type StatusBadge = {
  label: string;
  color: string;
};

/**
 * Build attendance status badges from boolean flags.
 */
export function getAttendanceStatuses(record: any): StatusBadge[] {
  const badges: StatusBadge[] = [];

  if (record.is_on_leave) {
    badges.push({ label: 'On Leave', color: 'bg-yellow-100 text-yellow-800' });
  }
  if (record.is_present) {
    badges.push({ label: 'Present', color: 'bg-green-100 text-green-800' });
  }
  if (record.is_late) {
    badges.push({ label: 'Late', color: 'bg-red-100 text-red-800' });
  }
  if (record.is_early_out) {
    badges.push({ label: 'Early Out', color: 'bg-orange-100 text-orange-800' });
  }

  // Default: On Duty if no time_out and not on leave
  if (badges.length === 0 && !record.time_out && !record.is_on_leave) {
    badges.push({ label: 'On Duty', color: 'bg-blue-100 text-blue-800' });
  }

  // If no statuses at all (shouldn't happen, but fallback)
  if (badges.length === 0) {
    badges.push({ label: 'Unknown', color: 'bg-gray-100 text-gray-800' });
  }

  return badges;
}

/**
 * Get user status text from boolean flags.
 */
export function getUserStatus(user: any): StatusBadge {
  if (user.is_resigned) return { label: 'Resigned', color: 'bg-red-100 text-red-800' };
  if (user.is_on_leave) return { label: 'On Leave', color: 'bg-yellow-100 text-yellow-800' };
  if (user.is_available) return { label: 'Available', color: 'bg-green-100 text-green-800' };
  return { label: 'Assigned', color: 'bg-blue-100 text-blue-800' };
}

/**
 * Get firearm status badges from boolean flags.
 */
export function getFirearmStatuses(firearm: any): StatusBadge[] {
  const badges: StatusBadge[] = [];

  if (firearm.is_available) {
    badges.push({ label: 'Available', color: 'bg-green-100 text-green-800' });
  } else {
    badges.push({ label: 'Issued', color: 'bg-blue-100 text-blue-800' });
  }
  if (firearm.is_damaged) {
    badges.push({ label: 'Damaged', color: 'bg-red-100 text-red-800' });
  }
  if (firearm.is_maintenance) {
    badges.push({ label: 'Maintenance', color: 'bg-orange-100 text-orange-800' });
  }
  if (firearm.is_expiring) {
    badges.push({ label: 'Expiring', color: 'bg-yellow-100 text-yellow-800' });
  }
  if (firearm.is_expired) {
    badges.push({ label: 'Expired', color: 'bg-red-100 text-red-800' });
  }

  return badges;
}

/**
 * Get designation status from boolean flags.
 */
export function getDesignationStatus(designation: any): StatusBadge {
  if (designation.is_dismissed) return { label: 'Dismissed', color: 'bg-red-100 text-red-800' };
  if (designation.is_completed) return { label: 'Completed', color: 'bg-gray-100 text-gray-800' };
  if (designation.is_active) return { label: 'Active', color: 'bg-green-100 text-green-800' };
  return { label: 'Inactive', color: 'bg-gray-100 text-gray-800' };
}

/**
 * Legacy: Get status color for string-based status (backward compat).
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    available: 'bg-green-100 text-green-800',
    present: 'bg-green-100 text-green-800',
    assigned: 'bg-blue-100 text-blue-800',
    on_duty: 'bg-blue-100 text-blue-800',
    issued: 'bg-blue-100 text-blue-800',
    late: 'bg-red-100 text-red-800',
    resigned: 'bg-red-100 text-red-800',
    expired: 'bg-red-100 text-red-800',
    damaged: 'bg-red-100 text-red-800',
    on_leave: 'bg-yellow-100 text-yellow-800',
    expiring: 'bg-yellow-100 text-yellow-800',
    maintenance: 'bg-orange-100 text-orange-800',
    early_out: 'bg-orange-100 text-orange-800',
    completed: 'bg-gray-100 text-gray-800',
    dismissed: 'bg-gray-100 text-gray-800',
  };
  return colorMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
}
