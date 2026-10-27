'use client';

import React, { useState } from 'react';
import { LENS_PROFILES, LensProfile } from '../lib/data/lensProfiles';
import { ENVIRONMENTS, Environment } from '../lib/data/environments';
import { ControlsBar } from '../components/ControlsBar';
import { SimulatorView } from '../components/SimulatorView';
import { DefocusCurveChart } from '../components/DefocusCurveChart';
import { AcuityScorecard } from '../components/AcuityScorecard';
import { MethodologyDrawer } from '../components/MethodologyDrawer';
import { Eye, FileText, Sparkles, TrendingDown, Scale } from 'lucide-react';

export default function Home() {
  const [selectedLens, setSelectedLens] = useState<LensProfile>(LENS_PROFILES[1]); // Clareon Monofocal default
  const [compareLens, setCompareLens] = useState<LensProfile>(LENS_PROFILES[6]);  // PanOptix Trifocal default
  const [selectedEnv, setSelectedEnv] = useState<Environment>(ENVIRONMENTS[0]);
  const [isCompareMode, setIsCompareMode] = useState<boolean>(false);
  const [isMethodologyOpen, setIsMethodologyOpen] = useState<boolean>(false);

  return (
    <main className="min-h-screen bg-slate-100/90 text-slate-900 flex flex-col font-sans">
      {/* Top Compact Navigation Header */}
      <header className="border-b border-slate-200/90 bg-white/95 backdrop-blur-md shadow-2xs sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold text-slate-900 tracking-tight">
                  IOL Vision Simulator
                </h1>
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-200">
                  Clinical Suite
                </span>
                <span className="hidden sm:inline px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Fourier Optics
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Through-Focus Wavefront Simulation • Evidence-Based Lens Comparison
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMethodologyOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition active:scale-[0.98] cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Evidence &amp; Audit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workstation Layout */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 flex-1 w-full flex flex-col gap-3.5">
        {/* Hero Control Bar: Viewing Scene & Doctor's Lens Portfolio */}
        <ControlsBar
          selectedLens={selectedLens}
          selectedEnv={selectedEnv}
          onSelectLens={setSelectedLens}
          onSelectEnv={setSelectedEnv}
        />

        {/* Primary Viewport Area (Full-Width Hero Focus) */}
        <section aria-label="Visual Simulation Viewport" className="w-full">
          <SimulatorView
            selectedLens={selectedLens}
            compareLens={compareLens}
            selectedEnv={selectedEnv}
            isCompareMode={isCompareMode}
            onToggleCompareMode={setIsCompareMode}
            onSelectLens={setSelectedLens}
            onSelectCompareLens={setCompareLens}
          />
        </section>

        {/* Bottom Section: Patient Acuity, Lifestyle & Clinical Defocus Curve */}
        <section aria-label="Clinical Metrics and Defocus Curve" className="mt-1 flex flex-col gap-3.5">
          <div className="flex items-center justify-between border-b border-slate-200 pb-1">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-sky-600" />
              <span>Clinical Analytics &amp; Patient Lifestyle Outcomes</span>
            </h3>
            {isCompareMode && (
              <span className="text-[11px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Scale className="w-3 h-3 text-purple-600" />
                Comparative Side-by-Side Mode Active
              </span>
            )}
          </div>

          {/* Cards & Defocus Curve Grid */}
          {!isCompareMode ? (
            /* Single Mode Layout: Scorecard (Left) and Defocus Curve (Right) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-between">
                <AcuityScorecard lens={selectedLens} />
              </div>
              <div className="lg:col-span-6 flex flex-col justify-between">
                <DefocusCurveChart
                  currentLensId={selectedLens.id}
                  environment={selectedEnv}
                />
              </div>
            </div>
          ) : (
            /* Side-by-Side Comparative Mode Layout */
            <div className="flex flex-col gap-3.5">
              {/* Dual Scorecards Side by Side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <div className="text-xs font-bold text-sky-800 bg-sky-50/80 px-2.5 py-1 rounded-lg border border-sky-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sky-600 inline-block" />
                    <span>Lens A: {selectedLens.name}</span>
                  </div>
                  <AcuityScorecard lens={selectedLens} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="text-xs font-bold text-purple-800 bg-purple-50/80 px-2.5 py-1 rounded-lg border border-purple-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
                    <span>Lens B: {compareLens.name}</span>
                  </div>
                  <AcuityScorecard lens={compareLens} />
                </div>
              </div>

              {/* Comparative Defocus Curve Chart (Plotting Lens A vs Lens B together) */}
              <DefocusCurveChart
                currentLensId={selectedLens.id}
                compareLensId={compareLens.id}
                environment={selectedEnv}
              />
            </div>
          )}
        </section>
      </div>

      {/* Clinical Notice Footer */}
      <footer className="border-t border-slate-200/90 bg-white/80 py-2.5 px-4 text-center text-[11px] text-slate-500 mt-auto">
        <span>
          <b>Clinical Disclaimer:</b> Visual acuity derived from peer-reviewed clinical defocus curves (FDA SSED &amp; Q1 journals); retinal scene rendered via Fourier wave-optics. Not an individual patient medical recommendation.
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
