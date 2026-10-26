'use client';

import React from 'react';
import { LensProfile } from '../lib/data/lensProfiles';
import { CheckCircle2, AlertTriangle, Sparkles, Glasses, Car, Monitor, Compass } from 'lucide-react';

interface AcuityScorecardProps {
  lens: LensProfile;
}

export const AcuityScorecard: React.FC<AcuityScorecardProps> = ({ lens }) => {
  const { ratings } = lens;

  const renderStars = (score: number, max = 5) => {
    const pct = Math.min(100, (score / max) * 100);
    return (
      <div className="flex items-center gap-1.5 w-28">
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              score >= 4.5
                ? 'bg-emerald-500'
                : score >= 3.0
                ? 'bg-sky-500'
                : score >= 2.0
                ? 'bg-amber-500'
                : 'bg-rose-500'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[10px] font-bold text-slate-700 font-mono shrink-0">
          {score.toFixed(1)}
        </span>
      </div>
    );
  };

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3.5 shadow-xs space-y-2.5">
      {/* Header with Spectacle Independence Badge */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Patient Acuity &amp; Lifestyle
          </h4>
        </div>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
          {ratings.spectacleIndependence}
        </span>
      </div>

      {/* Visual Range Ratings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            Distance (&gt;5m):
          </span>
          {renderStars(ratings.distance)}
        </div>

        <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
            <Monitor className="w-3.5 h-3.5 text-teal-600" />
            Intermediate (1m/60cm):
          </span>
          {renderStars(ratings.intermediate)}
        </div>

        <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
            <Glasses className="w-3.5 h-3.5 text-indigo-600" />
            Near Reading (40cm):
          </span>
          {renderStars(ratings.near)}
        </div>

        <div className="p-2 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-slate-700 font-semibold text-[11px]">
            <Car className="w-3.5 h-3.5 text-amber-600" />
            Night Dysphotopsia:
          </span>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
              ratings.nightDysphotopsia === 'Minimal' || ratings.nightDysphotopsia === 'Very Low'
                ? 'bg-emerald-100 text-emerald-800'
                : ratings.nightDysphotopsia === 'Mild Rings'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {ratings.nightDysphotopsia}
          </span>
        </div>
      </div>

      {/* Doctor-Patient Counseling Highlight */}
      <div className="p-2.5 rounded-xl bg-gradient-to-r from-sky-50/70 via-indigo-50/40 to-slate-50 border border-sky-100 text-xs">
        <b className="text-slate-900 block text-[11px] mb-0.5">Key Consultation Takeaway:</b>
        <p className="text-slate-600 text-[11px] leading-relaxed">{lens.patientHighlight}</p>
      </div>
    </div>
  );
};
