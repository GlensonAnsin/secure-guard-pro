/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  RotateCw,
  Clock,
  Calendar,
  User,
  MapPin,
  Loader2,
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import { shiftRotationService } from '../../services/shiftRotationService';
import { authService } from '../../services/authService';
import toast from 'react-hot-toast';

export function CompanyGuards() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRotating, setIsRotating] = useState(false);

  const navigate = useNavigate();
  const isAdminOrHR = authService.isAdminOrHR();

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await companyService.getGuards(Number(id));
      setData(res.data);
    } catch (err) {
      console.error('Failed to fetch company guards:', err);
      toast.error('Failed to load assigned guards.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManualRotate = async () => {
    if (window.confirm('Are you sure you want to manually rotate shifts for this company?')) {
      setIsRotating(true);
      try {
        await shiftRotationService.manualRotate(Number(id));
        fetchData();
        toast.success('Shifts rotated successfully!');
      } catch (err) {
        console.error('Failed to rotate shifts:', err);
        toast.error('Failed to rotate shifts. Please try again.');
      } finally {
        setIsRotating(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-slate-900">Company not found</h2>
        <button onClick={() => navigate('/companies')} className="mt-4 text-blue-600 hover:underline">
          Back to Companies List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/companies')}
            className="rounded-full p-2 hover:bg-slate-100 text-slate-500 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <MapPin className="h-6 w-6 text-blue-600" />
              Guards at {data.company.address}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {data.guards.length} security personnel currently assigned to this location.
            </p>
          </div>
        </div>

        {isAdminOrHR && (
          <button
            onClick={handleManualRotate}
            disabled={isRotating}
            className="inline-flex items-center justify-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isRotating ? (
              <Loader2 className="-ml-1 mr-2 h-4 w-4 animate-spin text-blue-600" />
            ) : (
              <RotateCw className="-ml-1 mr-2 h-4 w-4 text-blue-600" />
            )}
            Rotate Shifts Now
          </button>
        )}
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">
                  Guard
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Assignment Details
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Shift Timing
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Rotation Schedule
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {data.guards.length > 0 ? (
                data.guards.map((guard: any) => (
                  <tr key={guard.designation_id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="ml-3">
                          <p className="font-medium text-slate-900">{guard.name}</p>
                          <p className="text-xs text-slate-500">{guard.guard_id || 'No ID'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          <span>Hired: {guard.date_assigned ? new Date(guard.date_assigned).toLocaleDateString() : '—'}</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <Shield className="h-3.5 w-3.5 text-blue-500" />
                          <span>Active Designation</span>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-600">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span className="font-medium">{guard.shift_in} - {guard.shift_out}</span>
                        </div>
                        <p className="text-xs text-slate-500 pl-5">Work Days: {guard.day_start} - {guard.day_end}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <div className="flex flex-col gap-1">
                        <p className="text-slate-600 text-xs">
                          Last Shift: {guard.last_shift_changes ? new Date(guard.last_shift_changes).toLocaleDateString() : 'Initial'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            guard.days_until_switch <= 1 
                              ? 'bg-red-50 text-red-700 ring-red-600/10' 
                              : 'bg-blue-50 text-blue-700 ring-blue-700/10'
                          }`}>
                            Next Switch: {guard.next_shift_switch ? new Date(guard.next_shift_switch).toLocaleDateString() : '—'}
                          </span>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-sm text-slate-500 italic">
                    No guards currently assigned to this location.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
