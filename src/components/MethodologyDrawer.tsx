'use client';

import React from 'react';
import { LensProfile } from '../lib/data/lensProfiles';
import { Environment } from '../lib/data/environments';
import { OPTICAL_MODELS } from '../lib/data/opticalModels';
import { EVIDENCE_RECORDS } from '../lib/data/evidence';
import { X, ExternalLink, BookOpen, CheckCircle2, Layers, Activity, Award } from 'lucide-react';

interface MethodologyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  lens: LensProfile;
  env: Environment;
}

export const MethodologyDrawer: React.FC<MethodologyDrawerProps> = ({
  isOpen,
  onClose,
  lens,
}) => {
  if (!isOpen) return null;

  const model = lens.optical ? OPTICAL_MODELS[lens.optical] : null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-2xl bg-white border-l border-slate-200 h-full overflow-y-auto shadow-2xl p-6 text-slate-800">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-600" />
              Clinical Evidence &amp; Optical Audit
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Q1 peer-reviewed literature, ISO 11979 bench models, and Fourier wave optics
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Lens Overview */}
        <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">{lens.name}</h3>
            <span className="text-xs px-2.5 py-0.5 rounded-md font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
              {lens.statusText}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Platform Model: {lens.model}</p>
          <p className="text-xs text-slate-700 mt-2 leading-relaxed">{lens.summary}</p>
        </div>

        {/* Effect-by-Effect Table */}
        <div className="mt-6">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
            <Activity className="w-4 h-4 text-sky-600" />
            Optical Effect Breakdown &amp; Traceability
          </h4>
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-2xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-2.5 font-bold">Effect</th>
                  <th className="p-2.5 font-bold">Physical Basis</th>
                  <th className="p-2.5 font-bold">Literature Evidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {Object.entries(lens.effects).map(([key, eff]) => (
                  <tr key={key} className="hover:bg-slate-50/50">
                    <td className="p-2.5 font-semibold capitalize text-slate-900">{key}</td>
                    <td className="p-2.5 text-[11px] leading-relaxed">{eff.basis}</td>
                    <td className="p-2.5 text-[11px] text-slate-600 font-mono">
                      {eff.evidence.length > 0 ? eff.evidence.join(', ') : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Optical Model & Foci Breakdown */}
        {model && (
          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
              <Layers className="w-4 h-4 text-sky-600" />
              Optical Simulation Parameters
            </h4>
            <p className="text-xs text-slate-800 mb-2 font-semibold">{model.label}</p>

            {model.foci.length > 1 && (
              <div className="mb-3 p-2.5 bg-white border border-slate-200 rounded-lg text-xs">
                <span className="font-bold text-slate-700">Discrete Light Allocation:</span>
                <ul className="mt-1 space-y-1">
                  {model.foci.map((f, i) => (
                    <li key={i} className="text-slate-600 flex items-center justify-between">
                      <span>
                        Focus {i + 1}: {f.addD >= 0 ? `+${f.addD.toFixed(2)}` : f.addD.toFixed(2)} D
                      </span>
                      <span className="font-mono font-bold text-sky-700">{(f.weight * 100).toFixed(1)}% light energy</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
              {model.assumptions.map((asm, idx) => (
                <li key={idx} className="leading-relaxed">
                  {asm}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Citations & Evidence Records */}
        <div className="mt-6">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Q1 Peer-Reviewed &amp; FDA Registry Records
          </h4>
          <div className="space-y-3">
            {lens.references.map((refId) => {
              const rec = EVIDENCE_RECORDS[refId];
              if (!rec) return null;
              return (
                <div
                  key={refId}
                  className="p-3.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <b className="text-slate-900 text-xs leading-snug">{rec.title}</b>
                    <a
                      href={rec.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-600 hover:text-sky-800 flex items-center gap-1 shrink-0 font-medium"
                    >
                      Link <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-slate-600">
                      {rec.authors} • <i>{rec.venue}</i> ({rec.year})
                    </p>
                    {rec.journalRank && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                        <Award className="w-3 h-3 text-amber-600" />
                        {rec.journalRank}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-slate-700">
                    <b className="text-slate-900">Study Design:</b> {rec.design}
                  </div>
                  <div className="mt-1 text-slate-700">
                    <b className="text-slate-900">Extracted Bench / Clinical Data:</b>
                    <ul className="list-disc list-inside mt-0.5 space-y-0.5 text-slate-600">
                      {rec.results.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Close Button */}
        <div className="mt-6 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition"
          >
            Close Evidence Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
