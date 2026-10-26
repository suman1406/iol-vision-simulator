'use client';

import React, { useState } from 'react';
import { LENS_PROFILES, LensProfile } from '../lib/data/lensProfiles';
import { ENVIRONMENTS, Environment } from '../lib/data/environments';
import { ControlsBar } from '../components/ControlsBar';
import { SimulatorView } from '../components/SimulatorView';
import { DefocusCurveChart } from '../components/DefocusCurveChart';
import { AcuityScorecard } from '../components/AcuityScorecard';
import { MethodologyDrawer } from '../components/MethodologyDrawer';
import { Eye, FileText, Sparkles, ShieldCheck } from 'lucide-react';

export default function Home() {
  const [selectedLens, setSelectedLens] = useState<LensProfile>(LENS_PROFILES[0]);
  const [selectedEnv, setSelectedEnv] = useState<Environment>(ENVIRONMENTS[0]);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);
  const [isComputing, setIsComputing] = useState<boolean>(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50/40 to-indigo-50/30 text-slate-900 flex flex-col font-sans">
      {/* Top Compact Navigation Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur-md shadow-2xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                  IOL Vision Simulator
                </h1>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  Patient Consultation Suite
                </span>
                <span className="hidden sm:inline px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Fourier Optics Validated
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Interactive Pre-Operative Lens Education • Evidence-Based Through-Focus Simulation
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsMethodologyOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-sm transition active:scale-[0.98]"
          >
            <FileText className="w-3.5 h-3.5 text-sky-400" />
            Evidence &amp; Audit
          </button>
        </div>
      </header>

      {/* Main Workstation Container */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3.5 flex-1 w-full flex flex-col gap-3">
        {/* Colorful, Compact Controls Bar */}
        <ControlsBar
          selectedLens={selectedLens}
          selectedEnv={selectedEnv}
          onSelectLens={setSelectedLens}
          onSelectEnv={setSelectedEnv}
        />

        {/* Responsive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
          {/* Main Visualizer (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-3">
            <SimulatorView
              selectedLens={selectedLens}
              selectedEnv={selectedEnv}
              onComputingChange={setIsComputing}
            />
          </div>

          {/* Right Column: Acuity Scorecard & Defocus Curves (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {/* Visual Acuity & Lifestyle Scorecard */}
            <AcuityScorecard lens={selectedLens} />

            {/* Interactive Defocus Curve Chart */}
            <DefocusCurveChart
              currentLensId={selectedLens.id}
              environment={selectedEnv}
            />
          </div>
        </div>
      </div>

      {/* Compact Clinical Disclaimer Footer */}
      <footer className="border-t border-slate-200/80 bg-white/70 py-2.5 px-4 text-center text-[11px] text-slate-500 mt-auto">
        <span>
          <b>Clinical Notice:</b> Illustrative simulation powered by Fourier wave optics &amp; ISO 11979-2 model eye bench data. Outcomes vary by patient corneal cylinder, pupil dynamics, and neuroadaptation.
        </span>
      </footer>

      {/* Methodology & Clinical Evidence Drawer */}
      <MethodologyDrawer
        isOpen={isMethodologyOpen}
        onClose={() => setIsMethodologyOpen(false)}
        lens={selectedLens}
        env={selectedEnv}
      />
    </main>
  );
}
