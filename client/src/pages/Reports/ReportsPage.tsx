/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Filter, 
  Users, 
  CalendarCheck, 
  Crosshair, 
  Building,
  Calendar,
  Search,
  Loader2,
  FileText
} from 'lucide-react';
import { reportService } from '../../services/reportService';
import { companyService } from '../../services/companyService';

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState('guards');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<any[]>([]);
  const [filters, setFilters] = useState({ 
    dateFrom: '', 
    dateTo: '', 
    companyId: '',
    firearmType: '',
    firearmStatus: '',
    companyStatus: ''
  });

  useEffect(() => {
    loadCompanies();
    setData([]);
    fetchReport();
  }, [activeTab]);

  const loadCompanies = async () => {
    try {
      const res = await companyService.getAll(1, 100);
      setCompanies(res.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReport = async () => {
    try {
      setLoading(true);
      let res;
      const params: any = {};
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.companyId) params.companyId = filters.companyId;

      switch (activeTab) {
        case 'guards':
          res = await reportService.getGuardReport(params);
          break;
        case 'attendance':
          res = await reportService.getAttendanceReport(params);
          break;
        case 'firearms':
          if (filters.firearmType) params.type = filters.firearmType;
          if (filters.firearmStatus) params.status = filters.firearmStatus;
          res = await reportService.getFirearmReport(params);
          break;
        case 'companies':
          if (filters.companyStatus) params.isActive = filters.companyStatus;
          res = await reportService.getCompanyReport(params);
          break;
      }
      setData(res?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const params: any = {};
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;
      if (filters.companyId) params.companyId = filters.companyId;
      if (filters.firearmType) params.type = filters.firearmType;
      if (filters.firearmStatus) params.status = filters.firearmStatus;
      if (filters.companyStatus) params.isActive = filters.companyStatus;
      await reportService.downloadCSV(activeTab, params);
    } catch (err) {
      console.error(err);
      alert('Failed to download report');
    }
  };

  const tabs = [
    { key: 'guards', label: 'Guards', icon: Users },
    { key: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { key: 'firearms', label: 'Firearms', icon: Crosshair },
    { key: 'companies', label: 'Companies', icon: Building },
  ];

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 border border-blue-100 shadow-sm">
            <BarChart3 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Analytics & Reports</h1>
            <p className="mt-1 text-sm text-slate-500">
              Generate and export comprehensive data reports for your operations.
            </p>
          </div>
        </div>
        <button
          onClick={handleDownload}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all active:scale-95 gap-2 cursor-pointer"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50/50">
          <nav className="flex -mb-px overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    group relative min-w-[120px] flex items-center justify-center gap-2 py-4 px-6 text-sm font-medium transition-all cursor-pointer
                    ${isActive 
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-white' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 border-b-2 border-transparent'
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <Filter className="h-4 w-4 text-slate-400" />
              <span>Filters</span>
            </div>

            {(activeTab === 'guards' || activeTab === 'attendance') && (
              <div className="flex gap-2">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="block rounded-lg border border-slate-200 pl-10 pr-3 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
                <div className="flex items-center text-slate-400 text-xs px-1">to</div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="block rounded-lg border border-slate-200 pl-10 pr-3 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="relative">
                <select
                  value={filters.companyId}
                  onChange={(e) => setFilters({ ...filters, companyId: e.target.value })}
                  className="block w-64 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500 bg-slate-50/50 cursor-pointer"
                >
                  <option value="">All Companies</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {activeTab === 'firearms' && (
              <>
                <div className="relative">
                  <select
                    value={filters.firearmType}
                    onChange={(e) => setFilters({ ...filters, firearmType: e.target.value })}
                    className="block w-40 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500 bg-slate-50/50 cursor-pointer"
                  >
                    <option value="">All Types</option>
                    <option value=".38 Revolver">.38 Revolver</option>
                    <option value="9mm Pistol">9mm Pistol</option>
                    <option value=".45 Caliber Pistol">.45 Caliber Pistol</option>
                    <option value="Shotgun 12 Gauge">Shotgun 12 Gauge</option>
                  </select>
                </div>
                <div className="relative">
                  <select
                    value={filters.firearmStatus}
                    onChange={(e) => setFilters({ ...filters, firearmStatus: e.target.value })}
                    className="block w-40 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500 bg-slate-50/50 cursor-pointer"
                  >
                    <option value="">All Statuses</option>
                    <option value="available">Available</option>
                    <option value="issued">Issued</option>
                    <option value="damaged">Damaged</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="expiring">Expiring</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </>
            )}

            {activeTab === 'companies' && (
              <div className="relative">
                <select
                  value={filters.companyStatus}
                  onChange={(e) => setFilters({ ...filters, companyStatus: e.target.value })}
                  className="block w-40 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500 bg-slate-50/50 cursor-pointer"
                >
                  <option value="">All Statuses</option>
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>
            )}

            <button
              onClick={fetchReport}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 transition-all active:scale-95 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              Apply
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="relative min-h-[400px]">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm font-medium text-slate-600">Updating report data...</p>
            </div>
          )}

          <div className="overflow-x-auto">
            {activeTab === 'guards' && (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Guard ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date Hired</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date Assigned</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-code text-slate-600">{row.guard_id || '—'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{row.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          row.status?.toLowerCase() === 'active' || row.status?.toLowerCase() === 'assigned'
                            ? 'bg-green-50 text-green-700 ring-green-600/20'
                            : row.status?.toLowerCase() === 'on leave'
                              ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                              : 'bg-slate-50 text-slate-600 ring-slate-500/10'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.company}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {row.date_hired ? new Date(row.date_hired).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {row.date_assigned !== 'N/A' ? new Date(row.date_assigned).toLocaleDateString() : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'attendance' && (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Guard ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Guard Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Time In</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Time Out</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Hours</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                        {row.date ? new Date(row.date).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-code text-slate-600">{row.guard_id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{row.guard_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.company}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {row.time_in ? new Date(row.time_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {row.time_out ? new Date(row.time_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{row.hours_worked}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {row.status?.split(', ').map((s: string, j: number) => (
                            <span key={j} className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium ring-1 ring-inset ${
                              s.toLowerCase() === 'present' || s.toLowerCase() === 'on duty'
                                ? 'bg-green-50 text-green-700 ring-green-600/20'
                                : s.toLowerCase() === 'late'
                                  ? 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                                  : 'bg-red-50 text-red-700 ring-red-600/10'
                            }`}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'firearms' && (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Serial Number</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Exp. of Reg.</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Assigned To</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">{row.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-code text-slate-600">{row.serial_num}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {row.exp_of_registration ? new Date(row.exp_of_registration).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {row.status?.split(', ').map((s: string, j: number) => (
                            <span key={j} className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium ring-1 ring-inset ${
                              s.toLowerCase() === 'available'
                                ? 'bg-green-50 text-green-700 ring-green-600/20'
                                : s.toLowerCase() === 'issued'
                                  ? 'bg-blue-50 text-blue-700 ring-blue-700/10'
                                  : 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
                            }`}>
                              {s}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{row.assigned_to}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'companies' && (
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Company Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Address</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Personnel</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {data.map((row: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-600">#{row.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">{row.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{row.address}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          row.is_active 
                            ? 'bg-green-50 text-green-700 ring-green-600/20' 
                            : 'bg-red-50 text-red-700 ring-red-600/10'
                        }`}>
                          {row.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500 max-w-xs truncate">
                        {row.total_guards || 0} guards
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {data.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="rounded-full bg-slate-50 p-6 mb-4">
                  <FileText className="h-12 w-12 text-slate-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-900">No data available</h3>
                <p className="text-slate-500 mt-1 text-center max-w-xs">
                  We couldn't find any records matching your current selection. Adjust your filters and try again.
                </p>
                <button
                  onClick={fetchReport}
                  className="mt-6 text-sm font-semibold text-blue-600 hover:text-blue-500"
                >
                  Refresh data
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
