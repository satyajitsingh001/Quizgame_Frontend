import React from 'react';
import { Download, FileSpreadsheet, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

export const ReportsExport: React.FC = () => {
  const reports = [
    {
      id: 'registration',
      title: 'Team Registration Report',
      description: 'Team IDs, team names, member rosters, captains, contact details and registration timestamps.'
    },
    {
      id: 'participants',
      title: 'Participant Roster Report',
      description: 'Individual participant names, mapped team assignments, and designated captain roles.'
    },
    {
      id: 'round1',
      title: 'Round 1 (Fastest Finger) Report',
      description: 'Team sequence orders, millisecond submission timestamps, fastest bonuses, and scores.'
    },
    {
      id: 'round2',
      title: 'Round 2 (Guess the Defect) Report',
      description: 'Image defect matches, correct count, partial credits, penalties and outcomes.'
    },
    {
      id: 'round3',
      title: 'Round 3 (Quality MSQ) Report',
      description: 'Captain selected option combinations, exact matches, wrong attempts, timeouts, and scores.'
    },
    {
      id: 'roundwise',
      title: 'Round-Wise Score Summary',
      description: 'Complete breakdown of points earned by each team across Round 1, Round 2, and Round 3.'
    },
    {
      id: 'final',
      title: 'Final Competition Leaderboard',
      description: 'Official final rankings, tie-break verified ranks, cumulative totals, and podium winners.'
    },
    {
      id: 'adjustments',
      title: 'Score Adjustment Audit Report',
      description: 'Complete history of all manual score corrections, reasons, prior values, and admin IDs.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Module 13: Results &amp; Export Engine
            </span>
            <span className="text-xs text-slate-400">8 Official Competition Reports</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Results, Analytics &amp; Reports Export</h1>
        </div>

        {/* Master Full Export */}
        <a
          href={api.getReportDownloadUrl('final', 'xlsx')}
          download
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-transform active:scale-95"
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Download Master Excel Workbook</span>
        </a>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(rep => (
          <div
            key={rep.id}
            className="glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 flex flex-col justify-between gap-4 hover:border-slate-700 transition-colors"
          >
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-white">{rep.title}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{rep.description}</p>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
              <a
                href={api.getReportDownloadUrl(rep.id, 'xlsx')}
                download
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-emerald-950/40 text-emerald-300 hover:text-emerald-200 border border-slate-700 hover:border-emerald-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Excel (.xlsx)</span>
              </a>
              <a
                href={api.getReportDownloadUrl(rep.id, 'csv')}
                download
                className="flex-1 py-2 px-3 rounded-xl bg-slate-900 hover:bg-indigo-950/40 text-indigo-300 hover:text-indigo-200 border border-slate-700 hover:border-indigo-500/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>CSV</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
