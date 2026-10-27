'use client';

import React from 'react';
import { CLINICAL_DEFOCUS_DATA, DefocusPoint } from '../lib/data/defocusCurves';
import { Environment } from '../lib/data/environments';
import { TrendingDown } from 'lucide-react';

interface DefocusCurveChartProps {
  currentLensId: string;
  compareLensId?: string | null;
  environment: Environment;
}

export const DefocusCurveChart: React.FC<DefocusCurveChartProps> = ({
  currentLensId,
  compareLensId,
  environment,
}) => {
  const currentData = CLINICAL_DEFOCUS_DATA[currentLensId] || CLINICAL_DEFOCUS_DATA['puresee'];
  const compareData = compareLensId ? CLINICAL_DEFOCUS_DATA[compareLensId] : null;
  const monofocalData = CLINICAL_DEFOCUS_DATA['monofocal'];

  const W = 480;
  const H = 190;
  const pad = { left: 40, right: 20, top: 20, bottom: 30 };
  const plotW = W - pad.left - pad.right;
  const plotH = H - pad.top - pad.bottom;

  const minD = -3.5;
  const maxD = 1.5;
  const dToX = (d: number) => pad.left + ((maxD - d) / (maxD - minD)) * plotW;

  const minVA = -0.15;
  const maxVA = 0.65;
  const vaToY = (va: number) => pad.top + ((va - minVA) / (maxVA - minVA)) * plotH;

  const makePath = (pts: DefocusPoint[]) => {
    if (!pts || pts.length === 0) return '';
    const sorted = [...pts].sort((a, b) => b.d - a.d);
    return sorted
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${dToX(p.d).toFixed(1)} ${vaToY(p.va).toFixed(1)}`)
      .join(' ');
  };

  return (
    <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
      <div className="flex items-center justify-between mb-1.5">
        <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider">
          <TrendingDown className="w-3.5 h-3.5 text-sky-600" />
          Clinical Defocus Curve
        </h4>
        <div className="flex items-center gap-2 text-[11px]">
          <span className="flex items-center gap-1 text-sky-700 font-bold">
            <span className="w-2 h-2 rounded-full bg-sky-600 inline-block" />
            {compareData ? `Lens A (${currentData?.lensName.split(' ')[0] || 'Selected'})` : 'Selected IOL'}
          </span>
          {compareData && (
            <span className="flex items-center gap-1 text-purple-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-purple-600 inline-block" />
              Lens B ({compareData.lensName.split(' ')[0]})
            </span>
          )}
          {!compareData && currentLensId !== 'monofocal' && (
            <span className="flex items-center gap-1 text-slate-400 font-medium">
              <span className="w-2 h-0.5 bg-slate-400 inline-block" />
              Monofocal Ref
            </span>
          )}
        </div>
      </div>

      <div className="relative overflow-hidden bg-slate-50/70 rounded-xl border border-slate-200/70 p-1">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto select-none font-sans">
          {/* Background grid */}
          <rect x={pad.left} y={pad.top} width={plotW} height={plotH} fill="#ffffff" rx="4" />

          {/* 20/20 (0.0 logMAR) threshold line */}
          <line
            x1={pad.left}
            y1={vaToY(0.0)}
            x2={pad.left + plotW}
            y2={vaToY(0.0)}
            stroke="#16a34a"
            strokeDasharray="3,3"
            strokeWidth="1.2"
          />
          <text x={pad.left + 5} y={vaToY(0.0) - 3} fill="#16a34a" fontSize="8" fontWeight="bold">
            20/20 (0.0 logMAR)
          </text>

          {/* Y-axis ticks */}
          {[0.0, 0.2, 0.4, 0.6].map((va) => (
            <g key={va}>
              <line
                x1={pad.left - 3}
                y1={vaToY(va)}
                x2={pad.left}
                y2={vaToY(va)}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              <text
                x={pad.left - 6}
                y={vaToY(va) + 3}
                fill="#64748b"
                fontSize="8.5"
                fontWeight="600"
                textAnchor="end"
              >
                {va.toFixed(1)}
              </text>
            </g>
          ))}

          {/* X-axis ticks */}
          {[1.0, 0.0, -1.0, -2.0, -3.0].map((d) => (
            <g key={d}>
              <line
                x1={dToX(d)}
                y1={pad.top + plotH}
                x2={dToX(d)}
                y2={pad.top + plotH + 3}
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              <text
                x={dToX(d)}
                y={pad.top + plotH + 14}
                fill="#64748b"
                fontSize="8.5"
                fontWeight="600"
                textAnchor="middle"
              >
                {d > 0 ? `+${d.toFixed(0)}` : d.toFixed(0)} D
              </text>
            </g>
          ))}

          {/* Scene depth layer vergence vertical markers */}
          {environment.layers.map((layer) => {
            const vergenceD = -(1 / layer.distanceM);
            if (vergenceD < minD || vergenceD > maxD) return null;
            const x = dToX(vergenceD);
            const isNear = layer.distanceM < 0.6;
            const isIntermediate = layer.distanceM >= 0.6 && layer.distanceM <= 1.5;
            const markerColor = isNear ? '#d97706' : isIntermediate ? '#0284c7' : '#7c3aed';
            const labelText = isNear
              ? 'Near (40cm / -2.50D)'
              : isIntermediate
              ? 'Int (85cm / -1.18D)'
              : 'Far (10m / -0.10D)';

            return (
              <g key={layer.id}>
                <line
                  x1={x}
                  y1={pad.top}
                  x2={x}
                  y2={pad.top + plotH}
                  stroke={markerColor}
                  strokeWidth="1.2"
                  strokeDasharray="2,2"
                />
                <circle cx={x} cy={pad.top + 6} r="2.5" fill={markerColor} />
                <text
                  x={x}
                  y={pad.top + 16}
                  fill={markerColor}
                  fontSize="7.5"
                  fontWeight="bold"
                  textAnchor="middle"
                >
                  {labelText}
                </text>
              </g>
            );
          })}

          {/* Monofocal control curve */}
          {monofocalData && currentLensId !== 'monofocal' && (
            <path
              d={makePath(monofocalData.points)}
              fill="none"
              stroke="#94a3b8"
              strokeWidth="1.5"
              strokeDasharray="3,3"
              opacity="0.8"
            />
          )}

          {/* Selected lens clinical defocus curve (Lens A) */}
          {currentData && (
            <>
              {/* Uncertainty / Confidence Error Bars (when available in dataset) */}
              {currentData.points.map((p, idx) => {
                if (p.lo === undefined || p.hi === undefined) return null;
                const px = dToX(p.d);
                const yLo = vaToY(p.lo);
                const yHi = vaToY(p.hi);
                return (
                  <g key={`err-${idx}`} opacity="0.65">
                    <line x1={px} y1={yLo} x2={px} y2={yHi} stroke="#0284c7" strokeWidth="1.2" />
                    <line x1={px - 2.5} y1={yLo} x2={px + 2.5} y2={yLo} stroke="#0284c7" strokeWidth="1" />
                    <line x1={px - 2.5} y1={yHi} x2={px + 2.5} y2={yHi} stroke="#0284c7" strokeWidth="1" />
                  </g>
                );
              })}

              <path
                d={makePath(currentData.points)}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.2"
              />
              {currentData.points.map((p, idx) => (
                <circle
                  key={idx}
                  cx={dToX(p.d)}
                  cy={vaToY(p.va)}
                  r="3"
                  fill="#0369a1"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              ))}
            </>
          )}

          {/* Comparative lens clinical defocus curve (Lens B, if present) */}
          {compareData && (
            <>
              {compareData.points.map((p, idx) => {
                if (p.lo === undefined || p.hi === undefined) return null;
                const px = dToX(p.d);
                const yLo = vaToY(p.lo);
                const yHi = vaToY(p.hi);
                return (
                  <g key={`err-b-${idx}`} opacity="0.65">
                    <line x1={px} y1={yLo} x2={px} y2={yHi} stroke="#7c3aed" strokeWidth="1.2" />
                    <line x1={px - 2.5} y1={yLo} x2={px + 2.5} y2={yLo} stroke="#7c3aed" strokeWidth="1" />
                    <line x1={px - 2.5} y1={yHi} x2={px + 2.5} y2={yHi} stroke="#7c3aed" strokeWidth="1" />
                  </g>
                );
              })}

              <path
                d={makePath(compareData.points)}
                fill="none"
                stroke="#7c3aed"
                strokeWidth="2.2"
              />
              {compareData.points.map((p, idx) => (
                <circle
                  key={idx}
                  cx={dToX(p.d)}
                  cy={vaToY(p.va)}
                  r="3"
                  fill="#6d28d9"
                  stroke="#ffffff"
                  strokeWidth="1.2"
                />
              ))}
            </>
          )}

          {/* Axis Labels */}
          <text
            x={pad.left + plotW / 2}
            y={H - 3}
            fill="#475569"
            fontSize="8.5"
            fontWeight="bold"
            textAnchor="middle"
          >
            Spectacle Defocus (Diopters) • Near ➔
          </text>
        </svg>
      </div>

      <div className="text-[10px] text-slate-500 mt-1.5 flex flex-wrap justify-between gap-1 items-center">
        <span>
          <b>Source:</b> {currentData ? currentData.citation.split(',')[0] : 'FDA SSED'}
          {compareData ? ` vs. ${compareData.citation.split(',')[0]}` : ''}
        </span>
        <span className="text-slate-400">Photopic Binocular BCDVA • Error bars: 95% CI/SD where reported</span>
      </div>
    </div>
  );
};
