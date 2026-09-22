import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import { SolarProductionHistoryPoint } from '../types';
import { SOLAR_HISTORY_24H } from '../data/mockData';

interface SolarProductionChartProps {
  currentProductionKw?: number;
  onTriggerSmsNotification?: (message: string) => void;
}

export const SolarProductionChart: React.FC<SolarProductionChartProps> = ({
  currentProductionKw = 4.8,
  onTriggerSmsNotification
}) => {
  const [dataMode, setDataMode] = useState<'production' | 'comparatif' | 'debit'>('production');
  const [hoveredPoint, setHoveredPoint] = useState<SolarProductionHistoryPoint | null>(null);

  // Compute 24h KPIs
  const totalKwh = SOLAR_HISTORY_24H.reduce((acc, pt) => acc + pt.productionKw, 0);
  const peakKw = Math.max(...SOLAR_HISTORY_24H.map((pt) => pt.productionKw));
  const peakHour = SOLAR_HISTORY_24H.find((pt) => pt.productionKw === peakKw)?.time || '12:00';
  const totalWaterPumpedM3 = SOLAR_HISTORY_24H.reduce((acc, pt) => acc + pt.pumpFlowM3h, 0);

  // Custom styled Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload as SolarProductionHistoryPoint;
      return (
        <div className="bg-[#131b2e] text-white p-3 rounded-xl shadow-xl border border-[#dae2fd]/20 text-xs min-w-[170px]">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
            <span className="font-bold flex items-center gap-1 text-[#fea619]">
              <span className="material-symbols-outlined text-[15px]">schedule</span>
              {dataPoint.time}
            </span>
            <span className="text-[10px] text-white/70 bg-white/10 px-1.5 py-0.5 rounded font-mono">
              24h Historique
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-white/80 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#fea619] inline-block"></span>
                Prod. Solaire :
              </span>
              <span className="font-bold text-[#fea619]">{dataPoint.productionKw} kW</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/80 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#005e87] inline-block"></span>
                Pompe Conso :
              </span>
              <span className="font-bold text-[#62b4f7]">{dataPoint.consumptionKw} kW</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-white/80 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#a6f4b5] inline-block"></span>
                Débit d'eau :
              </span>
              <span className="font-bold text-[#a6f4b5]">{dataPoint.pumpFlowM3h} m³/h</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-[10px] text-white/60">
              <span>Irradiance :</span>
              <span>{dataPoint.irradianceWm2} W/m²</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="w-full bg-white rounded-2xl p-4 shadow-sm border border-[#eaedff] flex flex-col gap-3.5">
      {/* Header with Title and Mode Switcher */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#855300] text-[20px]">
              stacked_line_chart
            </span>
            <h2 className="text-sm font-bold text-[#131b2e]">Historique Solaire (24 Heures)</h2>
          </div>
          <p className="text-xs text-[#404940] mt-0.5">
            Télémétrie continue IoT • Région du Poro (Korhogo)
          </p>
        </div>

        {/* Live indicator tag */}
        <span className="inline-flex items-center gap-1 bg-[#a6f4b5]/80 text-[#00210b] text-[10px] font-bold px-2 py-0.5 rounded-full shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#004c22] animate-pulse"></span>
          Recharts 24h
        </span>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#f2f3ff] rounded-xl p-2.5 border border-[#eaedff] flex flex-col">
          <span className="text-[10px] text-[#404940] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] text-[#855300]">wb_sunny</span>
            Pic Solaire
          </span>
          <span className="text-base font-extrabold text-[#131b2e] mt-0.5">
            {peakKw} <span className="text-[10px] font-normal text-[#404940]">kW</span>
          </span>
          <span className="text-[10px] text-[#855300] font-bold">À {peakHour}</span>
        </div>

        <div className="bg-[#f2f3ff] rounded-xl p-2.5 border border-[#eaedff] flex flex-col">
          <span className="text-[10px] text-[#404940] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] text-[#004c22]">bolt</span>
            Énergie 24h
          </span>
          <span className="text-base font-extrabold text-[#004c22] mt-0.5">
            {totalKwh.toFixed(1)} <span className="text-[10px] font-normal text-[#404940]">kWh</span>
          </span>
          <span className="text-[10px] text-[#004c22] font-bold">100% Renouvelable</span>
        </div>

        <div className="bg-[#f2f3ff] rounded-xl p-2.5 border border-[#eaedff] flex flex-col">
          <span className="text-[10px] text-[#404940] font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px] text-[#005e87]">water_drop</span>
            Volume Pompé
          </span>
          <span className="text-base font-extrabold text-[#005e87] mt-0.5">
            {Math.round(totalWaterPumpedM3)} <span className="text-[10px] font-normal text-[#404940]">m³</span>
          </span>
          <span className="text-[10px] text-[#005e87] font-bold">0 L de gasoil</span>
        </div>
      </div>

      {/* Mode Filter Pills */}
      <div className="flex bg-[#f2f3ff] p-1 rounded-xl text-xs font-bold gap-1 border border-[#eaedff]">
        <button
          type="button"
          onClick={() => setDataMode('production')}
          className={`flex-1 py-1.5 rounded-lg text-[11px] transition-all flex items-center justify-center gap-1 ${
            dataMode === 'production'
              ? 'bg-[#004c22] text-white shadow-xs'
              : 'text-[#404940] hover:text-[#004c22]'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">sunny</span>
          <span>Production (kW)</span>
        </button>

        <button
          type="button"
          onClick={() => setDataMode('comparatif')}
          className={`flex-1 py-1.5 rounded-lg text-[11px] transition-all flex items-center justify-center gap-1 ${
            dataMode === 'comparatif'
              ? 'bg-[#004c22] text-white shadow-xs'
              : 'text-[#404940] hover:text-[#004c22]'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">compare_arrows</span>
          <span>Prod vs Conso</span>
        </button>

        <button
          type="button"
          onClick={() => setDataMode('debit')}
          className={`flex-1 py-1.5 rounded-lg text-[11px] transition-all flex items-center justify-center gap-1 ${
            dataMode === 'debit'
              ? 'bg-[#004c22] text-white shadow-xs'
              : 'text-[#404940] hover:text-[#004c22]'
          }`}
        >
          <span className="material-symbols-outlined text-[14px]">waves</span>
          <span>Débit Eau (m³/h)</span>
        </button>
      </div>

      {/* Recharts Linear Line Chart Container */}
      <div className="w-full bg-[#fafbff] rounded-xl p-2.5 border border-[#eaedff]">
        <div className="flex items-center justify-between text-[11px] text-[#404940] px-1 mb-1">
          <span className="font-semibold flex items-center gap-1 text-[#131b2e]">
            <span className="material-symbols-outlined text-[14px] text-[#004c22]">query_stats</span>
            Courbe de production sur 24 heures
          </span>
          <span className="text-[10px] text-[#707a6f]">Mise à jour : en direct</span>
        </div>

        <div className="w-full h-56">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <LineChart
              data={SOLAR_HISTORY_24H}
              margin={{ top: 8, right: 10, left: -22, bottom: 0 }}
              onMouseMove={(state: any) => {
                if (state && state.activePayload && state.activePayload.length) {
                  setHoveredPoint(state.activePayload[0].payload);
                }
              }}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <defs>
                <linearGradient id="solarLineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fea619" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#fea619" stopOpacity={0.1} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#eaedff" vertical={false} />

              <XAxis
                dataKey="hourLabel"
                stroke="#707a6f"
                tick={{ fontSize: 10, fill: '#707a6f' }}
                interval={2}
                tickLine={false}
              />

              <YAxis
                stroke="#707a6f"
                tick={{ fontSize: 10, fill: '#707a6f' }}
                domain={[0, (dataMax: number) => Math.max(5.5, Math.ceil(dataMax + 0.5))]}
                tickLine={false}
                unit={dataMode === 'debit' ? 'm³' : 'kW'}
              />

              <Tooltip content={<CustomTooltip />} />

              {/* Peak solar reference line at 4.9 kW */}
              {dataMode !== 'debit' && (
                <ReferenceLine
                  y={4.9}
                  stroke="#ba1a1a"
                  strokeDasharray="3 3"
                  label={{
                    value: 'Pic 4.9 kW',
                    position: 'top',
                    fill: '#ba1a1a',
                    fontSize: 9,
                    fontWeight: 'bold'
                  }}
                />
              )}

              {/* Primary Line: Solar Production in kW */}
              {(dataMode === 'production' || dataMode === 'comparatif') && (
                <Line
                  type="monotone"
                  dataKey="productionKw"
                  name="Production Solaire (kW)"
                  stroke="#fea619"
                  strokeWidth={3}
                  dot={{ r: 2, fill: '#855300', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#855300', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              {/* Secondary Line: Pump Consumption in kW */}
              {dataMode === 'comparatif' && (
                <Line
                  type="monotone"
                  dataKey="consumptionKw"
                  name="Conso Pompe (kW)"
                  stroke="#005e87"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                  activeDot={{ r: 5, fill: '#005e87', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              {/* Flow Rate Line */}
              {dataMode === 'debit' && (
                <Line
                  type="monotone"
                  dataKey="pumpFlowM3h"
                  name="Débit Pompe (m³/h)"
                  stroke="#004c22"
                  strokeWidth={3}
                  dot={{ r: 2, fill: '#004c22', strokeWidth: 0 }}
                  activeDot={{ r: 6, fill: '#004c22', stroke: '#ffffff', strokeWidth: 2 }}
                />
              )}

              <Legend
                wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                iconType="circle"
                iconSize={8}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Hover inspection strip */}
        <div className="flex items-center justify-between text-[11px] text-[#404940] px-2 pt-1 border-t border-[#eaedff] mt-1">
          <span>
            {hoveredPoint ? (
              <strong className="text-[#131b2e]">
                {hoveredPoint.time} : {hoveredPoint.productionKw} kW générés •{' '}
                {hoveredPoint.pumpFlowM3h} m³/h pompés
              </strong>
            ) : (
              <span>Survolez le graphique pour inspecter chaque heure</span>
            )}
          </span>
          <span className="text-[10px] text-[#004c22] font-bold">Zone Savane CI</span>
        </div>
      </div>

      {/* Insight card under the chart */}
      <div className="bg-[#f2f3ff] rounded-xl p-3 border border-[#dae2fd] flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#004c22] text-white flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[18px]">energy_savings_leaf</span>
          </div>
          <div>
            <span className="font-bold text-[#131b2e] block">
              Fenêtre d'irrigation optimale : 09h30 - 15h30
            </span>
            <p className="text-[11px] text-[#404940]">
              La centrale fournit plus de 3.8 kW en continu, suffisant pour faire tourner la pompe à 100% sans entamer les batteries.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (onTriggerSmsNotification) {
              onTriggerSmsNotification(
                "Rapport SMS 24h envoyé : 28.7 kWh solaires générés, 142 m³ d'eau pompés, pic 4.9 kW à 12h00."
              );
            }
          }}
          className="shrink-0 px-2.5 py-1.5 bg-white border border-[#dae2fd] text-[#004c22] font-bold text-[11px] rounded-lg shadow-2xs hover:bg-[#eaedff] active:scale-95 transition-all flex items-center gap-1"
          title="Envoyer rapport 24h par SMS"
        >
          <span className="material-symbols-outlined text-[14px]">sms</span>
          <span>Bilan SMS</span>
        </button>
      </div>
    </section>
  );
};
