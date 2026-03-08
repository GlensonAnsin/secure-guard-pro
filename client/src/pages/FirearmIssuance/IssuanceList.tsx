/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, ArrowRightLeft, Eye, ChevronLeft, ChevronRight, Loader2, Filter, Trash2 } from 'lucide-react';
import { issuanceService } from '../../services/issuanceService';

export function IssuanceList() {
  const [issuances, setIssuances] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [returnStatus, setReturnStatus] = useState({
    isOpen: false,
    issueId: null as number | null,
    isProcessing: false,
  });
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const itemsPerPage = 10;

  const fetchIssuances = async () => {
    setIsLoading(true);
    try {
      const res = await issuanceService.getAll(currentPage, itemsPerPage, searchQuery, statusFilter);
      if (res.data) {
        setIssuances(res.data.data || []);
        setTotalPages(res.data.meta?.last_page || 1);
        setTotalCount(res.data.meta?.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch firearm issuances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssuances();
  }, [currentPage, searchQuery, statusFilter]);

  // Filter Data

  const handleReturnFirearm = async () => {
    if (!returnStatus.issueId) return;
    setReturnStatus((prev) => ({ ...prev, isProcessing: true }));
    try {
      const payload = {
        turn_in_date: new Date().toISOString().split('T')[0],
      };

      const res = (await issuanceService.update(returnStatus.issueId, payload)) as any;
      if (res.success || res.status === 200) {
        setReturnStatus({ isOpen: false, issueId: null, isProcessing: false });
        fetchIssuances(); // Refresh the list
      } else {
        // Handle potential error message from server
        console.error('Failed to return firearm:', res.message);
        setReturnStatus((prev) => ({ ...prev, isProcessing: false }));
        alert(res.message || 'Failed to return firearm.');
      }
    } catch (err) {
      console.error('Failed to return firearm:', err);
      setReturnStatus((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this issuance record? This action cannot be undone.')) {
      setIsDeleting(id);
      try {
        const res = await issuanceService.delete(id) as any;
        if (res.status === 200 || res.success) {
          fetchIssuances();
        }
      } catch (error) {
        console.error('Failed to delete issuance record:', error);
        alert('Failed to delete record.');
      } finally {
        setIsDeleting(null);
      }
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Firearm Issuance Log</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track and monitor which guards hold what firearms, and log their return.
          </p>
        </div>
        <Link
          to="/issuance/issue"
          className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
        >
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Issue Firearm
        </Link>
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
                placeholder="Search by guard name, ID, or serial..."
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
                <option value="all">All</option>
                <option value="active">Active Issuances</option>
                <option value="returned">Returned</option>
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
                  Guard Info
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Firearm Details
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 hidden md:table-cell"
                >
                  Date Issued
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900 hidden md:table-cell"
                >
                  Date Returned
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
                  Status
                </th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">
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
              {!isLoading && issuances.length > 0 ? (
                issuances.map((issue) => {
                  const isActive = !issue.turn_in_date;
                  return (
                    <tr key={issue.id} className="hover:bg-slate-50 transition-colors">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="font-medium text-slate-900">
                          {issue.user ? `${issue.user.first_name} ${issue.user.last_name}` : 'Unknown Guard'}
                        </div>
                        <div className="text-slate-500">{issue.user?.guard_id || `ID: ${issue.user_id}`}</div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <div className="text-slate-900">{issue.firearm?.type || 'Unknown Type'}</div>
                        <div className="font-code text-slate-500">
                          {issue.firearm?.serial_num || `ID: ${issue.firearm_id}`}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 hidden md:table-cell">
                        {issue.date_of_issuance ? new Date(issue.date_of_issuance).toLocaleDateString() : '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500 hidden md:table-cell">
                        {issue.turn_in_date ? new Date(issue.turn_in_date).toLocaleDateString() : '-'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                            isActive
                              ? 'bg-blue-50 text-blue-700 ring-blue-600/20'
                              : 'bg-green-50 text-green-700 ring-green-600/20'
                          }`}
                        >
                          {isActive ? 'Active' : 'Returned'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">{issue.note}</td>
                      <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex justify-end gap-3">
                          {isActive && (
                            <button
                              onClick={() => setReturnStatus({ isOpen: true, issueId: issue.id, isProcessing: false })}
                              className="text-[#135dff] hover:text-[#135dff]/80 transition-colors flex items-center gap-1 cursor-pointer"
                              title="Process Return"
                            >
                              <ArrowRightLeft className="h-4 w-4" />
                              <span className="hidden lg:inline text-xs">Return</span>
                            </button>
                          )}
                          <button
                            onClick={() =>
                              alert(
                                `View Issuance Details:\nGuard: ${issue.user?.first_name} ${issue.user?.last_name}\nFirearm: ${issue.firearm?.type} (${issue.firearm?.serial_num})\nDate Issued: ${issue.date_of_issuance}\nDate Returned: ${issue.turn_in_date || 'N/A'}\nNote: ${issue.note || 'None'}`,
                              )
                            }
                            className="text-slate-400 hover:text-[#135dff] transition-colors flex items-center gap-1 cursor-pointer"
                            title="View Full Log"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(issue.id)}
                            disabled={isDeleting === issue.id}
                            className="text-slate-400 hover:text-red-500 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Delete Record"
                          >
                            {isDeleting === issue.id ? (
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
                    No issuance records found.
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
      {/* Return Confirmation Modal */}
      {returnStatus.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Process Firearm Return</h3>
            <p className="text-sm text-slate-500 mb-6">
              Are you sure you want to mark this firearm as returned? The firearm will be marked as "available" again in
              the inventory.
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReturnStatus({ isOpen: false, issueId: null, isProcessing: false })}
                disabled={returnStatus.isProcessing}
                className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReturnFirearm}
                disabled={returnStatus.isProcessing}
                className="px-4 py-2 text-sm font-semibold text-white bg-[#135dff] hover:bg-[#135dff]/80 rounded-md shadow-sm transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {returnStatus.isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirm Return
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
