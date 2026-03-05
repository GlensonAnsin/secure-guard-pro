/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  ShieldCheck,
  Clock,
  UserX,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  ChevronLeft,
  ChevronRight,
  Loader2,
  ShieldBan,
} from 'lucide-react';
import { guardService } from '../../services/guardService';

export function GuardsList() {
  const [guards, setGuards] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [unassignedCount, setUnassignedCount] = useState(0);
  const [onLeaveCount, setOnLeaveCount] = useState(0);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  const stats = [
    { name: 'Total Guards', value: totalCount, icon: Users, key: 'total' },
    { name: 'Active', value: activeCount, icon: ShieldCheck, key: 'active' },
    { name: 'Unassigned', value: unassignedCount, icon: Clock, key: 'unassigned' },
    { name: 'On Leave', value: onLeaveCount, icon: UserX, key: 'on_leave' },
    { name: 'Inactive', value: inactiveCount, icon: ShieldBan, key: 'inactive' },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await guardService.getGuardStats();
        if (res.data) {
          setTotalCount(res.data.meta.total);
          setActiveCount(res.data.meta.active);
          setUnassignedCount(res.data.meta.unassigned);
          setOnLeaveCount(res.data.meta.on_leave);
          setInactiveCount(res.data.meta.inactive);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    const fetchGuards = async () => {
      setIsLoading(true);
      try {
        const res = await guardService.getAll(currentPage, itemsPerPage, searchQuery, statusFilter);
        if (res.data) {
          setGuards(res.data.data || []);
          setTotalPages(res.data.meta.last_page);
        }
      } catch (error) {
        console.error('Failed to fetch guards:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGuards();
  }, [currentPage, searchQuery, statusFilter]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-700 ring-green-600/20';
      case 'unassigned':
        return 'bg-blue-100 text-blue-700 ring-blue-600/20';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-700 ring-yellow-600/20';
      case 'inactive':
        return 'bg-red-100 text-red-700 ring-red-600/10';
      default:
        return 'bg-slate-100 text-slate-700 ring-slate-500/10';
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Guards Management</h1>
          <p className="mt-1 text-sm text-slate-500">Manage all security personnel, their statuses, and assignments.</p>
        </div>
        <Link
          to="/guards/add"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Guard
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map((stat) => (
          <div key={stat.name} className="overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="mt-2 text-3xl font-bold tracking-tight text-slate-900">{stat.value}</p>
              </div>
              <div className="rounded-md bg-slate-50 p-2 border border-slate-100">
                <stat.icon className="h-6 w-6 text-blue-600" aria-hidden="true" />
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
                placeholder="Search guards by name or ID..."
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
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="unassigned">Unassigned</option>
                <option value="on_leave">On Leave</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          )}
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">
                  Guard ID
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Name
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Location
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Contact
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 hidden lg:table-cell"
                >
                  Date Assigned
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Status
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
              {!isLoading && guards.length > 0 ? (
                guards.map((guard) => (
                  <tr key={guard.id} className="hover:bg-slate-50 transition-colors">
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-slate-900 sm:pl-6">
                      {guard.guard_id || `User-${guard.id}`}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-slate-900">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-medium text-xs border border-slate-200">
                          {guard.first_name?.[0]}
                          {guard.last_name?.[0]}
                        </div>
                        <div className="ml-3">
                          {guard.first_name} {guard.last_name}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      {guard.city_or_municipality ? `${guard.barangay}, ${guard.city_or_municipality}` : 'Unassigned'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      <div className="flex flex-col">
                        <span>{guard.cel_num || '-'}</span>
                        <span className="text-xs text-slate-400">{guard.email || '-'}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 hidden lg:table-cell">
                      {guard.date_hired || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor(guard.status)}`}
                      >
                        {guard.status === 'active'
                          ? 'Active'
                          : guard.status === 'unassigned'
                            ? 'Unassigned'
                            : guard.status === 'on_leave'
                              ? 'On Leave'
                              : guard.status === 'inactive'
                                ? 'Inactive'
                                : 'Unknown'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/guards/${guard.id}`}
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <button className="text-slate-400 hover:text-slate-900 transition-colors" title="Edit Guard">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button className="text-slate-400 hover:text-slate-900 transition-colors lg:hidden">
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : !isLoading ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-slate-500">
                    No guards found matching your criteria.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 mt-auto">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1 || isLoading}
                className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || isLoading}
                className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Previous</span>
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
                          : 'text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages || isLoading}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Next</span>
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
