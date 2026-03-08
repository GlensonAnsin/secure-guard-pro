import { useState, useEffect } from 'react';
import { Users, ShieldAlert, ShieldCheck, UserX, TrendingUp, Clock, Crosshair, X } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { dashboardService } from '../services/dashboardService';

export function Dashboard() {
  const [dashboardStats, setDashboardStats] = useState([
    { name: 'Total Guards', value: '0', icon: Users, change: '0%', changeType: 'neutral' },
    { name: 'Assigned', value: '0', icon: ShieldCheck, change: '0%', changeType: 'neutral' },
    { name: 'Unassigned', value: '0', icon: Clock, change: '0%', changeType: 'neutral' },
    { name: 'On Leave', value: '0', icon: UserX, change: '0%', changeType: 'neutral' },
  ]);

  const [attendanceData, setAttendanceData] = useState<{ name: string; present: number; late: number; absent: number }[]>([]);
  const [issuanceData, setIssuanceData] = useState<{ name: string; issuances: number }[]>([]);
  const [recentActivities, setRecentActivities] = useState<{ id: string | number; user: string; action: string; time: string; type: string }[]>([]);
  const [showActivitiesModal, setShowActivitiesModal] = useState(false);
  const [fullActivities, setFullActivities] = useState<{ id: string | number; user: string; action: string; time: string; type: string }[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  const fetchFullActivities = async () => {
    try {
      setIsLoadingActivities(true);
      setShowActivitiesModal(true);
      const res = await dashboardService.getActivities(50);
      if (res.data) {
        setFullActivities(res.data);
      }
    } catch (error) {
      console.error('Failed to fetch full activities', error);
    } finally {
      setIsLoadingActivities(false);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [guardRes, dashboardRes] = await Promise.all([
          api.get('/guard-stats'),
          dashboardService.getDashboardData(),
        ]);

        const gStats = guardRes.data?.meta || {};

        setDashboardStats([
          {
            name: 'Total Guards',
            value: gStats.total?.toString() || '0',
            icon: Users,
            change: '',
            changeType: 'neutral',
          },
          {
            name: 'Assigned',
            value: gStats.assigned?.toString() || '0',
            icon: ShieldCheck,
            change: '',
            changeType: 'neutral',
          },
          {
            name: 'Unassigned',
            value: gStats.unassigned?.toString() || '0',
            icon: Clock,
            change: '',
            changeType: 'neutral',
          },
          {
            name: 'On Leave',
            value: gStats.on_leave?.toString() || '0',
            icon: UserX,
            change: '',
            changeType: 'neutral',
          },
        ]);

        if (dashboardRes.data) {
          const { attendanceData, issuanceData, recentActivities } = dashboardRes.data;
          // Reverse attendanceData so it's chronologically left-to-right
          setAttendanceData(attendanceData ? attendanceData.reverse() : []);
          setIssuanceData(issuanceData ? issuanceData.reverse() : []);
          setRecentActivities(recentActivities || []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
              </div>
              <div className="rounded-md bg-blue-50 p-2 border border-blue-100">
                <stat.icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
            </div>
            {stat.change && (
              <div className="mt-4 flex items-center text-sm">
                <TrendingUp
                  className={`mr-1.5 h-4 w-4 shrink-0 ${
                    stat.changeType === 'positive'
                      ? 'text-green-500'
                      : stat.changeType === 'negative'
                        ? 'text-red-500'
                        : 'text-slate-400'
                  } ${stat.changeType === 'negative' && 'rotate-180'}`}
                  aria-hidden="true"
                />
                <span
                  className={`${
                    stat.changeType === 'positive'
                      ? 'text-green-600'
                      : stat.changeType === 'negative'
                        ? 'text-red-600'
                        : 'text-slate-600'
                  } font-medium`}
                >
                  {stat.change}
                </span>
                <span className="ml-2 text-slate-500">from last month</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="text-base font-semibold leading-6 text-slate-900">Weekly Attendance</h3>
          </div>
          <div className="p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={attendanceData}>
                <defs>
                  <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dx={-10} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area
                  type="monotone"
                  dataKey="present"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorPresent)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="text-base font-semibold leading-6 text-slate-900">
              Monthly Reports (Issuances in the last 6 months)
            </h3>
          </div>
          <div className="p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={issuanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="issuances" fill="#135dff" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl bg-white shadow-sm ring-1 ring-slate-200 h-full">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h3 className="text-base font-semibold leading-6 text-slate-900">Recent Activities</h3>
            <button
              onClick={fetchFullActivities}
              className="text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
            >
              View all
            </button>
          </div>
          <ul role="list" className="divide-y divide-slate-100 p-2">
            {recentActivities.map((activity) => (
              <li
                key={activity.id}
                className="flex justify-between gap-x-6 px-4 py-4 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <div className="flex min-w-0 gap-x-4 items-center">
                  <div
                    className={`h-10 w-10 flex items-center justify-center rounded-full flex-shrink-0 ${
                      activity.type === 'alert'
                        ? 'bg-red-100 text-red-600'
                        : activity.type === 'assignment'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {activity.type === 'alert' ? <ShieldAlert size={20} /> : <Users size={20} />}
                  </div>
                  <div className="min-w-0 flex-auto">
                    <p className="text-sm font-semibold leading-6 text-slate-900">{activity.user}</p>
                    <p className="mt-1 truncate text-xs leading-5 text-slate-500">{activity.action}</p>
                  </div>
                </div>
                <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                  <p className="text-sm leading-6 text-slate-900">{activity.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="text-base font-semibold leading-6 text-slate-900">Quick Actions</h3>
          </div>
          <div className="p-4 grid grid-cols-1 gap-2">
            <Link
              to="/guards/add"
              className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <span className="flex items-center">
                <Users className="mr-3 h-5 w-5 text-slate-400" /> Add Guard
              </span>
              <span className="text-slate-400">&rarr;</span>
            </Link>
            <Link
              to="/issuance/issue"
              className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
            >
              <span className="flex items-center">
                <Crosshair className="mr-3 h-5 w-5 text-slate-400" /> Issue Firearm
              </span>
              <span className="text-slate-400">&rarr;</span>
            </Link>
          </div>
        </div>
      </div>

      {showActivitiesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h3 className="text-lg font-semibold text-slate-900">All Recent Activities</h3>
              <button
                onClick={() => setShowActivitiesModal(false)}
                className="text-slate-400 hover:text-slate-500 transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto p-2 flex-1">
              {isLoadingActivities ? (
                <div className="flex justify-center items-center h-32 text-slate-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
                  Loading activities...
                </div>
              ) : fullActivities.length === 0 ? (
                <div className="flex justify-center items-center h-32 text-slate-500">No activities found.</div>
              ) : (
                <ul role="list" className="divide-y divide-slate-100">
                  {fullActivities.map((activity) => (
                    <li
                      key={activity.id}
                      className="flex justify-between gap-x-6 px-4 py-4 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <div className="flex min-w-0 gap-x-4 items-center">
                        <div
                          className={`h-10 w-10 flex items-center justify-center rounded-full flex-shrink-0 ${
                            activity.type === 'alert'
                              ? 'bg-red-100 text-red-600'
                              : activity.type === 'assignment'
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {activity.type === 'alert' ? <ShieldAlert size={20} /> : <Users size={20} />}
                        </div>
                        <div className="min-w-0 flex-auto">
                          <p className="text-sm font-semibold leading-6 text-slate-900">{activity.user}</p>
                          <p className="mt-1 text-sm leading-5 text-slate-500">{activity.action}</p>
                        </div>
                      </div>
                      <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
                        <p className="text-sm leading-6 text-slate-900 whitespace-nowrap">{activity.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-end">
              <button
                onClick={() => setShowActivitiesModal(false)}
                className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
