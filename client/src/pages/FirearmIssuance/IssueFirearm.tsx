/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, ShieldAlert, Loader2 } from 'lucide-react';
import { guardService } from '../../services/guardService';
import { firearmService } from '../../services/firearmService';
import { issuanceService } from '../../services/issuanceService';

export function IssueFirearm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [guards, setGuards] = useState<any[]>([]);
  const [firearms, setFirearms] = useState<any[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    user_id: '',
    firearm_id: '',
    date_of_issuance: new Date().toISOString().split('T')[0],
    issuance_time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
    note: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [guardsRes, firearmsRes]: any = await Promise.all([
          guardService.getAll(1, 100),
          firearmService.getAll(1, 100),
        ]);
        if (guardsRes.data?.data) {
          setGuards(guardsRes.data.data);
        }
        if (firearmsRes.data?.data) {
          // You might only want 'Available' firearms here
          setFirearms(firearmsRes.data.data.filter((f: any) => f.status === 'Available'));
        }
      } catch (err) {
        console.error('Failed to load form data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const selectedGuard = guards.find((g) => g.id.toString() === formData.user_id);
  const selectedFirearm = firearms.find((f) => f.id.toString() === formData.firearm_id);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.user_id || !formData.firearm_id) {
      setError('Please select both a guard and a firearm.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        user_id: parseInt(formData.user_id, 10),
        firearm_id: parseInt(formData.firearm_id, 10),
        // Combine date and time if backend supports DateTime, but model says DATEONLY, so date is enough for now
        date_of_issuance: formData.date_of_issuance,
        note: formData.note || null,
      };

      const res = (await issuanceService.create(payload)) as any;
      if (res.success || res.status === 201 || res.status === 200) {
        navigate('/issuance');
      } else {
        setError(res.message || 'Failed to initialize issuance.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred while creating issuance record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/issuance" className="rounded-full p-2 hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Initialize Firearm Issuance</h1>
          <p className="mt-1 text-sm text-slate-500">Assign an available firearm to a deployed guard.</p>
        </div>
      </div>

      <div className="rounded-md bg-blue-50 p-4 border border-blue-200">
        <div className="flex">
          <div className="flex-shrink-0">
            <ShieldAlert className="h-5 w-5 text-blue-400" aria-hidden="true" />
          </div>
          <div className="ml-3 flex-1 md:flex md:justify-between">
            <p className="text-sm text-blue-700">
              By issuing a firearm, you confirm the guard has required clearances and proper licensing active.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-8 sm:p-10 space-y-8">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}

          {isLoadingData ? (
            <div className="flex justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              {/* Guard Selection */}
              <div className="border border-slate-200 rounded-lg p-6 bg-slate-50 space-y-4">
                <h2 className="text-base font-semibold leading-7 text-slate-900 border-b border-slate-200 pb-2">
                  Select Guard
                </h2>
                <div>
                  <label htmlFor="user_id" className="block text-sm font-medium leading-6 text-slate-900">
                    Search Guard
                  </label>
                  <div className="mt-2">
                    <select
                      id="user_id"
                      name="user_id"
                      value={formData.user_id}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    >
                      <option value="">-- Choose a guard --</option>
                      {guards.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.guard_id} - {g.first_name} {g.last_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {selectedGuard && (
                  <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm text-sm">
                    <div className="flex justify-between text-slate-500 mb-2">
                      <span>Contact:</span>{' '}
                      <span className="font-medium text-slate-900">{selectedGuard.cel_num || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Status:</span> <span className="font-medium text-slate-900">{selectedGuard.status}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Firearm Selection */}
              <div className="border border-slate-200 rounded-lg p-6 bg-slate-50 space-y-4">
                <h2 className="text-base font-semibold leading-7 text-slate-900 border-b border-slate-200 pb-2">
                  Select Firearm
                </h2>
                <div>
                  <label htmlFor="firearm_id" className="block text-sm font-medium leading-6 text-slate-900">
                    Available Firearms
                  </label>
                  <div className="mt-2">
                    <select
                      id="firearm_id"
                      name="firearm_id"
                      value={formData.firearm_id}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    >
                      <option value="">-- Choose a firearm --</option>
                      {firearms.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.type} ({f.serial_num})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {selectedFirearm && (
                  <div className="bg-white p-4 rounded-md border border-slate-200 shadow-sm text-sm font-code">
                    <div className="flex justify-between text-slate-500 mb-2 font-sans">
                      <span>Type:</span> <span className="font-medium text-slate-900">{selectedFirearm.type}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-sans">
                      <span>Reg Expiry:</span>{' '}
                      <span className="font-medium text-slate-900">{selectedFirearm.exp_of_registration}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="date_of_issuance" className="block text-sm font-medium leading-6 text-slate-900">
                  Issuance Date & Time
                </label>
                <div className="mt-2 flex gap-4">
                  <input
                    type="date"
                    name="date_of_issuance"
                    id="date_of_issuance"
                    value={formData.date_of_issuance}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                  <input
                    type="time"
                    name="issuance_time"
                    id="issuance_time"
                    value={formData.issuance_time}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="note" className="block text-sm font-medium leading-6 text-slate-900">
                  Authorization Notes / Remarks
                </label>
                <div className="mt-2">
                  <textarea
                    id="note"
                    name="note"
                    rows={4}
                    value={formData.note}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    placeholder="Reason for issuance or condition noted during handoff..."
                  ></textarea>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-x-6 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-10">
          <Link to="/issuance" className="text-sm font-semibold leading-6 text-slate-900">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || isLoadingData}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSubmitting ? 'Processing...' : 'Complete Issuance'}
          </button>
        </div>
      </form>
    </div>
  );
}
