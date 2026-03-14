/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { guardService } from '../../services/guardService';
import axios from 'axios';

const formatCityName = (name: string) => {
  if (name.toLowerCase().startsWith('city of ')) {
    return name.substring(8) + ' City';
  }
  return name;
};

export function GuardEdit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [regions, setRegions] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<any[]>([]);

  const [selectedRegionCode, setSelectedRegionCode] = useState('');
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedCityCode, setSelectedCityCode] = useState('');
  const [selectedBarangayCode, setSelectedBarangayCode] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    guard_id: '',
    cel_num: '',
    email: '',
    street: '',
    barangay: '',
    city_or_municipality: '',
    province: '',
    region: '',
    status: 'available',
    date_hired: '',
    username: '',
    password: '',
    role: 'guard',
  });

  // Fetch initial regions and guard data
  useEffect(() => {
    const initializeData = async () => {
      try {
        // 1. Fetch Regions
        const regionsRes = await axios.get('https://psgc.gitlab.io/api/regions/');
        const regionsData = regionsRes.data;
        const sortedRegions = regionsData.sort((a: any, b: any) => a.name.localeCompare(b.name));
        setRegions(sortedRegions);

        // 2. Fetch Guard Data
        if (id) {
          const guardRes = await guardService.getById(Number(id));
          const guard = guardRes.data;

          setFormData({
            first_name: guard.first_name || '',
            middle_name: guard.middle_name || '',
            last_name: guard.last_name || '',
            suffix: guard.suffix || '',
            guard_id: guard.guard_id || '',
            cel_num: guard.cel_num || '',
            email: guard.email || '',
            street: guard.street || '',
            barangay: guard.barangay || '',
            city_or_municipality: guard.city_or_municipality || '',
            province: guard.province || '',
            region: guard.region || '',
            status: guard.status || 'available',
            date_hired: guard.date_hired || '',
            username: guard.username || '',
            password: guard.password || '',
            role: guard.role || 'guard',
          });

          // 3. Initiate Reverse Lookup for PSGC Codes based on saved string names
          let rCode = '';
          let pCode = '';
          let cCode = '';

          // Find Region Code
          if (guard.region) {
            const r = sortedRegions.find((reg: any) => reg.name === guard.region);
            if (r) {
              rCode = r.code;
              setSelectedRegionCode(rCode);

              // Find Province Code
              const provsRes = await axios.get(`https://psgc.gitlab.io/api/regions/${rCode}/provinces/`);
              const provsData = provsRes.data;

              let sortedProvs = [];
              if (provsData && provsData.length > 0) {
                sortedProvs = provsData.sort((a: any, b: any) => a.name.localeCompare(b.name));
              } else {
                sortedProvs = [{ code: 'NCR_DIRECT', name: 'Metro Manila (Direct)' }];
              }
              setProvinces(sortedProvs);

              pCode =
                sortedProvs.find(
                  (p: any) =>
                    p.name === guard.province || (guard.province === 'Metro Manila' && p.code === 'NCR_DIRECT'),
                )?.code || '';
              if (pCode) {
                setSelectedProvinceCode(pCode);

                // Find City Code
                let citiesRes;
                if (pCode === 'NCR_DIRECT') {
                  citiesRes = await axios.get(`https://psgc.gitlab.io/api/regions/${rCode}/cities-municipalities/`);
                } else {
                  citiesRes = await axios.get(`https://psgc.gitlab.io/api/provinces/${pCode}/cities-municipalities/`);
                }
                const citiesData = citiesRes.data;
                const formattedCities = citiesData.map((c: any) => ({ ...c, name: formatCityName(c.name) }));
                const sortedCities = formattedCities.sort((a: any, b: any) => a.name.localeCompare(b.name));
                setCities(sortedCities);

                cCode = sortedCities.find((c: any) => c.name === guard.city_or_municipality)?.code || '';
                if (cCode) {
                  setSelectedCityCode(cCode);

                  // Find Barangay Code
                  const brgyRes = await axios.get(`https://psgc.gitlab.io/api/cities-municipalities/${cCode}/barangays/`);
                  const brgyData = brgyRes.data;
                  const sortedBrgy = brgyData.sort((a: any, b: any) => a.name.localeCompare(b.name));
                  setBarangays(sortedBrgy);

                  const bCode = sortedBrgy.find((b: any) => b.name === guard.barangay)?.code || '';
                  if (bCode) {
                    setSelectedBarangayCode(bCode);
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to initialize edit page:', err);
        setError('Failed to load guard data.');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedRegionCode(code);
    setSelectedProvinceCode('');
    setSelectedCityCode('');
    setSelectedBarangayCode('');
    setCities([]);
    setProvinces([]);
    setBarangays([]);

    const region = regions.find((r) => r.code === code);
    setFormData((prev) => ({
      ...prev,
      region: region ? region.name : '',
      province: '',
      city_or_municipality: '',
      barangay: '',
    }));

    if (code) {
      try {
        const provRes = await axios.get(`https://psgc.gitlab.io/api/regions/${code}/provinces/`);
        const provData = provRes.data;

        if (provData && provData.length > 0) {
          setProvinces(provData.sort((a: any, b: any) => a.name.localeCompare(b.name)));
        } else {
          setProvinces([{ code: 'NCR_DIRECT', name: 'Metro Manila (Direct)' }]);
          const cityRes = await axios.get(`https://psgc.gitlab.io/api/regions/${code}/cities-municipalities/`);
          const cityData = cityRes.data;
          const formattedCities = cityData.map((c: any) => ({ ...c, name: formatCityName(c.name) }));
          setCities(formattedCities.sort((a: any, b: any) => a.name.localeCompare(b.name)));
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedProvinceCode(code);
    setSelectedCityCode('');
    setSelectedBarangayCode('');
    setCities([]);
    setBarangays([]);

    if (code === 'NCR_DIRECT') {
      setFormData((prev) => ({ ...prev, province: 'Metro Manila', city_or_municipality: '', barangay: '' }));
      try {
        const cityRes = await axios.get(`https://psgc.gitlab.io/api/regions/${selectedRegionCode}/cities-municipalities/`);
        const cityData = cityRes.data;
        const formattedCities = cityData.map((c: any) => ({ ...c, name: formatCityName(c.name) }));
        setCities(formattedCities.sort((a: any, b: any) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error(err);
      }
      return;
    }

    const province = provinces.find((p) => p.code === code);
    setFormData((prev) => ({
      ...prev,
      province: province ? province.name : '',
      city_or_municipality: '',
      barangay: '',
    }));

    if (code) {
      try {
        const cityRes = await axios.get(`https://psgc.gitlab.io/api/provinces/${code}/cities-municipalities/`);
        const cityData = cityRes.data;
        const formattedCities = cityData.map((c: any) => ({ ...c, name: formatCityName(c.name) }));
        setCities(formattedCities.sort((a: any, b: any) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedCityCode(code);
    setSelectedBarangayCode('');
    setBarangays([]);

    const city = cities.find((c) => c.code === code);
    if (city) {
      setFormData((prev) => ({
        ...prev,
        city_or_municipality: city.name,
        barangay: '',
      }));

      try {
        const brgyRes = await axios.get(`https://psgc.gitlab.io/api/cities-municipalities/${code}/barangays/`);
        const brgyData = brgyRes.data;
        setBarangays(brgyData.sort((a: any, b: any) => a.name.localeCompare(b.name)));
      } catch (err) {
        console.error(err);
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        city_or_municipality: '',
        barangay: '',
      }));
    }
  };

  const handleBarangayChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedBarangayCode(code);

    const brgy = barangays.find((b) => b.code === code);
    setFormData((prev) => ({
      ...prev,
      barangay: brgy ? brgy.name : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const payload = { ...formData };
      if (!payload.username) {
        payload.username = `${payload.first_name.toLowerCase()}.${payload.last_name.toLowerCase()}`;
      }

      const res = (await guardService.update(Number(id), payload)) as any;
      if (res.success || res.status === 201 || res.status === 200) {
        navigate('/guards');
      } else {
        setError(res.message || 'Failed to update guard.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'An error occurred while updating the guard.');
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
        <Link to="/guards" className="rounded-full p-2 hover:bg-slate-100 text-slate-500 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Edit Guard</h1>
          <p className="mt-1 text-sm text-slate-500">Update personal and employment details for this guard.</p>
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
              <div className="sm:col-span-2">
                <label htmlFor="first_name" className="block text-sm font-medium leading-6 text-slate-900">
                  First name <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    name="first_name"
                    id="first_name"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="middle_name" className="block text-sm font-medium leading-6 text-slate-900">
                  Middle name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="middle_name"
                    id="middle_name"
                    value={formData.middle_name}
                    onChange={handleChange}
                    minLength={2}
                    pattern="^[a-zA-Z\s]{2,}$"
                    title="Middle name must be at least 2 characters and no initials."
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="last_name" className="block text-sm font-medium leading-6 text-slate-900">
                  Last name <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    name="last_name"
                    id="last_name"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="suffix" className="block text-sm font-medium leading-6 text-slate-900">
                  Suffix (e.g. Jr, Sr)
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    name="suffix"
                    id="suffix"
                    value={formData.suffix}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="cel_num" className="block text-sm font-medium leading-6 text-slate-900">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    type="tel"
                    required
                    name="cel_num"
                    id="cel_num"
                    value={formData.cel_num}
                    onChange={handleChange}
                    maxLength={11}
                    pattern="\d{11}"
                    title="Contact number must be exactly 11 digits."
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
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
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div>
            <h2 className="text-base font-semibold leading-7 text-slate-900 border-b border-slate-200 pb-2 mb-6">
              Address
            </h2>
            <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="region" className="block text-sm font-medium leading-6 text-slate-900">
                  Region <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <select
                    required
                    id="region"
                    value={selectedRegionCode}
                    onChange={handleRegionChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  >
                    <option value="">Select Region</option>
                    {regions.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="province" className="block text-sm font-medium leading-6 text-slate-900">
                  Province <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <select
                    required
                    id="province"
                    value={selectedProvinceCode}
                    onChange={handleProvinceChange}
                    disabled={!selectedRegionCode}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2 disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    <option value="">Select Province</option>
                    {provinces.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="city_or_municipality" className="block text-sm font-medium leading-6 text-slate-900">
                  City / Municipality <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <select
                    required
                    id="city_or_municipality"
                    value={selectedCityCode}
                    onChange={handleCityChange}
                    disabled={!selectedProvinceCode}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2 disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    <option value="">Select City / Municipality</option>
                    {cities.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="sm:col-span-3">
                <label htmlFor="barangay" className="block text-sm font-medium leading-6 text-slate-900">
                  Barangay <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <select
                    required
                    id="barangay"
                    value={selectedBarangayCode}
                    onChange={handleBarangayChange}
                    disabled={!selectedCityCode}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2 disabled:bg-slate-100 disabled:text-slate-500"
                  >
                    <option value="">Select Barangay</option>
                    {barangays.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
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
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
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
                  Guard ID (License Number) <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    name="guard_id"
                    id="guard_id"
                    value={formData.guard_id}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="date_hired" className="block text-sm font-medium leading-6 text-slate-900">
                  Date Hired <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    type="date"
                    required
                    name="date_hired"
                    id="date_hired"
                    value={formData.date_hired}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
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
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  />
                </div>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-slate-900">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 px-2"
                  />
                </div>
                <div className="mt-2 flex items-center">
                  <input
                    id="show-password"
                    name="show-password"
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
                  />
                  <label
                    htmlFor="show-password"
                    className="ml-2 block text-sm text-slate-900 select-none cursor-pointer"
                  >
                    Show Password
                  </label>
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
            className="rounded-md bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSubmitting ? 'Saving...' : 'Update Guard'}
          </button>
        </div>
      </form>
    </div>
  );
}
