import React, { useState, useEffect } from 'react';
import { ShieldCheck, Search, Filter, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { AuditLogItem } from '../../types';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [moduleFilter, setModuleFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAuditLogs(moduleFilter);
      if (res.success && res.logs) {
        setLogs(res.logs);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [moduleFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Module 15: Compliance &amp; Traceability
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">System &amp; Admin Audit Trail</h1>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="">All Audit Modules</option>
            <option value="AUTH">AUTH</option>
            <option value="REGISTRATION">REGISTRATION</option>
            <option value="TEAMS">TEAMS</option>
            <option value="QUESTIONS">QUESTIONS</option>
            <option value="COMPETITION">COMPETITION</option>
            <option value="SCORING">SCORING</option>
            <option value="SETTINGS">SETTINGS</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/80 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date/Time</th>
                <th className="py-3 px-4">Operator</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Details / Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                    No audit logs recorded for this filter.
                  </td>
                </tr>
              ) : (
                logs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleTimeString()} · {new Date(log.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-amber-400 font-bold font-sans">
                      {log.admin}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-sans font-bold">
                      {log.action}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300">
                        {log.module}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-sans">
                      {log.reference || '—'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                      {log.newValue ? JSON.stringify(log.newValue) : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
