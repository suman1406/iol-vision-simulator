'use client';

import React from 'react';
import { LENS_PROFILES, LensProfile } from '../lib/data/lensProfiles';
import { ENVIRONMENTS, Environment } from '../lib/data/environments';
import { Sun, Moon, Sparkles, Check } from 'lucide-react';

interface ControlsBarProps {
  selectedLens: LensProfile;
  selectedEnv: Environment;
  onSelectLens: (lens: LensProfile) => void;
  onSelectEnv: (env: Environment) => void;
}

export const ControlsBar: React.FC<ControlsBarProps> = ({
  selectedLens,
  selectedEnv,
  onSelectLens,
  onSelectEnv,
}) => {
  const getThemeClasses = (color: string, isSelected: boolean) => {
    if (!isSelected) {
      return 'bg-white/90 hover:bg-slate-100/90 text-slate-700 border-slate-200/90 shadow-2xs hover:border-slate-300';
    }
    switch (color) {
      case 'teal':
        return 'bg-teal-600 text-white border-teal-600 shadow-md ring-2 ring-teal-500/20';
      case 'cyan':
        return 'bg-cyan-600 text-white border-cyan-600 shadow-md ring-2 ring-cyan-500/20';
      case 'emerald':
        return 'bg-emerald-600 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/20';
      case 'indigo':
        return 'bg-indigo-600 text-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20';
      case 'purple':
        return 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-500/20';
      case 'sky':
        return 'bg-sky-600 text-white border-sky-600 shadow-md ring-2 ring-sky-500/20';
      case 'amber':
        return 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-500/20';
      case 'rose':
        return 'bg-rose-600 text-white border-rose-600 shadow-md ring-2 ring-rose-500/20';
      default:
        return 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-500/20';
    }
  };

  return (
    <div className="bg-white/85 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3 shadow-xs space-y-2.5">
      {/* Top Row: Environment Selector Pills */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider">
          <Sun className="w-3.5 h-3.5 text-amber-500" />
          <span>Viewing Scene (Far, Int &amp; Near):</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {ENVIRONMENTS.map((env) => {
            const isSelected = env.id === selectedEnv.id;
            return (
              <button
                key={env.id}
                onClick={() => onSelectEnv(env)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? env.category === 'night'
                      ? 'bg-slate-900 text-white shadow-sm ring-2 ring-indigo-400/30'
                      : 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-400/30'
                    : 'bg-slate-100/90 hover:bg-slate-200/80 text-slate-600 border border-slate-200/60'
                }`}
              >
                {env.category === 'night' ? (
                  <Moon className="w-3 h-3 text-indigo-300" />
                ) : (
                  <Sun className="w-3 h-3 text-amber-200" />
                )}
                <span>
                  {env.id === 'day_photo_drive'
                    ? '☀️ Daytime Driver POV (Hosur Rd 10m, CarPlay 0.85m, Phone 0.40m)'
                    : env.id === 'night_photo_drive'
                    ? '🌃 Nighttime Driver POV (Street 15m, Cockpit 0.85m, Phone 0.40m)'
                    : env.id === 'day_mall'
                    ? '🏬 Daytime Mall Atrium'
                    : env.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Row: Doctor's Lens Portfolio Selection */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            Select Doctor's Lens Profile:
          </span>
          <span className="text-[11px] font-semibold text-slate-600 hidden sm:inline">
            Active: <b className="text-slate-900">{selectedLens.name}</b>
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-1.5">
          {LENS_PROFILES.map((lens) => {
            const isSelected = lens.id === selectedLens.id;
            return (
              <button
                key={lens.id}
                onClick={() => onSelectLens(lens)}
                className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${getThemeClasses(
                  lens.colorTheme,
                  isSelected
                )}`}
              >
                <div className="flex items-center gap-1 w-full justify-center">
                  <span className="text-[11px] font-bold truncate max-w-[105px] leading-tight">
                    {lens.shortName}
                  </span>
                  {isSelected && <Check className="w-3 h-3 shrink-0" />}
                </div>
                <span
                  className={`text-[9px] font-medium mt-0.5 px-1.5 py-0.2 rounded-full truncate max-w-[90px] ${
                    isSelected
                      ? 'bg-black/20 text-white/90'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {lens.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
