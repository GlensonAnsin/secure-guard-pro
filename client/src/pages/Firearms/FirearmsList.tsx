/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Crosshair,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Edit,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from 'lucide-react';
import { firearmService } from '../../services/firearmService';

const stats = [
  { name: 'Total Firearms', value: '48', icon: Crosshair, key: 'total' },
  { name: 'Issued', value: '32', icon: ShieldAlert, key: 'issued' },
  { name: 'Available', value: '12', icon: CheckCircle2, key: 'available' },
  { name: 'Maintenance', value: '4', icon: AlertTriangle, key: 'maintenance' },
];

export function FirearmsList() {
  const [firearms, setFirearms] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchFirearms();
  }, [currentPage]);

  const fetchFirearms = async () => {
    setIsLoading(true);
    try {
      const res = (await firearmService.getAll(currentPage, itemsPerPage)) as any;
      if (res.success && res.data) {
        setFirearms(res.data.data || []);
        setTotalPages(res.data.meta?.last_page || 1);
        setTotalCount(res.data.meta?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch firearms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter Data (Client side filter for current page items)
  const filteredFirearms = firearms.filter((fa) => {
    const term = searchQuery.toLowerCase();
    const matchesSearch =
      (fa.serial_num && fa.serial_num.toLowerCase().includes(term)) ||
      (fa.type && fa.type.toLowerCase().includes(term));

    // The DB stores mixed cased statuses but might use proper case
    const matchesStatus = statusFilter === 'All' || fa.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'available':
        return 'bg-green-100 text-green-700 ring-green-600/20';
      case 'issued':
        return 'bg-blue-100 text-blue-700 ring-blue-600/20';
      case 'maintenance':
        return 'bg-amber-100 text-amber-700 ring-amber-600/20';
      default:
        return 'bg-slate-100 text-slate-700 ring-slate-500/10';
    }
  };

  // Simulated assigning logic - if firearm is Issued, find its issuance (assuming inclusion works or API provides it)
  // Our typical REST endpoints don't deep nest without reason, but we check if `issuances` exists
  const getAssignedTo = (fa: any) => {
    if (fa.status?.toLowerCase() === 'issued' && fa.issuances && fa.issuances.length > 0) {
      // Find the active issuance or the latest one
      const activeIssuance = fa.issuances.find((i: any) => !i.turn_in_date) || fa.issuances[0];
      if (activeIssuance?.user) {
        return `${activeIssuance.user.first_name} ${activeIssuance.user.last_name}`;
      }
      return `User ID: ${activeIssuance.user_id}`;
    }
    return '-';
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Firearms Inventory</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage all registered firearms, registration expiry, and availability.
          </p>
        </div>
        <Link
          to="/firearms/add"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Firearm
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                  {stat.key === 'total' && totalCount > 0 ? totalCount : stat.value}
                </p>
              </div>
              <div className="rounded-md bg-slate-50 p-2 border border-slate-100">
                <stat.icon className="h-6 w-6 text-slate-700" aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 flex-1 flex flex-col">
        <div className="border-b border-slate-200 p-4 sm:flex sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-4 items-center">
            <div className="relative max-w-sm flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Search by serial or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
              <select
                className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Issued">Issued</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto relative flex-1">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">
                  Type / Model
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Serial Number
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Registration Expiration
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 hidden lg:table-cell"
                >
                  Assigned To
                </th>
                <th
                  scope="col"
                  className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-sm font-semibold text-slate-900"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {!isLoading && filteredFirearms.length > 0 ? (
                filteredFirearms.map((fa) => {
                  const expiryDate = new Date(fa.exp_of_registration);
                  const isExpiringSoon = (expiryDate.getTime() - new Date().getTime()) / (1000 * 3600 * 24) < 30;

                  return (
                    <tr key={fa.id} className="hover:bg-slate-50 transition-colors">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                        {fa.type}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm font-code text-slate-700">{fa.serial_num}</td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`flex items-center gap-1.5 ${isExpiringSoon ? 'text-red-600 font-medium' : 'text-slate-500'}`}
                        >
                          {fa.exp_of_registration ? new Date(fa.exp_of_registration).toLocaleDateString() : '-'}
                          {isExpiringSoon && <AlertTriangle className="h-4 w-4" />}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusStyle(fa.status)}`}
                        >
                          {fa.status || 'Available'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 hidden lg:table-cell">
                        {getAssignedTo(fa)}
                      </td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-2">
                          <button
                            className="text-slate-400 hover:text-slate-900 transition-colors"
                            title="Edit Firearm Details"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button className="text-slate-400 hover:text-slate-900 transition-colors lg:hidden">
                            <MoreVertical className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : !isLoading ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                    No firearms found matching your criteria.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 mt-auto">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isLoading}
                className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || isLoading}
                className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalCount)}</span> of{' '}
                  <span className="font-medium">{totalCount}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1 || isLoading}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      disabled={isLoading}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                        currentPage === i + 1
                          ? 'z-10 bg-blue-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600'
                          : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || isLoading}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
