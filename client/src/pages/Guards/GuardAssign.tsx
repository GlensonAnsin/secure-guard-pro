/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Link as LinkIcon } from 'lucide-react';
import { designationService } from '../../services/designationService';
import { companyService } from '../../services/companyService';
import { guardViewService } from '../../services/guardViewService';

export function GuardAssign() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [guardName, setGuardName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    company_id: '',
    address: '',
    day_start: '1',
    day_end: '5',
    shift_in: '',
    shift_out: '',
    date_assigned: new Date().toISOString().split('T')[0],
    note: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const [guardRes, companiesRes] = await Promise.all([
          guardViewService.getById(Number(id)),
          companyService.getAll(1, 100, '', 'active')
        ]);

        const guard = guardRes.data;
        if (guard.is_resigned) {
          setError('This guard has resigned and cannot be assigned to a post.');
        } else if (!guard.is_available) {
          setError('This guard is already assigned to a post. Dismiss the current assignment first.');
        } else if (guard.is_on_leave) {
          setError('This guard is currently on leave and cannot be assigned to a post.');
        }

        setGuardName(`${guard.first_name || ''} ${guard.last_name || ''}`.trim());
        setCompanies(companiesRes.data?.data || []);
      } catch (err) {
        console.error('Failed to fetch assignment data:', err);
        setError('Failed to load required data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
      // Auto-fill address if company changes
      if (name === 'company_id') {
        const selectedCompany = companies.find(c => c.id.toString() === value);
        if (selectedCompany) {
          newData.address = selectedCompany.address;
        } else {
          newData.address = '';
        }
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSubmitting(true);
    setError(null);
    try {
      // 1. Create Designation
      const designationPayload = {
        user_id: Number(id),
        company_id: Number(formData.company_id),
        day_start: Number(formData.day_start),
        day_end: Number(formData.day_end),
        shift_in: formData.shift_in,
        shift_out: formData.shift_out,
        date_assigned: formData.date_assigned,
        note: formData.note,
        status: 'active',
      };

      const desigRes = (await designationService.create(designationPayload)) as any;

      if (desigRes.success || desigRes.status === 201 || desigRes.status === 200) {
        // 2. Update Guard Status to assigned using the specific status update service
        await guardViewService.updateStatus(Number(id), 'assigned');
        navigate(`/guards/${id}`);
      } else {
        setError(desigRes.message || 'Failed to assign guard.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred while assigning the guard.');
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
        <Link to={`/guards/${id}`} className="rounded-full p-2 hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <LinkIcon className="h-6 w-6 text-blue-500" />
            Assign Guard to Client
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            You are assigning <strong>{guardName}</strong> to a new post.
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
                <label htmlFor="company_id" className="block text-sm font-medium leading-6 text-slate-900">
                  Select Company <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <select
                    required
                    name="company_id"
                    id="company_id"
                    value={formData.company_id}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2 bg-white"
                  >
                    <option value="">-- Choose a Company --</option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="address" className="block text-sm font-medium leading-6 text-slate-900">
                  Post Address (Auto-filled)
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    readOnly
                    name="address"
                    id="address"
                    placeholder="Select a company first"
                    value={formData.address}
                    className="block w-full rounded-md border-0 py-2 text-slate-500 shadow-sm ring-1 ring-inset ring-slate-200 bg-slate-50 sm:text-sm sm:leading-6 px-2 cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="day_start" className="block text-sm font-medium leading-6 text-slate-900">
                  Work Days Start <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <select
                    name="day_start"
                    id="day_start"
                    value={formData.day_start}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2 bg-white"
                  >
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                    <option value="0">Sunday</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="day_end" className="block text-sm font-medium leading-6 text-slate-900">
                  Work Days End <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <select
                    name="day_end"
                    id="day_end"
                    value={formData.day_end}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2 bg-white"
                  >
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                    <option value="0">Sunday</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="shift_in" className="block text-sm font-medium leading-6 text-slate-900">
                  Shift In (Start Time) <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    type="time"
                    required
                    name="shift_in"
                    id="shift_in"
                    value={formData.shift_in}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="shift_out" className="block text-sm font-medium leading-6 text-slate-900">
                  Shift Out (End Time) <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    type="time"
                    required
                    name="shift_out"
                    id="shift_out"
                    value={formData.shift_out}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="date_assigned" className="block text-sm font-medium leading-6 text-slate-900">
                  Date Assigned <span className="text-red-500">*</span>
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
          <Link to={`/guards/${id}`} className="text-sm font-semibold leading-6 text-slate-900">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting || !!error}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSubmitting ? 'Assigning...' : 'Complete Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
}
