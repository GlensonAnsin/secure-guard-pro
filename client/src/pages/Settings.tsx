/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { User, Bell, Shield, Moon, Globe, Key, Save, Loader2 } from 'lucide-react';
import { authService } from '../services/authService';
import { guardService } from '../services/guardService';

export function Settings() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setFormData({
        first_name: currentUser.first_name || '',
        last_name: currentUser.last_name || '',
        email: currentUser.email || '',
      });
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    setMessage(null);
    try {
      const res = (await guardService.update(user.id, formData)) as any;
      if (res.success || res.status === 200) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });

        // Update local storage user data
        const updatedUser = { ...user, ...formData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
      } else {
        setMessage({ type: 'error', text: res.message || 'Failed to update profile.' });
      }
    } catch (err: any) {
      console.error(err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Error occurred while saving.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">System Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account settings, preferences, and system configurations.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation Sidebar */}
        <div className="w-full md:w-64 shrink-0">
          <nav className="flex flex-col space-y-1">
            <a
              href="#"
              className="bg-blue-50 text-blue-700 hover:bg-blue-50 hover:text-blue-700 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
            >
              <User
                className="text-blue-500 group-hover:text-blue-500 flex-shrink-0 -ml-1 mr-3 h-5 w-5"
                aria-hidden="true"
              />
              <span className="truncate">Profile</span>
            </a>
            <a
              href="#"
              className="text-slate-700 hover:bg-slate-50 hover:text-slate-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
            >
              <Key
                className="text-slate-400 group-hover:text-slate-500 flex-shrink-0 -ml-1 mr-3 h-5 w-5"
                aria-hidden="true"
              />
              <span className="truncate">Security & Password</span>
            </a>
            <a
              href="#"
              className="text-slate-700 hover:bg-slate-50 hover:text-slate-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
            >
              <Bell
                className="text-slate-400 group-hover:text-slate-500 flex-shrink-0 -ml-1 mr-3 h-5 w-5"
                aria-hidden="true"
              />
              <span className="truncate">Notifications</span>
            </a>
            <a
              href="#"
              className="text-slate-700 hover:bg-slate-50 hover:text-slate-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
            >
              <Moon
                className="text-slate-400 group-hover:text-slate-500 flex-shrink-0 -ml-1 mr-3 h-5 w-5"
                aria-hidden="true"
              />
              <span className="truncate">Appearance</span>
            </a>
            <a
              href="#"
              className="text-slate-700 hover:bg-slate-50 hover:text-slate-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
            >
              <Shield
                className="text-slate-400 group-hover:text-slate-500 flex-shrink-0 -ml-1 mr-3 h-5 w-5"
                aria-hidden="true"
              />
              <span className="truncate">Roles & Permissions</span>
            </a>
            <a
              href="#"
              className="text-slate-700 hover:bg-slate-50 hover:text-slate-900 group flex items-center px-3 py-2 text-sm font-medium rounded-md"
            >
              <Globe
                className="text-slate-400 group-hover:text-slate-500 flex-shrink-0 -ml-1 mr-3 h-5 w-5"
                aria-hidden="true"
              />
              <span className="truncate">Localization</span>
            </a>
          </nav>
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 space-y-6">
          <form
            className="bg-white shadow-sm ring-1 ring-slate-200 rounded-xl overflow-hidden"
            onSubmit={handleSaveProfile}
          >
            <div className="px-6 py-5 border-b border-slate-200">
              <h3 className="text-base font-semibold leading-6 text-slate-900">Personal Information</h3>
              <p className="mt-1 text-sm text-slate-500">Update your basic profile information and email address.</p>
            </div>
            <div className="px-6 py-6 sm:p-8 space-y-6">
              {message && (
                <div
                  className={`p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                >
                  {message.text}
                </div>
              )}

              <div className="flex items-center gap-x-6">
                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold border border-slate-200 uppercase">
                  {user ? `${formData.first_name?.[0] || ''}${formData.last_name?.[0] || ''}` : 'AD'}
                </div>
                <div>
                  <button
                    type="button"
                    className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                  >
                    Change avatar
                  </button>
                  <p className="mt-2 text-xs leading-5 text-slate-500">JPG, GIF or PNG. 1MB max.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-6">
                <div className="sm:col-span-3">
                  <label htmlFor="first_name" className="block text-sm font-medium leading-6 text-slate-900">
                    First name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="first_name"
                      id="first_name"
                      required
                      value={formData.first_name}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-3">
                  <label htmlFor="last_name" className="block text-sm font-medium leading-6 text-slate-900">
                    Last name
                  </label>
                  <div className="mt-2">
                    <input
                      type="text"
                      name="last_name"
                      id="last_name"
                      required
                      value={formData.last_name}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>

                <div className="sm:col-span-4">
                  <label htmlFor="email" className="block text-sm font-medium leading-6 text-slate-900">
                    Email address
                  </label>
                  <div className="mt-2">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full rounded-md border-0 py-2 text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-end border-t border-slate-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>

          {/* Other settings cards hidden for brevity, can remain as static UI */}
        </div>
      </div>
    </div>
  );
}
