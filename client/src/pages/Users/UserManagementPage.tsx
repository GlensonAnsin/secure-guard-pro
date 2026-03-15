/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Mail, 
  Shield, 
  MapPin, 
  Edit, 
  Archive, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  X,
  User as UserIcon,
  Lock,
  Contact,
  CheckCircle2,
} from 'lucide-react';
import axios from 'axios';
import { userManagementService } from '../../services/userManagementService';

const formatCityName = (name: string) => {
  if (name && name.toLowerCase().startsWith('city of ')) {
    return name.substring(8) + ' City';
  }
  return name;
};

export function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState<any>({});
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: '', middle_name: '', last_name: '', email: '', username: '',
    password: '', role_slug: 'hr', street: '',
    barangay: '', city_or_municipality: '', province: '', region: '',
    date_hired: new Date().toISOString().split('T')[0],
  });

  const [regions, setRegions] = useState<any[]>([]);
  const [provinces, setProvinces] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);
  const [barangays, setBarangays] = useState<any[]>([]);

  const [selectedRegionCode, setSelectedRegionCode] = useState('');
  const [selectedProvinceCode, setSelectedProvinceCode] = useState('');
  const [selectedCityCode, setSelectedCityCode] = useState('');
  const [selectedBarangayCode, setSelectedBarangayCode] = useState('');
  const [isAddrLoading, setIsAddrLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  useEffect(() => {
    axios.get('https://psgc.gitlab.io/api/regions/')
      .then((res) => {
        setRegions(res.data.sort((a: any, b: any) => a.name.localeCompare(b.name)));
      })
      .catch((err) => console.error('Failed to fetch regions:', err));
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await userManagementService.getAll(page, 15, search);
      setUsers(res.data?.data || []);
      setMeta(res.data?.meta || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingUser) {
        const { password, ...updateData } = formData;
        await userManagementService.update(editingUser.id, password ? formData : updateData);
      } else {
        await userManagementService.create(formData);
      }
      setShowForm(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      console.error(err);
      const message = err.response?.data?.message || err.message || 'Failed to save user';
      alert(message);
    }
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

  const resetForm = () => {
    setFormData({
      first_name: '', middle_name: '', last_name: '', email: '', username: '',
      password: '', role_slug: 'hr', street: '',
      barangay: '', city_or_municipality: '', province: '', region: '',
      date_hired: new Date().toISOString().split('T')[0],
    });
    setSelectedRegionCode('');
    setSelectedProvinceCode('');
    setSelectedCityCode('');
    setSelectedBarangayCode('');
    setProvinces([]);
    setCities([]);
    setBarangays([]);
    setShowPassword(false);
  };

  const handleEdit = async (user: any) => {
    setEditingUser(user);
    const role = user.userRoles?.[0]?.role?.slug || 'hr';
    setFormData({
      first_name: user.first_name || '', middle_name: user.middle_name || '',
      last_name: user.last_name || '', email: user.email || '',
      username: user.username || '', password: '', role_slug: role,
      street: user.street || '',
      barangay: user.barangay || '', city_or_municipality: user.city_or_municipality || '',
      province: user.province || '', region: user.region || '',
      date_hired: user.date_hired || new Date().toISOString().split('T')[0],
    });
    setShowForm(true);

    // PSGC Reverse Lookup
    if (user.region) {
      setIsAddrLoading(true);
      try {
        const r = regions.find((reg: any) => reg.name === user.region);
        if (r) {
          const rCode = r.code;
          setSelectedRegionCode(rCode);

          const provsRes = await axios.get(`https://psgc.gitlab.io/api/regions/${rCode}/provinces/`);
          const provsData = provsRes.data;
          const sortedProvs = provsData?.length > 0 
            ? provsData.sort((a: any, b: any) => a.name.localeCompare(b.name))
            : [{ code: 'NCR_DIRECT', name: 'Metro Manila (Direct)' }];
          setProvinces(sortedProvs);

          const pMatch = sortedProvs.find((p: any) => p.name === user.province || (user.province === 'Metro Manila' && p.code === 'NCR_DIRECT'));
          if (pMatch) {
            const pCode = pMatch.code;
            setSelectedProvinceCode(pCode);

            const citiesRes = pCode === 'NCR_DIRECT'
              ? await axios.get(`https://psgc.gitlab.io/api/regions/${rCode}/cities-municipalities/`)
              : await axios.get(`https://psgc.gitlab.io/api/provinces/${pCode}/cities-municipalities/`);
            
            const sortedCities = citiesRes.data.map((c: any) => ({ ...c, name: formatCityName(c.name) }))
              .sort((a: any, b: any) => a.name.localeCompare(b.name));
            setCities(sortedCities);

            const cMatch = sortedCities.find((c: any) => c.name === user.city_or_municipality);
            if (cMatch) {
              const cCode = cMatch.code;
              setSelectedCityCode(cCode);

              const brgyRes = await axios.get(`https://psgc.gitlab.io/api/cities-municipalities/${cCode}/barangays/`);
              const sortedBrgy = brgyRes.data.sort((a: any, b: any) => a.name.localeCompare(b.name));
              setBarangays(sortedBrgy);

              const bMatch = sortedBrgy.find((b: any) => b.name === user.barangay);
              if (bMatch) setSelectedBarangayCode(bMatch.code);
            }
          }
        }
      } catch (err) {
        console.error('Reverse lookup failed:', err);
      } finally {
        setIsAddrLoading(false);
      }
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await userManagementService.delete(id);
        fetchUsers();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getRoleBadge = (user: any) => {
    const roles = user.userRoles?.map((ur: any) => ur.role?.slug) || [];
    const is_admin = roles.includes('admin');
    
    return (
      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
        is_admin 
          ? 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20' 
          : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
      }`}>
        <Shield className="h-3 w-3" />
        {user.userRoles?.map((ur: any) => ur.role?.role_name).join(', ') || '—'}
      </span>
    );
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 border border-blue-100 shadow-sm">
            <Users className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">User Management</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage administrative roles, HR personnel, and system access.
            </p>
          </div>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingUser(null); resetForm(); }}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all active:scale-95 gap-2 cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-slate-200 p-4 bg-slate-50/50">
          <div className="relative w-full max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, or username..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="block w-full rounded-lg border-0 py-2 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto relative flex-1">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium text-slate-600">Loading user catalog...</p>
            </div>
          )}

          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Role & Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Contact Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Location</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                        <UserIcon className="h-5 w-5 text-slate-500" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">{user.first_name} {user.last_name}</div>
                        <div className="text-xs text-slate-500">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-sm text-slate-600">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {user.city_or_municipality}, {user.province}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Archive User"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {users.length === 0 && !loading && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="rounded-full bg-slate-50 p-6 mb-4">
                        <Users className="h-12 w-12 text-slate-300" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900">No users found</h3>
                      <p className="text-slate-500 mt-1 max-w-xs mx-auto">
                        Your search didn't match any system users. Try a different query.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 mt-auto">
            <div className="flex flex-1 items-center justify-between">
              <p className="text-sm text-slate-700">
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{meta.totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </button>
                <button
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal Overlay */}
      {showForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-3xl flex flex-col max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-100 p-2">
                  {editingUser ? <Edit className="h-5 w-5 text-blue-600" /> : <UserPlus className="h-5 w-5 text-blue-600" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{editingUser ? 'Edit System User' : 'Register New User'}</h2>
                  <p className="text-xs text-slate-500">Configure access and personnel details.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowForm(false)} 
                className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-3">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
                      <Contact className="h-4 w-4 text-blue-500" />
                      Personal Information
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="block w-full rounded-lg border-slate-200 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all px-2"
                      placeholder="John"
                      required
                      pattern="^[A-Za-z\s]+$"
                      title="First name must contain only letters and spaces"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Middle Name</label>
                    <input
                      type="text"
                      value={formData.middle_name}
                      onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                      className="block w-full rounded-lg border-slate-200 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all px-2"
                      placeholder="Quincy"
                      pattern="^[A-Za-z\s]+$"
                      title="Middle name must contain only letters and spaces"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="block w-full rounded-lg border-slate-200 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all px-2"
                      placeholder="Doe"
                      required
                      pattern="^[A-Za-z\s]+$"
                      title="Last name must contain only letters and spaces"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <div className="h-px bg-slate-100 my-2" />
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
                      <Shield className="h-4 w-4 text-blue-500" />
                      Account Configuration
                    </h3>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="block w-full rounded-lg border-slate-200 py-2 pl-10 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all px-2"
                        placeholder="john.doe@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      Username <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="block w-full rounded-lg border-slate-200 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all px-2"
                      placeholder="jdoe2024"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">System Role</label>
                    <select
                      value={formData.role_slug}
                      onChange={(e) => setFormData({ ...formData, role_slug: e.target.value })}
                      className="block w-full rounded-lg border-slate-200 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all appearance-none bg-slate-50/50 px-2"
                    >
                      <option value="admin">Administrator</option>
                      <option value="hr">Human Resources</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      {editingUser ? 'New Password (Leave empty to keep current)' : 'Account Password'}
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="block w-full rounded-lg border-slate-200 py-2 pl-10 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all px-2"
                        placeholder="••••••••"
                        {...(!editingUser ? { required: true } : {})}
                      />
                    </div>
                    <div className="mt-2 flex items-center">
                      <input
                        id="show-password"
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

                  <div className="md:col-span-3">
                    <div className="h-px bg-slate-100 my-2" />
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        Permanent Address
                      </h3>
                      {isAddrLoading && (
                        <div className="flex items-center gap-2 text-xs text-blue-600 animate-pulse">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          Initializing address...
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Region <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={selectedRegionCode}
                      onChange={handleRegionChange}
                      className="block w-full rounded-lg border-slate-200 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all px-2"
                    >
                      <option value="">Select Region</option>
                      {regions.map((r) => (
                        <option key={r.code} value={r.code}>{r.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Province <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={selectedProvinceCode}
                      onChange={handleProvinceChange}
                      disabled={!selectedRegionCode}
                      className="block w-full rounded-lg border-slate-200 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all px-2 disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">Select Province</option>
                      {provinces.map((p) => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">City / Municipality <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={selectedCityCode}
                      onChange={handleCityChange}
                      disabled={!selectedProvinceCode}
                      className="block w-full rounded-lg border-slate-200 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all px-2 disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">Select City / Municipality</option>
                      {cities.map((c) => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Barangay <span className="text-red-500">*</span></label>
                    <select
                      required
                      value={selectedBarangayCode}
                      onChange={handleBarangayChange}
                      disabled={!selectedCityCode}
                      className="block w-full rounded-lg border-slate-200 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all px-2 disabled:bg-slate-50 disabled:text-slate-400"
                    >
                      <option value="">Select Barangay</option>
                      {barangays.map((b) => (
                        <option key={b.code} value={b.code}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Street Address</label>
                    <input
                      type="text"
                      value={formData.street}
                      onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                      className="block w-full rounded-lg border-slate-200 py-2 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm transition-all px-2"
                      placeholder="Unit/House No., Building, Street Name"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-auto border-t border-slate-200 p-6 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-end gap-3 rounded-b-2xl">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="rounded-lg px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all active:scale-95 cursor-pointer w-full sm:w-auto text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all active:scale-95 cursor-pointer w-full sm:w-auto"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {editingUser ? 'Update Profile' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
