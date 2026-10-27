'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LensProfile, LENS_PROFILES } from '../lib/data/lensProfiles';
import { Environment } from '../lib/data/environments';
import { OPTICAL_MODELS } from '../lib/data/opticalModels';
import { renderScene, renderDepthBlendedScene, SceneLayer, RenderResult } from '../lib/optics/renderer';
import { Eye, ArrowLeftRight, Camera, RefreshCw, ZoomIn, Check } from 'lucide-react';

const imageCanvasCache = new Map<string, HTMLCanvasElement>();
const resultCache = new Map<string, RenderResult>();

const loadImageCanvas = (src: string): Promise<HTMLCanvasElement> => {
  const cached = imageCanvasCache.get(src);
  if (cached) return Promise.resolve(cached);

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
        imageCanvasCache.set(src, c);
        resolve(c);
      } else {
        reject(new Error('Failed to get 2d context for image canvas'));
      }
    };
    img.onerror = () => reject(new Error(`Failed to load image asset: ${src}`));
    img.src = src;
  });
};

interface ViewportPaneProps {
  label: string;
  lens: LensProfile;
  env: Environment;
  zoomMode: 'fit' | 'near' | 'intermediate' | 'far';
  isComparing: boolean;
  onSelectLens?: (lens: LensProfile) => void;
  badgeBg: string;
}

const ViewportPane: React.FC<ViewportPaneProps> = ({
  label,
  lens,
  env,
  zoomMode,
  isComparing,
  onSelectLens,
  badgeBg,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [computing, setComputing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [renderInfo, setRenderInfo] = useState<RenderResult['layers']>([]);

  useEffect(() => {
    let active = true;
    const key = `${lens.id}|${env.id}`;

    const executeRender = async () => {
      try {
        setErrorMsg(null);
        setComputing(true);

        const canvas = canvasRef.current;
        if (!canvas) return;

        if (resultCache.has(key)) {
          const cached = resultCache.get(key)!;
          if (canvas.width !== cached.imageData.width || canvas.height !== cached.imageData.height) {
            canvas.width = cached.imageData.width;
            canvas.height = cached.imageData.height;
          }
          const ctx = canvas.getContext('2d');
          if (ctx) ctx.putImageData(cached.imageData, 0, 0);
          setRenderInfo(cached.layers);
          setComputing(false);
          return;
        }

        let result: RenderResult;
        const model = lens.optical ? OPTICAL_MODELS[lens.optical] : null;

        if (env.renderMode === 'depth-blend' && env.baseImage) {
          const baseCanvas = await loadImageCanvas(env.baseImage);
          const emissiveCanvas = env.emissiveImage ? await loadImageCanvas(env.emissiveImage) : null;
          if (!active) return;

          result = renderDepthBlendedScene(
            {
              baseCanvas,
              emissiveCanvas,
              w: baseCanvas.width,
              h: baseCanvas.height,
              farDistM: env.layers[0]?.distanceM || 10.0,
              intDistM: env.layers[1]?.distanceM || 0.85,
              nearDistM: env.layers[2]?.distanceM || 0.40,
            },
            env,
            model,
            !!model
          );
        } else {
          const layers: SceneLayer[] = [];
          for (const l of env.layers) {
            const c = await loadImageCanvas(l.file);
            const e = l.emissive ? await loadImageCanvas(l.emissive) : null;
            layers.push({ id: l.id, label: l.label, distanceM: l.distanceM, canvas: c, emissive: e });
          }
          if (!active) return;
          result = renderScene({ w: layers[0].canvas.width, h: layers[0].canvas.height, layers }, env, model, !!model);
        }

        if (!active) return;
        resultCache.set(key, result);

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
        if (active) setComputing(false);
      }
    };

    executeRender();

    return () => {
      active = false;
    };
  }, [lens, env]);

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
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl overflow-hidden shadow-xs flex flex-col flex-1">
      {/* Pane Header */}
      <div className="px-3 py-2 bg-gradient-to-r from-slate-50 to-slate-100/70 border-b border-slate-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider text-white shrink-0 ${badgeBg}`}>
            {label}
          </span>

          {isComparing && onSelectLens ? (
            <select
              value={lens.id}
              onChange={(e) => {
                const found = LENS_PROFILES.find((l) => l.id === e.target.value);
                if (found) onSelectLens(found);
              }}
              className="text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2 py-1 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-sky-500 truncate max-w-full"
            >
              {LENS_PROFILES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="font-bold text-slate-800 text-xs truncate">
              {lens.name}
            </span>
          )}
        </div>

        <span className="text-[10px] font-medium text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200 shrink-0">
          {lens.category}
        </span>
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
            <p className="text-xs font-bold text-slate-800">Computing Wave-Optics PSF...</p>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="absolute inset-0 bg-red-950/90 text-white p-4 flex items-center justify-center text-xs">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Pane Footer Info */}
      <div className="px-3 py-1.5 bg-slate-50/90 border-t border-slate-200/80 text-[10px] flex items-center justify-between text-slate-600">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-semibold text-slate-700">Scene Planes:</span>
          {renderInfo.map((info) => (
            <span
              key={info.id}
              className="bg-white border border-slate-200 px-1.5 py-0.2 rounded font-mono text-slate-700 shadow-2xs"
            >
              <b>{info.id}:</b> {info.vergenceD.toFixed(2)} D
            </span>
          ))}
        </div>
        <span className="text-slate-400 font-medium">Fourier Wave-Optics</span>
      </div>
    </div>
  );
};

export interface SimulatorViewProps {
  selectedLens: LensProfile;
  compareLens: LensProfile;
  selectedEnv: Environment;
  isCompareMode: boolean;
  onToggleCompareMode: (compare: boolean) => void;
  onSelectLens: (lens: LensProfile) => void;
  onSelectCompareLens: (lens: LensProfile) => void;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  selectedLens,
  compareLens,
  selectedEnv,
  isCompareMode,
  onToggleCompareMode,
  onSelectLens,
  onSelectCompareLens,
}) => {
  const [zoomMode, setZoomMode] = useState<'fit' | 'near' | 'intermediate' | 'far'>('fit');

  const handleSavePhoto = () => {
    const canvases = document.querySelectorAll('canvas');
    if (canvases.length === 0) return;
    const canvas = canvases[0] as HTMLCanvasElement;
    const link = document.createElement('a');
    link.download = `IOL_Simulation_${selectedLens.id}_${selectedEnv.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="flex flex-col gap-2.5">
      {/* Master Viewport Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-2 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-2xl shadow-xs text-xs gap-2">
        {/* Left: Viewport Mode & Title */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-800 flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-sky-600" />
            <span className="hidden sm:inline">Visual Simulation Viewport</span>
          </span>

          <button
            onClick={() => onToggleCompareMode(!isCompareMode)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition shadow-xs cursor-pointer ${
              isCompareMode
                ? 'bg-purple-600 hover:bg-purple-700 text-white ring-2 ring-purple-300'
                : 'bg-white hover:bg-slate-100 text-slate-800 border border-slate-300'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-purple-500" />
            <span>{isCompareMode ? 'Exit Side-by-Side' : '⇄ Compare Side-by-Side'}</span>
          </button>
        </div>

        {/* Right: Synchronized Inspection Zoom Modes & Export */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 bg-slate-100/90 p-0.5 rounded-lg border border-slate-200 shadow-2xs">
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
              🖥️ Int (85cm)
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

          <button
            onClick={handleSavePhoto}
            title="Download simulation viewport as PNG"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition"
          >
            <Camera className="w-3.5 h-3.5 text-sky-600" />
            <span className="hidden sm:inline">Save Photo</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Grid (Single vs Dual Side-by-Side) */}
      <div className={`grid gap-3.5 ${isCompareMode ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
        <ViewportPane
          label={isCompareMode ? 'Lens A' : 'Selected IOL'}
          lens={selectedLens}
          env={selectedEnv}
          zoomMode={zoomMode}
          isComparing={isCompareMode}
          onSelectLens={onSelectLens}
          badgeBg="bg-sky-600"
        />

        {isCompareMode && (
          <ViewportPane
            label="Lens B"
            lens={compareLens}
            env={selectedEnv}
            zoomMode={zoomMode}
            isComparing={isCompareMode}
            onSelectLens={onSelectCompareLens}
            badgeBg="bg-purple-600"
          />
        )}
      </div>
    </div>
  );
};
