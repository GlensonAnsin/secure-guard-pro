/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Edit } from 'lucide-react';
import { guardService } from '../../services/guardService';
import { designationService } from '../../services/designationService';

export function GuardAssignmentEdit() {
  const navigate = useNavigate();
  const { guardId, id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardName, setGuardName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    client: '',
    address: '',
    shift_in: '',
    shift_out: '',
    date_assigned: '',
    date_of_dismissal: '',
    status: '',
    note: '',
  });

  useEffect(() => {
    const fetchDetails = async () => {
      if (!guardId || !id) return;
      try {
        // Fetch Guard Name
        const guardRes = await guardService.getById(Number(guardId));
        const guard = guardRes.data;
        setGuardName(`${guard.first_name || ''} ${guard.last_name || ''}`.trim());

        // Fetch Designation info
        const designationRes = await designationService.getById(Number(id));
        const designation = designationRes.data;

        setFormData({
          client: designation.client || '',
          address: designation.address || '',
          shift_in: designation.shift_in || '',
          shift_out: designation.shift_out || '',
          date_assigned: designation.date_assigned || '',
          date_of_dismissal: designation.date_of_dismissal || '',
          status: designation.status || 'active',
          note: designation.note || '',
        });
      } catch (err) {
        console.error('Failed to fetch assignment details:', err);
        setError('Failed to fetch assignment details.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [guardId, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !guardId) return;

    setIsSubmitting(true);
    setError(null);
    try {
      // Clean up dismissal date if set back to active
      const payload = { ...formData };
      if (payload.status === 'active') {
        payload.date_of_dismissal = ''; // Active guards shouldn't have a dismissed date sent
      }

      const desigRes = (await designationService.update(Number(id), payload)) as any;

      if (desigRes.success || desigRes.status === 200) {
        // 2. Update Guard Status appropriately based on the assignment status
        const guardStatus = payload.status === 'active' ? 'assigned' : 'unassigned';
        await guardService.update(Number(guardId), { status: guardStatus });
        navigate(`/guards/${guardId}`);
      } else {
        setError(desigRes.message || 'Failed to update assignment.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred while updating the assignment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link
          to={`/guards/${guardId}`}
          className="rounded-full p-2 hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Edit className="h-6 w-6 text-blue-500" />
            Edit Guard Assignment
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Modifying assignment for <strong>{guardName}</strong>.
          </p>
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

          <div>
            <h2 className="text-base font-semibold leading-7 text-slate-900 border-b border-slate-200 pb-2 mb-6">
              Assignment Details
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="client" className="block text-sm font-medium leading-6 text-slate-900">
                  Client Name *
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    name="client"
                    id="client"
                    value={formData.client}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="address" className="block text-sm font-medium leading-6 text-slate-900">
                  Post Address *
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="shift_in" className="block text-sm font-medium leading-6 text-slate-900">
                  Shift In (Start Time) *
                </label>
                <div className="mt-2">
                  <input
                    type="time"
                    required
                    name="shift_in"
                    id="shift_in"
                    step="1"
                    value={formData.shift_in}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="shift_out" className="block text-sm font-medium leading-6 text-slate-900">
                  Shift Out (End Time) *
                </label>
                <div className="mt-2">
                  <input
                    type="time"
                    required
                    name="shift_out"
                    id="shift_out"
                    step="1"
                    value={formData.shift_out}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="date_assigned" className="block text-sm font-medium leading-6 text-slate-900">
                  Date Assigned *
                </label>
                <div className="mt-2">
                  <input
                    type="date"
                    required
                    name="date_assigned"
                    id="date_assigned"
                    value={formData.date_assigned}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium leading-6 text-slate-900">
                  Status *
                </label>
                <div className="mt-2">
                  <select
                    id="status"
                    name="status"
                    required
                    value={formData.status}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  >
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="dismissed">Dismissed</option>
                  </select>
                </div>
              </div>

              {formData.status !== 'active' && (
                <div className="sm:col-span-3">
                  <label htmlFor="date_of_dismissal" className="block text-sm font-medium leading-6 text-slate-900">
                    Date Dismissed / Completed *
                  </label>
                  <div className="mt-2">
                    <input
                      type="date"
                      required={formData.status !== 'active'}
                      name="date_of_dismissal"
                      id="date_of_dismissal"
                      value={formData.date_of_dismissal || ''}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                    />
                  </div>
                </div>
              )}

              <div className="sm:col-span-full">
                <label htmlFor="note" className="block text-sm font-medium leading-6 text-slate-900">
                  Notes (Optional)
                </label>
                <div className="mt-2">
                  <textarea
                    name="note"
                    id="note"
                    rows={3}
                    value={formData.note}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-x-6 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-10">
          <Link to={`/guards/${guardId}`} className="text-sm font-semibold leading-6 text-slate-900">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
