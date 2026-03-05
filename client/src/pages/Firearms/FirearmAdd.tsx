/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { firearmService } from '../../services/firearmService';

export function FirearmAdd() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firearmCategory: 'Pistol',
    makeModel: '',
    serial_num: '',
    exp_of_registration: '',
    reg_date: '',
    status: 'Available',
    note: '',
  }); 

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        type: `${formData.firearmCategory} - ${formData.makeModel}`,
        serial_num: formData.serial_num,
        exp_of_registration: formData.exp_of_registration,
        status: formData.status,
        note: formData.note || null,
      };

      const res = (await firearmService.create(payload)) as any;
      if (res.success || res.status === 201 || res.status === 200) {
        navigate('/firearms');
      } else {
        setError(res.message || 'Failed to register firearm.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred while registering the firearm.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/firearms" className="rounded-full p-2 hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add New Firearm</h1>
          <p className="mt-1 text-sm text-slate-500">Register a new firearm to the agency's inventory.</p>
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
              Equipment Registration
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="firearmCategory" className="block text-sm font-medium leading-6 text-slate-900">
                  Firearm Type
                </label>
                <div className="mt-2">
                  <select
                    id="firearmCategory"
                    name="firearmCategory"
                    value={formData.firearmCategory}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  >
                    <option value="Pistol">Pistol</option>
                    <option value="Shotgun">Shotgun</option>
                    <option value="Revolver">Revolver</option>
                    <option value="Assault Rifle">Assault Rifle</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="makeModel" className="block text-sm font-medium leading-6 text-slate-900">
                  Make & Model *
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    name="makeModel"
                    id="makeModel"
                    value={formData.makeModel}
                    onChange={handleChange}
                    placeholder="e.g. Glock 19"
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="serial_num" className="block text-sm font-medium leading-6 text-slate-900">
                  Serial Number *
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    name="serial_num"
                    id="serial_num"
                    value={formData.serial_num}
                    onChange={handleChange}
                    className="block w-full font-code rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 uppercase"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="reg_date" className="block text-sm font-medium leading-6 text-slate-900">
                  Registration Date
                </label>
                <div className="mt-2">
                  <input
                    type="date"
                    name="reg_date"
                    id="reg_date"
                    value={formData.reg_date}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="exp_of_registration" className="block text-sm font-medium leading-6 text-slate-900">
                  License Expiration Date *
                </label>
                <div className="mt-2">
                  <input
                    type="date"
                    required
                    name="exp_of_registration"
                    id="exp_of_registration"
                    value={formData.exp_of_registration}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="col-span-full">
                <label htmlFor="note" className="block text-sm font-medium leading-6 text-slate-900">
                  Maintenance Notes
                </label>
                <div className="mt-2">
                  <textarea
                    id="note"
                    name="note"
                    rows={4}
                    value={formData.note}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-x-6 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-10">
          <Link to="/firearms" className="text-sm font-semibold leading-6 text-slate-900">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSubmitting ? 'Saving...' : 'Save Firearm'}
          </button>
        </div>
      </form>
    </div>
  );
}
