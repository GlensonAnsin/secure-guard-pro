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
  const [isLoading, setIsLoading] = useState(true);
  
  // Status Edit Modal State
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    const fetchGuardData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const guardRes = await guardViewService.getById(parseInt(id));
        setGuard(guardRes.data);
        
        if (guardRes.data?.designations?.length > 0) {
          const latestDesignation = guardRes.data.designations[guardRes.data.designations.length - 1];
          if (latestDesignation.status === 'active') {
             setCurrentAssignment(latestDesignation);
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

  const handleUpdateStatus = async () => {
    if (!id || !selectedStatus) return;
    setIsUpdatingStatus(true);
    try {
      const res = await guardViewService.updateStatus(parseInt(id), selectedStatus);
      setGuard(res.data);
      setIsStatusModalOpen(false);
      toast.success('Guard status updated successfully');
    } catch (error: any) {
      console.error('Failed to update status:', error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const openStatusModal = () => {
    if (guard) {
      setSelectedStatus(guard.status);
      setIsStatusModalOpen(true);
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

  const statusOptions = [
    { value: 'on_leave', label: 'On Leave' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'resigned', label: 'Resigned' },
  ];

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

        {guard.status !== 'assigned' && guard.status !== 'resigned' && (
          <Link
            to={`/guards/${guard.id}/assign`}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors shrink-0"
          >
            <LinkIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
            Assign to Client
          </Link>
        )}
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
              <span
                className="inline-flex items-center rounded-full text-xs font-medium"
              >
                {guard.is_resigned ? (
                  <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                    Resigned
                  </span>
                ) : guard.is_on_leave ? (
                  <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                    On Leave
                  </span>
                ) : guard.is_available ? (
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Available
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    Assigned
                  </span>
                )}
              </span>
              <button 
                onClick={openStatusModal}
                className="p-1 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors bg-white ring-1 ring-slate-200 cursor-pointer"
                title="Edit Status"
              >
                <Edit className="h-4 w-4" />
              </button>
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
                <p className="mt-1 text-base font-medium text-slate-900">{currentAssignment.address || '-'}</p>
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
                <p className="text-sm font-medium text-slate-500">Date Assigned</p>
                <p className="mt-1 text-base font-medium text-slate-900">{currentAssignment.date_assigned || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Client</p>
                <p className="mt-1 text-base font-medium text-slate-900">{currentAssignment.client || '-'}</p>
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
                          <div className="font-medium text-slate-900">{designation.address}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {designation.shift_in && designation.shift_out
                            ? formatTime(designation.shift_in) + ' - ' + formatTime(designation.shift_out)
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
        </div>
      </div>

      {/* Edit Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">Update Guard Status</h3>
              <button 
                onClick={() => setIsStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-full hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="mt-1 block w-full rounded-md border-slate-300 py-2.5 pl-3 pr-10 text-base focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm shadow-sm ring-1 ring-inset ring-slate-300 bg-white"
                >
                  <option value="" disabled>Select a status</option>
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="mt-2 text-sm text-slate-500">
                  Changing the status may affect the guard's ability to log in or use the mobile app.
                </p>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsStatusModalOpen(false)}
                className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                disabled={isUpdatingStatus}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus || !selectedStatus || selectedStatus === guard.status}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isUpdatingStatus ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
