/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { guardService } from '../../services/guardService';

export function GuardAdd() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    guard_id: '',
    cel_num: '',
    email: '',
    street: '',
    barangay: '',
    city_or_municipality: '',
    province: '',
    region: '',
    status: 'Available',
    date_hired: new Date().toISOString().split('T')[0],
    username: '',
    password: '',
    role: 'Guard',
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
      // Basic fallback to ensure required username
      const payload = { ...formData };
      if (!payload.username) {
        payload.username = `${payload.first_name.toLowerCase()}.${payload.last_name.toLowerCase()}`;
      }

      const res = (await guardService.create(payload)) as any;
      if (res.success || res.status === 201 || res.status === 200) {
        navigate('/guards');
      } else {
        setError(res.message || 'Failed to create guard.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred while creating the guard.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/guards" className="rounded-full p-2 hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Add New Guard</h1>
          <p className="mt-1 text-sm text-slate-500">Enter personal and employment details to register a new guard.</p>
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

          {/* Personal Information */}
          <div>
            <h2 className="text-base font-semibold leading-7 text-slate-900 border-b border-slate-200 pb-2 mb-6">
              Personal Information
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="first_name" className="block text-sm font-medium leading-6 text-slate-900">
                  First name *
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    name="first_name"
                    id="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="last_name" className="block text-sm font-medium leading-6 text-slate-900">
                  Last name *
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    name="last_name"
                    id="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="cel_num" className="block text-sm font-medium leading-6 text-slate-900">
                  Contact Number
                </label>
                <div className="mt-2">
                  <input
                    type="tel"
                    name="cel_num"
                    id="cel_num"
                    value={formData.cel_num}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">
                  Email Address
                </label>
                <div className="mt-2">
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div>
            <h2 className="text-base font-semibold leading-7 text-slate-900 border-b border-slate-200 pb-2 mb-6">
              Address *
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-full">
                <label htmlFor="street" className="block text-sm font-medium leading-6 text-slate-900">
                  Street address
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="street"
                    id="street"
                    value={formData.street}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="barangay" className="block text-sm font-medium leading-6 text-slate-900">
                  Barangay
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    name="barangay"
                    id="barangay"
                    value={formData.barangay}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="city_or_municipality" className="block text-sm font-medium leading-6 text-slate-900">
                  City / Municipality
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    name="city_or_municipality"
                    id="city_or_municipality"
                    value={formData.city_or_municipality}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="province" className="block text-sm font-medium leading-6 text-slate-900">
                  Province
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    name="province"
                    id="province"
                    value={formData.province}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="region" className="block text-sm font-medium leading-6 text-slate-900">
                  Region
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    name="region"
                    id="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Employment Details */}
          <div>
            <h2 className="text-base font-semibold leading-7 text-slate-900 border-b border-slate-200 pb-2 mb-6">
              Employment & System Details
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="guard_id" className="block text-sm font-medium leading-6 text-slate-900">
                  Guard ID (License Number)
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="guard_id"
                    id="guard_id"
                    value={formData.guard_id}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="date_hired" className="block text-sm font-medium leading-6 text-slate-900">
                  Date Hired *
                </label>
                <div className="mt-2">
                  <input
                    type="date"
                    required
                    name="date_hired"
                    id="date_hired"
                    value={formData.date_hired}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="username" className="block text-sm font-medium leading-6 text-slate-900">
                  System Username
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Defaults to first.last"
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900">
                  System Password *
                </label>
                <div className="mt-2">
                  <input
                    type="password"
                    required
                    name="password"
                    id="password"
                    minLength={8}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Must be at least 8 characters"
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="status" className="block text-sm font-medium leading-6 text-slate-900">
                  Initial Status
                </label>
                <div className="mt-2">
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2.5 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                  >
                    <option value="Available">Available</option>
                    <option value="On Duty">On Duty</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-x-6 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:px-10">
          <Link to="/guards" className="text-sm font-semibold leading-6 text-slate-900">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 flex items-center gap-2"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSubmitting ? 'Saving...' : 'Save Guard'}
          </button>
        </div>
      </form>
    </div>
  );
}
