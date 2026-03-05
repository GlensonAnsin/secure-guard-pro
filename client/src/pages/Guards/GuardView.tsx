/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, Shield, Clock } from 'lucide-react';
import { guardService } from '../../services/guardService';
import { useEffect, useState } from 'react';

export function GuardView() {
  const { id } = useParams();
  const [guard, setGuard] = useState<any | null>(null);
  const [designationHistory, setDesignationHistory] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGuardData = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const [guardRes, designationsRes] = await Promise.all([
          guardService.getById(parseInt(id)),
          guardService.getDesignations(parseInt(id)),
        ]);
        setGuard(guardRes.data);
        setDesignationHistory(designationsRes.data.data || []);
      } catch (error) {
        console.error('Failed to fetch guard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuardData();
  }, [id]);

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
  const currentAssignment = designationHistory[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/guards" className="rounded-full p-2 hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Guard Profile</h1>
          <p className="mt-1 text-sm text-slate-500">View complete information and assignment history.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Profile Card */}
        <div className="xl:col-span-1 border border-slate-200 rounded-xl bg-white shadow-sm overflow-hidden h-fit">
          <div className="bg-slate-50 px-6 py-8 flex flex-col items-center border-b border-slate-200">
            <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-3xl font-bold mb-4 ring-4 ring-white shadow-sm border border-slate-200">
              {initials}
            </div>
            <h2 className="text-xl font-bold text-slate-900">{fullName}</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">{guard.guard_id || `User-${guard.id}`}</p>
            <span
              className={`mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${
                guard.status === 'active'
                  ? 'bg-green-100 text-green-700 ring-green-600/20'
                  : 'bg-slate-100 text-slate-600 ring-slate-500/10'
              }`}
            >
              {guard.status ? guard.status.charAt(0).toUpperCase() + guard.status.slice(1) : 'Unknown'}
            </span>
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
              <MapPin className="h-5 w-5 text-slate-400" />
              <span className="text-slate-700">
                {guard.barangay && guard.city_or_municipality
                  ? `${guard.barangay}, ${guard.city_or_municipality}`
                  : 'Address unassigned'}
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-5 w-5 text-slate-400" />
              <span className="text-slate-700">Joined Date: {guard.date_hired || 'Not recorded'}</span>
            </div>
          </div>
        </div>

        {/* Info & History */}
        <div className="xl:col-span-2 space-y-6">
          {/* Current Assignment */}
          <div className="border border-slate-200 rounded-xl bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h3 className="text-base font-semibold leading-6 text-slate-900 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Current Assignment
              </h3>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-slate-500">Post</p>
                <p className="mt-1 text-base font-medium text-slate-900">{currentAssignment?.post || 'Unassigned'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Shift</p>
                <p className="mt-1 text-base font-medium text-slate-900 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  {currentAssignment?.shift || 'No active shift'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Date Assigned</p>
                <p className="mt-1 text-base font-medium text-slate-900">{currentAssignment?.assignedDate || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">Assignment Type</p>
                <p className="mt-1 text-base font-medium text-slate-900">{currentAssignment ? 'Regular' : '-'}</p>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white">
                  {designationHistory.length > 0 ? (
                    designationHistory.map((history) => (
                      <tr key={history.id}>
                        <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                          <div className="font-medium text-slate-900">{history.post}</div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{history.shift}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {history.assignedDate || '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                          {history.dismissalDate || '-'}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                              !history.dismissalDate
                                ? 'bg-green-50 text-green-700 ring-green-600/20'
                                : 'bg-slate-50 text-slate-600 ring-slate-500/10'
                            }`}
                          >
                            {!history.dismissalDate ? 'Active' : 'Completed'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-sm text-slate-500">
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
    </div>
  );
}
