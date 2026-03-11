/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { 
  Archive, 
  RotateCcw, 
  Trash2, 
  Search, 
  Calendar, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Users,
  Crosshair,
  Building,
  CalendarCheck,
  FileText,
  AlertCircle,
  Database
} from 'lucide-react';
import { archiveService } from '../../services/archiveService';

const ENTITIES = [
  { key: 'users', label: 'Users', icon: Users },
  { key: 'firearms', label: 'Firearms', icon: Crosshair },
  { key: 'designations', label: 'Designations', icon: CalendarCheck },
  { key: 'attendances', label: 'Attendances', icon: FileText },
  { key: 'firearm_issuances', label: 'Issuances', icon: Database },
  { key: 'companies', label: 'Companies', icon: Building },
];

export function ArchivePage() {
  const [entity, setEntity] = useState('users');
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState<any>({});
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchArchived();
  }, [entity, page]);

  const fetchArchived = async () => {
    try {
      setLoading(true);
      const res = await archiveService.getArchived(entity, page);
      setRecords(res.data?.data || []);
      setMeta(res.data?.meta || {});
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (id: number) => {
    if (confirm('Are you sure you want to restore this record? It will be moved back to the active list.')) {
      try {
        await archiveService.restore(entity, id);
        fetchArchived();
      } catch (err) {
        console.error(err);
        alert('Failed to restore');
      }
    }
  };

  const handlePermanentDelete = async (id: number) => {
    if (confirm('CRITICAL: Permanently delete this record? This action is IRREVERSIBLE and will remove the data from the database.')) {
      try {
        await archiveService.permanentDelete(entity, id);
        fetchArchived();
      } catch (err) {
        console.error(err);
        alert('Failed to delete');
      }
    }
  };

  const getDisplayFields = (record: any) => {
    switch (entity) {
      case 'users':
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">{record.first_name || ''} {record.last_name || ''}</span>
            <span className="text-xs text-slate-500">{record.guard_id || record.email || 'N/A'}</span>
          </div>
        );
      case 'firearms':
        return (
          <div className="flex flex-col">
            <span className="font-semibold text-slate-900">{record.type || ''}</span>
            <span className="text-xs font-code text-slate-500">SN: {record.serial_num || 'N/A'}</span>
          </div>
        );
      case 'companies':
        return <span className="font-medium text-slate-900">{record.address || 'N/A'}</span>;
      default:
        return <span className="text-slate-600 italic">Record ID: {record.id}</span>;
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-orange-50 p-2.5 border border-orange-100 shadow-sm">
            <Archive className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Archive Vault</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage soft-deleted records. Restore data or permanently purge it from the system.
            </p>
          </div>
        </div>
      </div>

      {/* Tabs & Table Container */}
      <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 overflow-hidden flex-1 flex flex-col">
        {/* Tabs */}
        <div className="border-b border-slate-200 bg-slate-50/50">
          <nav className="flex -mb-px overflow-x-auto scrollbar-hide" aria-label="Tabs">
            {ENTITIES.map((e) => {
              const Icon = e.icon;
              const isActive = entity === e.key;
              return (
                <button
                  key={e.key}
                  onClick={() => { setEntity(e.key); setPage(1); }}
                  className={`
                    group relative flex items-center gap-2 py-4 px-6 text-sm font-medium transition-all whitespace-nowrap
                    ${isActive 
                      ? 'text-orange-600 border-b-2 border-orange-600 bg-white shadow-sm' 
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100/50 border-b-2 border-transparent'
                    }
                  `}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-500'}`} />
                  {e.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Info Banner */}
        <div className="px-6 py-3 bg-amber-50/50 border-b border-amber-100 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-amber-500" />
          <p className="text-xs text-amber-700 font-medium">Records in the archive are hidden from active views but can be recovered at any time.</p>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto relative flex-1">
          {loading && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
              <p className="text-sm font-medium text-slate-600">Syncing with archive...</p>
            </div>
          )}

          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">System ID</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Resource Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Deletion Timestamp</th>
                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {records.map((record: any) => (
                <tr key={record.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs font-code text-slate-400">#{record.id}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getDisplayFields(record)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Calendar className="h-3.5 w-3.5 text-slate-300" />
                      {record.deleted_at ? new Date(record.deleted_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleRestore(record.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-50 text-green-700 text-xs font-semibold border border-green-200 hover:bg-green-100 transition-all active:scale-95"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(record.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-red-600 text-xs font-semibold border border-red-100 hover:bg-red-50 hover:border-red-200 transition-all active:scale-95"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Purge
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {records.length === 0 && !loading && (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="rounded-full bg-slate-50 p-6 mb-4">
                        <Archive className="h-12 w-12 text-slate-200" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-900">Archive is empty</h3>
                      <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                        No deleted {entity} records were found. Records that are deleted normally will appear here for recovery.
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
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-4 sm:px-6">
            <div className="flex flex-1 items-center justify-between">
              <p className="text-sm text-slate-700">
                Page <span className="font-medium">{page}</span> of <span className="font-medium">{meta.totalPages}</span>
              </p>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="relative inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                </button>
                <button
                  disabled={page >= meta.totalPages}
                  onClick={() => setPage(page + 1)}
                  className="relative inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
