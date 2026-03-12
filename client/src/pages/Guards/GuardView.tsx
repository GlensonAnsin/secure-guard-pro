/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Shield, Clock, Link as LinkIcon, Edit, X } from 'lucide-react';
import { guardViewService } from '../../services/guardViewService';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export function GuardView() {
  const { id } = useParams();
  const [guard, setGuard] = useState<any | null>(null);
  const [currentAssignment, setCurrentAssignment] = useState<Record<string, any>>({});
  const [currentFirearm, setCurrentFirearm] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchGuardData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const guardRes = await guardViewService.getById(parseInt(id));
        setGuard(guardRes.data);
        
        if (guardRes.data?.designations?.length > 0) {
          // Find the active designation
          const activeDesignation = guardRes.data.designations.find((d: any) => d.is_active);
          if (activeDesignation) {
            setCurrentAssignment(activeDesignation);
          } else {
            // If no active one, show the latest one as current if it's not dismissed
            const latestDesignation = guardRes.data.designations[guardRes.data.designations.length - 1];
            if (!latestDesignation.is_dismissed && !latestDesignation.is_completed) {
              setCurrentAssignment(latestDesignation);
            }
          }
        }

        if (guardRes.data?.firearmIssuances?.length > 0) {
          // Find the active issuance (no turn_in_date)
          const activeIssuance = guardRes.data.firearmIssuances.find((i: any) => !i.turn_in_date);
          if (activeIssuance) {
            setCurrentFirearm(activeIssuance);
          }
        }
      } catch (error) {
        console.error('Failed to fetch guard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuardData();
  }, [id]);

  const handleToggleLeave = async () => {
    if (!id || isUpdatingStatus) return;
    const newStatus = guard.is_on_leave ? 'available' : 'on_leave';
    setIsUpdatingStatus(true);
    try {
      const res = await guardViewService.updateStatus(parseInt(id), newStatus);
      setGuard(res.data);
      toast.success(newStatus === 'on_leave' ? 'Guard is now on leave' : 'Guard is now available');
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleResign = async () => {
    if (!id || isUpdatingStatus) return;
    if (!window.confirm('Are you sure you want to mark this guard as resigned? This action cannot be undone if they have active assignments.')) return;
    
    setIsUpdatingStatus(true);
    try {
      const res = await guardViewService.updateStatus(parseInt(id), 'resigned');
      setGuard(res.data);
      toast.success('Guard has been marked as resigned');
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!guard) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900">Guard not found</h2>
        <Link to="/guards" className="mt-4 text-blue-600 hover:underline">
          Back to Guards List
        </Link>
      </div>
    );
  }

  const fullName = `${guard.first_name || ''} ${guard.last_name || ''}`.trim();
  const initials = `${guard.first_name?.[0] || ''}${guard.last_name?.[0] || ''}`;

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hourStr, minuteStr] = timeString.split(':');
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour.toString().padStart(2, '0')}:${minuteStr} ${ampm}`;
  };

  const getDayName = (day: number | string | undefined | null) => {
    if (day === undefined || day === null || day === '') return '-';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[Number(day)] || '-';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/guards" className="rounded-full p-2 hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Guard Profile</h1>
            <p className="mt-1 text-sm text-slate-500">View complete information and assignment history.</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1">
          <Link
            to={`/guards/${guard.id}/assign`}
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm transition-colors shrink-0 ${
              (!guard.is_available || guard.is_resigned || guard.is_on_leave)
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed pointer-events-none'
                : 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
            }`}
            aria-disabled={!guard.is_available || guard.is_resigned || guard.is_on_leave}
          >
            <LinkIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
            Assign to Client
          </Link>
          {guard.is_resigned && (
            <p className="text-[10px] text-red-500 font-medium">Guard has resigned</p>
          )}
          {!guard.is_available && !guard.is_resigned && !guard.is_on_leave && (
            <p className="text-[10px] text-red-500 font-medium">Dismiss current assignment first</p>
          )}
          {guard.is_on_leave && !guard.is_resigned && (
            <p className="text-[10px] text-orange-500 font-medium font-semibold underline">Cannot assign: Guard is currently on leave</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Profile Card */}
        <div className="xl:col-span-1 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden h-fit relative">
          <div className="bg-slate-50 px-6 py-8 flex flex-col items-center border-b border-slate-200 relative">
            <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold mb-4 ring-4 ring-white shadow-sm border border-slate-200">
              {initials}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{fullName}</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">{guard.guard_id || `User-${guard.id}`}</p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
              {guard.is_resigned ? (
                <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                  Resigned
                </span>
              ) : (
                <>
                  {guard.is_on_leave && (
                    <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                      On Leave
                    </span>
                  )}
                  {!guard.is_available ? (
                    <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                      Assigned
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      Available
                    </span>
                  )}
                </>
              )}
            </div>
            
            <div className="mt-4 flex flex-col gap-3 w-full border-t border-slate-200 pt-4">
              {!guard.is_resigned && (
                <>
                  <label className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-slate-50 cursor-pointer transition-colors group border border-transparent hover:border-slate-200">
                    <input
                      type="checkbox"
                      checked={guard.is_on_leave}
                      onChange={handleToggleLeave}
                      disabled={isUpdatingStatus}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 disabled:opacity-50 cursor-pointer"
                    />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">On Leave</span>
                  </label>
                  
                  <button
                    onClick={handleResign}
                    disabled={isUpdatingStatus}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 text-sm font-semibold text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 hover:border-red-300 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                    Mark as Resigned
                  </button>
                </>
              )}
              {guard.statuses?.includes('resigned') && (
                <p className="text-xs text-center text-red-500 font-medium py-2 bg-red-50 rounded-md border border-red-100">
                  Guard has archived status.
                </p>
              )}
            </div>
          </div>
          <div className="px-6 py-6 space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-5 w-5 text-slate-400" />
              <span className="text-slate-700">{guard.cel_num || 'No contact number'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-5 w-5 text-slate-400" />
              <span className="text-slate-700">{guard.email || 'No email address'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="text-slate-400" />
              <span className="text-slate-700">
                {`${guard.street || ''}, ${guard.barangay}, ${guard.city_or_municipality}, ${guard.province}, ${guard.region}`}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-5 w-5 text-slate-400" />
              <span className="text-slate-700">Joined Date: {guard.date_hired || 'Not recorded'}</span>
            </div>
            {guard.termination_date && (
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-5 w-5 text-red-400" />
                <span className="text-slate-700">Termination Date: {guard.termination_date}</span>
              </div>
            )}
          </div>
        </div>

        {/* Info & History */}
        <div className="xl:col-span-2 space-y-6">
          {/* Current Assignment */}
          <div className="border border-slate-200 rounded-xl bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-semibold leading-6 text-slate-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Current Assignment
              </h3>
              {currentAssignment.id && (
                <Link
                  to={`/guards/${guard.id}/assignments/${currentAssignment.id}/edit`}
                  className="rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 transition-colors"
                  title="Edit Current Assignment"
                >
                  <Edit className="h-4 w-4" />
                </Link>
              )}
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-sm font-medium text-slate-500">Post</p>
                <p className="mt-1 text-base font-medium text-slate-900">{currentAssignment.company?.address || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Shift</p>
                <p className="mt-1 text-base font-medium text-slate-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {currentAssignment.shift_in && currentAssignment.shift_out
                    ? formatTime(currentAssignment.shift_in) + ' - ' + formatTime(currentAssignment.shift_out)
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Work Days</p>
                <p className="mt-1 text-base font-medium text-slate-900">
                  {currentAssignment.day_start !== undefined && currentAssignment.day_end !== undefined
                    ? `${getDayName(currentAssignment.day_start)} - ${getDayName(currentAssignment.day_end)}`
                    : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Date Assigned</p>
                <p className="mt-1 text-base font-medium text-slate-900">{currentAssignment.date_assigned || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Client</p>
                <p className="mt-1 text-base font-medium text-slate-900">{currentAssignment.company?.name || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Total Hours Worked</p>
                <p className="mt-1 text-base font-medium text-slate-900">
                  {currentAssignment.total_hours_worked || '0'} hrs
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Monthly Hours Worked</p>
                <p className="mt-1 text-base font-medium text-slate-900">
                  {currentAssignment.monthly_hours_worked || '0'} hrs
                </p>
              </div>
            </div>
          </div>

          {/* Current Firearm */}
          <div className="border border-slate-200 rounded-xl bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-base font-semibold leading-6 text-slate-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-orange-500" />
                Current Issued Firearm
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentFirearm ? (
                <>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Firearm Type</p>
                    <p className="mt-1 text-base font-medium text-slate-900">{currentFirearm.firearm?.type || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Serial Number</p>
                    <p className="mt-1 text-base font-medium text-slate-900 font-mono">{currentFirearm.firearm?.serial_num || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Date Issued</p>
                    <p className="mt-1 text-base font-medium text-slate-900">{currentFirearm.date_of_issuance || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Registration Expiry</p>
                    <p className={`mt-1 text-base font-medium ${currentFirearm.firearm?.is_expired ? 'text-red-600' : 'text-slate-900'}`}>
                      {currentFirearm.firearm?.exp_of_registration || '-'}
                      {currentFirearm.firearm?.is_expired && <span className="ml-2 text-xs font-bold uppercase">(Expired)</span>}
                    </p>
                  </div>
                </>
              ) : (
                <div className="sm:col-span-2 lg:col-span-3 py-2 text-center text-sm text-slate-500">
                  No firearm currently issued to this guard.
                </div>
              )}
            </div>
          </div>

          {/* Assignment History */}
          <div className="border border-slate-200 rounded-xl bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-base font-semibold leading-6 text-slate-900">Designation History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-slate-900">
                      Post
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Shift
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Schedule
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Date Assigned
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Date Dismissed
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {guard.designations.length > 0 ? (
                    guard.designations.map((designation: any) => (
                      <tr key={designation.id}>
                        <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                          <div className="font-medium text-slate-900">{designation.company?.name || 'Unknown'}</div>
                          <div className="text-xs text-slate-500">{designation.company?.address}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {designation.shift_in && designation.shift_out
                            ? formatTime(designation.shift_in) + ' - ' + formatTime(designation.shift_out)
                            : '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {designation.day_start !== undefined && designation.day_end !== undefined
                            ? `${getDayName(designation.day_start).substring(0, 3)} - ${getDayName(designation.day_end).substring(0, 3)}`
                            : '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {designation.date_assigned || '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {designation.date_of_dismissal || '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {designation.is_dismissed ? (
                            <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                              Dismissed
                            </span>
                          ) : designation.is_completed ? (
                            <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-600/20">
                              Completed
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {designation.note || '-'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-sm text-slate-500">
                        No designation history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Firearm Issuance History */}
          <div className="border border-slate-200 rounded-xl bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-base font-semibold leading-6 text-slate-900">Firearm Issuance History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th scope="col" className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-slate-900">
                      Firearm
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Serial Number
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Date Issued
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Date Returned
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {guard.firearmIssuances?.length > 0 ? (
                    guard.firearmIssuances.map((issuance: any) => (
                      <tr key={issuance.id}>
                        <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                          <div className="font-medium text-slate-900">{issuance.firearm?.type || 'Unknown'}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-mono text-slate-500">
                          {issuance.firearm?.serial_num || '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {issuance.date_of_issuance || '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {issuance.turn_in_date || '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          {issuance.turn_in_date ? (
                            <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-700 ring-1 ring-inset ring-slate-600/20">
                              Returned
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-700/10">
                              Issued
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-sm text-slate-500">
                        No firearm issuance history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
