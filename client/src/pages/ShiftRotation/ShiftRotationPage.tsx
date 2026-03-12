/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { 
  RotateCw, 
  History, 
  Calendar, 
  Users, 
  AlertCircle,
  Building2,
  Loader2,
  Info
} from 'lucide-react';
import { shiftRotationService } from '../../services/shiftRotationService';
import { authService } from '../../services/authService';

export function ShiftRotationPage() {
  const [status, setStatus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = authService.isAdmin();

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await shiftRotationService.getStatus();
      setStatus(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoRotate = async () => {
    if (confirm('Run automatic shift rotation for all companies whose shifts are due?')) {
      try {
        const res = await shiftRotationService.triggerAutoRotation();
        alert(`Rotation completed. ${res.data?.rotatedCount || 0} designations rotated.`);
        fetchStatus();
      } catch (err) {
        console.error(err);
        alert('Failed to rotate shifts');
      }
    }
  };

  const handleManualRotate = async (companyId: number) => {
    if (confirm('Manually rotate shifts for this company?')) {
      try {
        const res = await shiftRotationService.manualRotate(companyId);
        alert(`Rotated ${res.data?.rotatedCount || 0} designations.`);
        fetchStatus();
      } catch (err) {
        console.error(err);
        alert('Failed to rotate');
      }
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 p-2.5 border border-indigo-100 shadow-sm">
            <RotateCw className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Shift Rotation</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage automatic and manual shift swaps for guard personnel across companies.
            </p>
          </div>
        </div>
        {isAdmin && (
          <button
            onClick={handleAutoRotate}
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all active:scale-95 gap-2"
          >
            <RotateCw className="h-4 w-4" />
            Run Auto-Rotation
          </button>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start">
        <Info className="h-5 w-5 text-blue-500 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-semibold">Rotation Logic</p>
          <p className="mt-1 opacity-90">
            Shifts are designed to automatically rotate every 7 days. Guards stationed at the same company will swap their current shift assignments with each other to ensure fair rotation of schedules.
          </p>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden flex-1 flex flex-col">
        <div className="border-b border-slate-200 p-4 bg-slate-50/50">
          <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400" />
            Active Designations
          </h2>
        </div>

        <div className="overflow-x-auto relative flex-1">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-sm font-medium text-slate-600">Fetching rotation status...</p>
            </div>
          )}

          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Company</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Guards</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Last Rotation</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500 text-center">Next Rotation</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {status.map((s: any) => {
                const isOverdue = s.next_rotation ? new Date(s.next_rotation) <= new Date() : false;
                
                return (
                  <tr key={s.company_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="text-sm font-semibold text-slate-900">{s.name}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[250px]">{s.address}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-medium">
                        <Users className="h-3.5 w-3.5" />
                        {s.guard_count}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-500">
                      <div className="flex items-center justify-center gap-1.5">
                        <History className="h-3.5 w-3.5 text-slate-400" />
                        {s.last_rotation ? new Date(s.last_rotation).toLocaleDateString() : 'Never'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {s.next_rotation ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <span className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            isOverdue 
                              ? 'bg-red-50 text-red-700 ring-red-600/20 shadow-sm' 
                              : 'bg-blue-50 text-blue-700 ring-blue-700/10'
                          }`}>
                            <Calendar className="h-3 w-3" />
                            {new Date(s.next_rotation).toLocaleDateString()}
                            {isOverdue && ' (Overdue)'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => handleManualRotate(s.company_id)} 
                        disabled={s.guard_count < 2}
                        className={`
                          inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                          ${s.guard_count < 2 
                            ? 'bg-slate-50 text-slate-400 cursor-not-allowed border border-slate-200' 
                            : 'bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300 active:scale-95'
                          }
                        `}
                      >
                        <RotateCw className={`h-3.5 w-3.5 ${s.guard_count >= 2 ? 'group-hover:rotate-180 transition-transform' : ''}`} />
                        Rotate Now
                      </button>
                    </td>
                  </tr>
                );
              })}
              
              {status.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="rounded-full bg-slate-50 p-6 mb-4">
                        <AlertCircle className="h-12 w-12 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900">No active designations</h3>
                      <p className="text-slate-500 mt-1 max-w-xs mx-auto">
                        Rotation only applies to companies with active guard assignments. Assign guards to companies to see them here.
                      </p>
                    </div>
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
