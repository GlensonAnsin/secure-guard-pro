/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { firearmService } from '../../services/firearmService';

const FIREARM_MODELS: Record<string, string[]> = {
  Pistol: ['Glock 19', 'Glock 17', 'Beretta 92FS', 'Sig Sauer P320', 'Colt M1911', 'CZ 75'],
  Shotgun: ['Remington 870', 'Mossberg 500', 'Benelli M4', 'Rock Island Armory VR80'],
  Revolver: ['Smith & Wesson Model 686', 'Colt Python', 'Ruger GP100', 'Taurus Model 85'],
  'Assault Rifle': ['Colt M4', 'Armalite M16', 'Tavor X95', 'Steyr AUG'],
};

export function FirearmAdd() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [availableModels, setAvailableModels] = useState<string[]>(FIREARM_MODELS['Pistol']);

  const [formData, setFormData] = useState({
    firearmCategory: 'Pistol',
    makeModel: FIREARM_MODELS['Pistol'][0],
    serial_num: '',
    exp_of_registration: '',
    reg_date: '',
    is_available: true,
    is_maintenance: false,
    is_damaged: false,
    note: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'firearmCategory') {
      const newModels = FIREARM_MODELS[value as keyof typeof FIREARM_MODELS] || [];
      setAvailableModels(newModels);
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        makeModel: newModels.length > 0 ? newModels[0] : '',
      }));
    } else {
      setFormData((prev) => {
        const newData = { ...prev, [name]: value };
        
        // Auto-calculate expiry flags if date changes
        if (name === 'exp_of_registration') {
          const expiryDate = new Date(value);
          const now = new Date();
          const diffDays = (expiryDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
          
          Object.assign(newData, {
            is_expired: diffDays <= 0,
            is_expiring: diffDays > 0 && diffDays < 30
          });
        }
        
        return newData;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        type: `${formData.firearmCategory} - ${formData.makeModel}`,
        serial_num: formData.serial_num.toUpperCase(),
        exp_of_registration: formData.exp_of_registration,
        is_available: formData.is_available,
        is_maintenance: formData.is_maintenance,
        is_damaged: formData.is_damaged,
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
                    className="block w-full rounded-md border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
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
                  Make & Model <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <select
                    required
                    name="makeModel"
                    id="makeModel"
                    value={formData.makeModel}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  >
                    {availableModels.map((model) => (
                      <option key={model} value={model}>
                        {model}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="sm:col-span-6">
                <label htmlFor="serial_num" className="block text-sm font-medium leading-6 text-slate-900">
                  Serial Number <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    name="serial_num"
                    id="serial_num"
                    value={formData.serial_num}
                    onChange={handleChange}
                    className="block w-full font-code rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 uppercase px-2"
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
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="exp_of_registration" className="block text-sm font-medium leading-6 text-slate-900">
                  License Expiration Date <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    type="date"
                    required
                    name="exp_of_registration"
                    id="exp_of_registration"
                    value={formData.exp_of_registration}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="is_available" className="block text-sm font-medium leading-6 text-slate-900">
                  Initial Availability
                </label>
                <div className="mt-2">
                  <select
                    id="is_available"
                    name="is_available"
                    value={formData.is_available ? 'true' : 'false'}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_available: e.target.value === 'true' }))}
                    className="block w-full rounded-md border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  >
                    <option value="true">Available</option>
                    <option value="false">Unavailable</option>
                  </select>
                </div>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-sm font-medium leading-6 text-slate-900">
                  Status Flags
                </label>
                <div className="mt-4 space-y-4">
                  <div className="relative flex items-start">
                    <div className="flex h-6 items-center">
                      <input
                        id="is_maintenance"
                        name="is_maintenance"
                        type="checkbox"
                        checked={formData.is_maintenance}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_maintenance: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                      <label htmlFor="is_maintenance" className="font-medium text-slate-900">
                        Under Maintenance
                      </label>
                    </div>
                  </div>
                  <div className="relative flex items-start">
                    <div className="flex h-6 items-center">
                      <input
                        id="is_damaged"
                        name="is_damaged"
                        type="checkbox"
                        checked={formData.is_damaged}
                        onChange={(e) => setFormData(prev => ({ ...prev, is_damaged: e.target.checked }))}
                        className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                      />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                      <label htmlFor="is_damaged" className="font-medium text-slate-900">
                        Damaged
                      </label>
                    </div>
                  </div>
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
