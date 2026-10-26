'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LensProfile, LENS_PROFILES } from '../lib/data/lensProfiles';
import { Environment } from '../lib/data/environments';
import { OPTICAL_MODELS } from '../lib/data/opticalModels';
import { renderScene, SceneLayer, RenderResult } from '../lib/optics/renderer';
import { ZoomIn, Maximize2, RefreshCw, Eye, ArrowLeftRight } from 'lucide-react';

interface SimulatorViewProps {
  selectedLens: LensProfile;
  selectedEnv: Environment;
  onComputingChange?: (computing: boolean) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  selectedLens,
  selectedEnv,
  onComputingChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [computing, setComputing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [zoomMode, setZoomMode] = useState<'fit' | 'near' | 'intermediate' | 'far'>('fit');
  const [renderInfo, setRenderInfo] = useState<RenderResult['layers']>([]);
  const [compareMode, setCompareMode] = useState<boolean>(false);

  const cacheRef = useRef<Record<string, RenderResult>>({});
  const loadedScenesRef = useRef<Record<string, { w: number; h: number; layers: SceneLayer[] }>>({});

  const activeDisplayLens = compareMode
    ? LENS_PROFILES.find((l) => l.id === 'monofocal') || selectedLens
    : selectedLens;

  const loadImageCanvas = (src: string): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        const ctx = c.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          resolve(c);
        } else {
          reject(new Error('Failed to get 2d context for image canvas'));
        }
      };
      img.onerror = () => reject(new Error(`Failed to load image asset: ${src}`));
      img.src = src;
    });
  };

  const loadScene = async (env: Environment) => {
    if (loadedScenesRef.current[env.id]) return loadedScenesRef.current[env.id];

    const layers: SceneLayer[] = [];
    for (const l of env.layers) {
      const canvas = await loadImageCanvas(l.file);
      const emissive = l.emissive ? await loadImageCanvas(l.emissive) : null;
      layers.push({
        id: l.id,
        label: l.label,
        distanceM: l.distanceM,
        canvas,
        emissive,
      });
    }

    const scene = {
      w: layers[0].canvas.width,
      h: layers[0].canvas.height,
      layers,
    };
    loadedScenesRef.current[env.id] = scene;
    return scene;
  };

  useEffect(() => {
    let active = true;
    const key = `${activeDisplayLens.id}|${selectedEnv.id}`;

    const executeRender = async () => {
      try {
        setErrorMsg(null);
        setComputing(true);
        if (onComputingChange) onComputingChange(true);

        const canvas = canvasRef.current;
        if (!canvas) return;

        if (cacheRef.current[key]) {
          const cached = cacheRef.current[key];
          if (canvas.width !== cached.imageData.width || canvas.height !== cached.imageData.height) {
            canvas.width = cached.imageData.width;
            canvas.height = cached.imageData.height;
          }
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.putImageData(cached.imageData, 0, 0);
          setRenderInfo(cached.layers);
          setComputing(false);
          if (onComputingChange) onComputingChange(false);
          return;
        }

        const sceneData = await loadScene(selectedEnv);
        if (!active) return;

        await new Promise((r) => setTimeout(r, 20));
        if (!active) return;

        const model = activeDisplayLens.optical ? OPTICAL_MODELS[activeDisplayLens.optical] : null;
        const result = renderScene(sceneData, selectedEnv, model, !!model);

        if (!active) return;
        cacheRef.current[key] = result;

        if (canvas.width !== result.imageData.width || canvas.height !== result.imageData.height) {
          canvas.width = result.imageData.width;
          canvas.height = result.imageData.height;
        }
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.putImageData(result.imageData, 0, 0);

        setRenderInfo(result.layers);
      } catch (err: any) {
        if (!active) return;
        console.error('Simulation render error:', err);
        setErrorMsg(err.message || 'Error executing optical wave-propagation');
      } finally {
        if (active) {
          setComputing(false);
          if (onComputingChange) onComputingChange(false);
        }
      }
    };

    executeRender();

    return () => {
      active = false;
    };
  }, [activeDisplayLens, selectedEnv]);

  const getTransformStyle = () => {
    switch (zoomMode) {
      case 'near':
        return 'scale(1.85) translate(-22%, -6%)';
      case 'intermediate':
        return 'scale(2.0) translate(20%, -10%)';
      case 'far':
        return 'scale(2.0) translate(0%, 25%)';
      default:
        return 'scale(1) translate(0%, 0%)';
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl overflow-hidden shadow-sm flex flex-col">
      {/* Viewport Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3.5 py-2 bg-gradient-to-r from-slate-50 to-slate-100/60 border-b border-slate-200 text-xs gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-sky-600" />
            <span>Simulation Viewport</span>
          </span>

          {compareMode ? (
            <span className="bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full text-[10px] border border-amber-300 animate-pulse">
              Comparing vs Monofocal Control
            </span>
          ) : (
            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full text-[10px] border border-emerald-300">
              {activeDisplayLens.shortName}
            </span>
          )}
        </div>

        {/* Quick Inspection & Comparison Actions */}
        <div className="flex items-center gap-1.5">
          {selectedLens.id !== 'monofocal' && (
            <button
              onMouseDown={() => setCompareMode(true)}
              onMouseUp={() => setCompareMode(false)}
              onTouchStart={() => setCompareMode(true)}
              onTouchEnd={() => setCompareMode(false)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition select-none ${
                compareMode
                  ? 'bg-amber-500 text-white shadow-sm ring-2 ring-amber-300'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300'
              }`}
            >
              <ArrowLeftRight className="w-3 h-3 text-amber-500" />
              <span>Hold to Compare vs Monofocal</span>
            </button>
          )}

          <div className="flex items-center gap-0.5 bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
            <button
              onClick={() => setZoomMode('fit')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                zoomMode === 'fit' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full
            </button>
            <button
              onClick={() => setZoomMode('near')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                zoomMode === 'near' ? 'bg-amber-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📱 Near (40cm)
            </button>
            <button
              onClick={() => setZoomMode('intermediate')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                zoomMode === 'intermediate' ? 'bg-sky-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🖥️ Int (1m)
            </button>
            <button
              onClick={() => setZoomMode('far')}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                zoomMode === 'far' ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🏢 Far (10m)
            </button>
          </div>
        </div>
      </div>

      {/* Optical Canvas Display */}
      <div className="relative w-full aspect-[960/640] overflow-hidden bg-slate-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={960}
          height={640}
          style={{ transform: getTransformStyle(), transformOrigin: 'center center' }}
          className="w-full h-full object-contain transition-transform duration-300 ease-out"
        />

        {/* Loading Spinner */}
        {computing && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20">
            <RefreshCw className="w-7 h-7 text-sky-600 animate-spin" />
            <p className="text-xs font-bold text-slate-800">Computing Fourier Optical Simulation...</p>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="absolute inset-0 bg-red-950/90 text-white p-4 flex items-center justify-center text-xs">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Bottom Compact Diagnostic Bar */}
      <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-200/80 text-[11px] flex flex-wrap items-center justify-between gap-1 text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-700">Vergences:</span>
          {renderInfo.map((info) => (
            <span
              key={info.id}
              className="bg-white border border-slate-200 px-1.5 py-0.2 rounded font-mono text-[10px] text-slate-700"
            >
              <b>{info.id}:</b> {info.vergenceD.toFixed(1)}D ({info.kernelSize}px)
            </span>
          ))}
        </div>
        <span className="italic text-slate-500 truncate max-w-xs">{selectedEnv.credit}</span>
      </div>
    </div>
  );
};
