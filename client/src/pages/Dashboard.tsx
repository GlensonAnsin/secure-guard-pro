import { Users, ShieldAlert, ShieldCheck, UserX, TrendingUp, Clock, Crosshair } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Link } from 'react-router-dom';

const stats = [
  { name: 'Total Guards', value: '124', icon: Users, change: '+4.75%', changeType: 'positive' },
  { name: 'On Duty', value: '82', icon: ShieldCheck, change: '+1.02%', changeType: 'positive' },
  { name: 'Available', value: '35', icon: Clock, change: '-3.2%', changeType: 'negative' },
  { name: 'On Leave', value: '7', icon: UserX, change: '0.00%', changeType: 'neutral' },
];

const attendanceData = [
  { name: 'Mon', present: 110, late: 5, absent: 2 },
  { name: 'Tue', present: 115, late: 2, absent: 1 },
  { name: 'Wed', present: 108, late: 6, absent: 3 },
  { name: 'Thu', present: 118, late: 1, absent: 0 },
  { name: 'Fri', present: 120, late: 3, absent: 1 },
  { name: 'Sat', present: 85, late: 2, absent: 1 },
  { name: 'Sun', present: 82, late: 0, absent: 0 },
];

const incidentData = [
  { name: 'Jan', incidents: 4 },
  { name: 'Feb', incidents: 7 },
  { name: 'Mar', incidents: 2 },
  { name: 'Apr', incidents: 5 },
  { name: 'May', incidents: 8 },
  { name: 'Jun', incidents: 3 },
];

const recentActivities = [
  { id: 1, user: 'John Doe', action: 'Assigned to Post A', time: '2 hours ago', type: 'assignment' },
  { id: 2, user: 'Sarah Smith', action: 'Reported Late', time: '4 hours ago', type: 'alert' },
  { id: 3, user: 'Mike Johnson', action: 'Firearm Issued (Glock 19)', time: '5 hours ago', type: 'issuance' },
  { id: 4, user: 'David Lee', action: 'Turned in Firearm', time: '6 hours ago', type: 'return' },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-slate-500">Last updated: Today at 09:41 AM</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
              </div>
              <div className="rounded-md bg-blue-50 p-2">
                <stat.icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
            </div>
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
            <h3 className="text-base font-semibold leading-6 text-slate-900">Monthly Reports (Incidents)</h3>
          </div>
          <div className="p-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={incidentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="incidents" fill="#0f172a" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl bg-white shadow-sm ring-1 ring-slate-200 h-full">
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <h3 className="text-base font-semibold leading-6 text-slate-900">Recent Activities</h3>
            <button className="text-sm font-medium text-blue-600 hover:text-blue-500">View all</button>
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
            <button className="flex w-full items-center justify-between rounded-lg bg-red-50/50 px-4 py-3 text-sm font-medium text-red-700 hover:bg-red-50">
              <span className="flex items-center">
                <ShieldAlert className="mr-3 h-5 w-5 text-red-400" /> Report Incident
              </span>
              <span className="text-red-400">&rarr;</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}