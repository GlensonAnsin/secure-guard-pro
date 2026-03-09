/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Loader2,
  UserX,
  X,
  Edit,
  Trash2,
} from 'lucide-react';
import { attendanceService } from '../../services/attendanceService';
import { getStatusColor } from '../../lib/statusColor';

export function AttendanceList() {
  const [records, setRecords] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [dutyCount, setDutyCount] = useState(0);
  const [lateCount, setLateCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [onLeaveCount, setOnLeaveCount] = useState(0);
  const [halfDayCount, setHalfDayCount] = useState(0);

  const stats = [
    {
      name: 'Present',
      value: presentCount,
      icon: CheckCircle2,
      key: 'present',
    },
    { name: 'On Duty', value: dutyCount, icon: ShieldCheck, key: 'duty' },
    { name: 'Late', value: lateCount, icon: Clock, key: 'late' },
    { name: 'Absent', value: absentCount, icon: XCircle, key: 'absent' },
    {
      name: 'On Leave',
      value: onLeaveCount,
      icon: UserX,
      key: 'on_leave',
    },
    {
      name: 'Half Day',
      value: halfDayCount,
      icon: Clock,
      key: 'half_day',
    },
  ];
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [editNote, setEditNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const itemsPerPage = 10;

  const fetchAttendance = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await attendanceService.getAll(currentPage, itemsPerPage, searchQuery, statusFilter, dateFilter);
      if (res.data) {
        setRecords(res.data.data || []);
        setTotalPages(res.data.meta?.last_page || 1);
        setTotalCount(res.data.meta?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, itemsPerPage, searchQuery, statusFilter, dateFilter]);

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await attendanceService.getAttendanceStats(dateFilter);
        if (res.data) {
          setPresentCount(res.data.meta.present || 0);
          setDutyCount(res.data.meta.duty || 0);
          setLateCount(res.data.meta.late || 0);
          setAbsentCount(res.data.meta.absent || 0);
          setOnLeaveCount(res.data.meta.on_leave || 0);
          setHalfDayCount(res.data.meta.half_day || 0);
        }
      } catch (error) {
        console.error('Failed to fetch attendance stats:', error);
      }
    };
    fetchStats();
  }, [dateFilter]);

  const handleEditClick = (record: any) => {
    setEditingRecord(record);
    setEditNote(record.note || '');
    setIsEditModalOpen(true);
  };

  const handleSaveNote = async () => {
    if (!editingRecord) return;

    setIsSaving(true);
    try {
      await attendanceService.update(editingRecord.id, {
        note: editNote,
      });
      setIsEditModalOpen(false);
      fetchAttendance(); // Refresh to show new note
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('Failed to save note.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const statusArg = statusFilter === 'all' ? '' : statusFilter;
      const res = await attendanceService.exportReport(searchQuery, statusArg, dateFilter);
      const url = window.URL.createObjectURL(new Blob([res as any]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error('Failed to export:', error);
      alert('Failed to export report');
    } finally {
      setIsExporting(false);
    }
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const [hourStr, minuteStr] = timeString.split(':');
    const hour = parseInt(hourStr, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour.toString().padStart(2, '0')}:${minuteStr} ${ampm}`;
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this attendance record?')) {
      setIsDeleting(id);
      try {
        const res = await attendanceService.delete(id) as any;
        if (res.status === 200 || res.success) {
          fetchAttendance();
        }
      } catch (error) {
        console.error('Failed to delete attendance record:', error);
        alert('Failed to delete attendance record.');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Attendance Records</h1>
          <p className="mt-1 text-sm text-slate-500">Track and manage daily attendance across all client sites.</p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center justify-center rounded-md bg-white border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600 transition-colors disabled:opacity-50 cursor-pointer"
        >
          {isExporting ? (
            <Loader2 className="-ml-1 mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Download className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
          )}
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {stats.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
              </div>
              <div className="rounded-md bg-blue-50 p-2 border border-slate-100">
                <stat.icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 flex-1 flex flex-col">
        <div className="border-b border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row flex-1 gap-4 sm:items-center flex-wrap">
            <div className="relative w-full sm:max-w-md sm:flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Search by name or location..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
              <select
                className="block w-full sm:w-auto rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="on_duty">On Duty</option>
                <option value="present">Present</option>
                <option value="on_leave">On Leave</option>
                <option value="half_day">Half Day</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
              </select>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="block w-full sm:w-auto rounded-md border-0 py-1.5 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto relative flex-1">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">
                  Date
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Guard Name
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Location & Shift
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Time In
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Time Out
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Hours
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Note
                </th>
                <th
                  scope="col"
                  className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-semibold text-slate-900"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {!isLoading && records.length > 0 ? (
                records.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-slate-500 sm:pl-6">
                      {new Date(record.created_at || record.time_in).toLocaleDateString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-900">
                      {record.designation.user
                        ? `${record.designation.user.first_name} ${record.designation.user.last_name}`
                        : `Guard #${record.designation_id}`}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="font-medium text-slate-900">
                        {formatTime(record.designation.shift_in) + ' - ' + formatTime(record.designation.shift_out) ||
                          'N/A'}
                      </div>
                      <div className="text-slate-500">{record.designation.address}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-700 font-medium">
                      {record.time_in
                        ? new Date(record.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-700 font-medium">
                      {record.time_out
                        ? new Date(record.time_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{record.hours_worked || '-'}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(record.status)}`}
                      >
                        {record.status === 'on_duty'
                          ? 'On Duty'
                          : record.status === 'late'
                            ? 'Late'
                            : record.status === 'absent'
                              ? 'Absent'
                              : record.status === 'present'
                                ? 'Present'
                                : record.status === 'on_leave'
                                  ? 'On Leave'
                                  : record.status === 'half_day'
                                    ? 'Half Day'
                                    : record.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{record.note || '-'}</td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(record)}
                          className="text-slate-400 hover:text-[#135dff] transition-colors cursor-pointer"
                          title="Edit Note"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          disabled={isDeleting === record.id}
                          className="text-slate-400 hover:text-red-500 transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete Record"
                        >
                          {isDeleting === record.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Trash2 className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : !isLoading ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-sm text-slate-500">
                    No attendance records found.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 mt-auto">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isLoading}
                className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || isLoading}
                className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      disabled={isLoading}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === i + 1
                          ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 cursor-pointer'
                          : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || isLoading}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Edit Note Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => !isSaving && setIsEditModalOpen(false)}
          />
          <div className="relative w-full max-w-md rounded-xl bg-white shadow-2xl ring-1 ring-slate-200">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-900">Edit Note</h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSaving}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500 transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 py-4">
              <div className="mb-4">
                <p className="text-sm font-medium text-slate-700">Guard</p>
                <p className="text-sm text-slate-500">
                  {editingRecord?.designation?.user
                    ? `${editingRecord.designation.user.first_name} ${editingRecord.designation.user.last_name}`
                    : `Guard #${editingRecord?.designation_id}`}
                </p>
              </div>
              <div>
                <label htmlFor="note" className="block text-sm font-medium text-slate-700">
                  Note
                </label>
                <div className="mt-2">
                  <textarea
                    id="note"
                    rows={4}
                    className="block w-full rounded-md border-0 py-1.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                    placeholder="Add attendance notes here..."
                    value={editNote}
                    onChange={(e) => setEditNote(e.target.value)}
                    disabled={isSaving}
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 rounded-b-xl">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                disabled={isSaving}
                className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                disabled={isSaving}
                className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-50 cursor-pointer"
              >
                {isSaving && <Loader2 className="-ml-1 mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
