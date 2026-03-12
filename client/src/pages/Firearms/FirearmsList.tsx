/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Crosshair,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Edit,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ArrowRightLeft,
  Trash2,
  XCircle,
  Clock10,
  ShieldMinus
} from 'lucide-react';
import { firearmService } from '../../services/firearmService';

export function FirearmsList() {
  const [firearms, setFirearms] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [issuedCount, setIssuedCount] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);
  const [maintenanceCount, setMaintenanceCount] = useState(0);
  const [expiringCount, setIsExpiringCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);
  const [damagedCount, setDamagedCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const itemsPerPage = 10;

  const stats = [
    { name: 'Total Firearms', value: totalCount, icon: Crosshair, key: 'total' },
    { name: 'Issued', value: issuedCount, icon: ShieldAlert, key: 'issued' },
    { name: 'Available', value: availableCount, icon: CheckCircle2, key: 'available' },
    { name: 'Maintenance', value: maintenanceCount, icon: AlertTriangle, key: 'maintenance' },
    { name: 'Expiring', value: expiringCount, icon: Clock10, key: 'expiring '},
    { name: 'Expired', value: expiredCount, icon: XCircle, key: 'expired' },
    { name: 'Damaged', value: damagedCount, icon: ShieldMinus, key: 'damaged' },
  ];

  const fetchStats = async () => {
    try {
      const res = await firearmService.getStats();
      if (res.data) {
        setTotalCount(res.data.total || 0);
        setIssuedCount(res.data.issued || 0);
        setAvailableCount(res.data.available || 0);
        setMaintenanceCount(res.data.maintenance || 0);
        setIsExpiringCount(res.data.expiring || 0);
        setExpiredCount(res.data.expired || 0);
        setDamagedCount(res.data.damaged || 0);
      }
    } catch (error) {
      console.error('Failed to fetch firearm stats:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this firearm? This action cannot be undone.')) {
      setIsDeleting(id);
      try {
        const res = await firearmService.delete(id) as any;
        if (res.status === 200 || res.success) {
          fetchFirearms();
          fetchStats();
        }
      } catch (error) {
        console.error('Failed to delete firearm:', error);
        alert('Failed to delete firearm. It may have issuance records attached.');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  // Fetch firearms whenever page, search, or status changes
  const fetchFirearms = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await firearmService.getAll(currentPage, itemsPerPage, searchQuery, statusFilter);
      if (res.data) {
        console.log(res.data);
        setFirearms(res.data.data || []);
        setTotalPages(res.data.meta?.last_page || 1);
      }
    } catch (error) {
      console.error('Failed to fetch firearms:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchQuery, statusFilter]);

  // Initial fetch and fetch on dependencies change
  useEffect(() => {
    fetchFirearms();
  }, [fetchFirearms]);

  useEffect(() => {
    fetchStats();
  }, []);

  const getAssignedTo = (fa: any) => {
    if (!fa.is_available && fa.issuances && fa.issuances.length > 0) {
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-7">
        {stats.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
              </div>
              <div className="rounded-md bg-blue-50 p-2 border border-slate-100">
                <stat.icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 flex-1 flex flex-col">
        <div className="border-b border-slate-200 p-4">
          <div className="flex flex-col sm:flex-row flex-1 gap-4 sm:items-center">
            <div className="relative w-full sm:max-w-sm sm:flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Search by serial or type..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
              <select
                className="block w-full sm:w-auto rounded-md border-0 py-1.5 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Statuses</option>
                <option value="available">Available</option>
                <option value="issued">Issued</option>
                <option value="maintenance">Maintenance</option>
                <option value="expiring">Expiring</option>
                <option value="expired">Expired</option>
                <option value="damaged">Damaged</option>
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
                  className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 hidden lg:table-cell"
                >
                  Note
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
              {!isLoading && firearms.length > 0 ? (
                firearms.map((fa) => {
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
                        <div className="flex flex-wrap gap-1">
                          {fa.is_expired && (
                            <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                              Expired
                            </span>
                          )}
                          {fa.is_expiring && (
                            <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10">
                              Expiring
                            </span>
                          )}
                          {fa.is_damaged && (
                            <span className="inline-flex items-center rounded-md bg-orange-50 px-2 py-1 text-xs font-medium text-orange-700 ring-1 ring-inset ring-orange-600/10">
                              Damaged
                            </span>
                          )}
                          {fa.is_maintenance && (
                            <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
                              Maintenance
                            </span>
                          )}
                          {fa.is_available ? (
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              Available
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                              Issued
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 hidden lg:table-cell">
                        {getAssignedTo(fa)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{fa.note || '-'}</td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-3">
                          {fa.is_available && (
                            <Link
                              to={`/issuance/issue?firearm_id=${fa.id}`}
                              className="text-[#135dff] hover:text-[#135dff]/80 transition-colors flex items-center gap-1"
                              title="Assign Firearm"
                            >
                              <ArrowRightLeft className="h-4 w-4" />
                              <span className="hidden lg:inline text-xs mt-0.5">Assign</span>
                            </Link>
                          )}
                          <Link
                            to={`/firearms/${fa.id}/edit`}
                            className="text-slate-400 hover:text-[#135dff] transition-colors flex items-center"
                            title="Edit Firearm Details"
                          >
                            <Edit className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => handleDelete(fa.id)}
                            disabled={isDeleting === fa.id}
                            className="text-slate-400 hover:text-red-500 transition-colors flex items-center cursor-pointer disabled:opacity-50"
                            title="Delete Firearm"
                          >
                            {isDeleting === fa.id ? (
                              <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                              <Trash2 className="h-5 w-5" />
                            )}
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
                className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || isLoading}
                className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
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
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      disabled={isLoading}
                      className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold cursor-pointer ${
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
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
