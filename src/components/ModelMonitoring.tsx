import React, { useState, useEffect } from 'react';
import { BarChart3, Database, TrendingUp, CheckCircle, ShieldCheck, Sliders, Cpu, Activity, AlertTriangle } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { computeMonitoringMetrics } from '../utils/feedback';

export const ModelMonitoring: React.FC = () => {
  const [metrics, setMetrics] = useState(computeMonitoringMetrics());
  const [detectionThreshold, setDetectionThreshold] = useState<number>(0.62);

  useEffect(() => {
    setMetrics(computeMonitoringMetrics());
  }, []);

  const weightsData = [
    { name: 'ML AI Detector (ConvNeXt/ViT)', value: 40, color: '#3B82F6' },
    { name: 'Digital Forensics (FFT/ELA/PRNU)', value: 25, color: '#8B5CF6' },
    { name: 'Computer Vision & Anatomy', value: 20, color: '#10B981' },
    { name: 'Metadata & File Integrity', value: 15, color: '#F59E0B' },
  ];

  // Recalculate false positive & negative rates based on threshold slider
  const simulatedFPR = (metrics.falsePositiveRate * (0.62 / detectionThreshold)).toFixed(2);
  const simulatedFNR = (metrics.falseNegativeRate * (detectionThreshold / 0.62)).toFixed(2);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            <span>Model & Forensic Performance Monitoring</span>
          </h1>
          <p className="text-xs text-[#8B96A8] mt-1">
            Real-time evaluation metrics, confusion matrix, threshold tuning, and generator generalization benchmarks.
          </p>
        </div>

        <div className="bg-[#111827] border border-[#232D3F] px-3.5 py-2 rounded-xl text-xs text-gray-300 flex items-center gap-2">
          <Cpu className="w-4 h-4 text-blue-400" />
          <span>Active Architecture: <strong className="text-white">v2.4 ConvNeXt-Large / ViT Ensemble</strong></span>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-semibold text-[#8B96A8] uppercase">Accuracy</div>
          <div className="text-2xl font-black text-white">{metrics.accuracy}%</div>
          <div className="text-[10px] text-emerald-400 font-medium">+0.3% last epoch</div>
        </div>

        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-semibold text-[#8B96A8] uppercase">Precision</div>
          <div className="text-2xl font-black text-blue-400">{metrics.precision}</div>
          <div className="text-[10px] text-gray-400">Positive predictive</div>
        </div>

        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-semibold text-[#8B96A8] uppercase">Recall</div>
          <div className="text-2xl font-black text-purple-300">{metrics.recall}</div>
          <div className="text-[10px] text-gray-400">Sensitivity index</div>
        </div>

        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-semibold text-[#8B96A8] uppercase">F1 Score</div>
          <div className="text-2xl font-black text-emerald-400">{metrics.f1Score}</div>
          <div className="text-[10px] text-gray-400">Harmonic mean</div>
        </div>

        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-semibold text-[#8B96A8] uppercase">ROC-AUC</div>
          <div className="text-2xl font-black text-amber-400">{metrics.rocAuc}</div>
          <div className="text-[10px] text-gray-400">Area under curve</div>
        </div>

        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-semibold text-[#8B96A8] uppercase">False Positive Rate</div>
          <div className="text-2xl font-black text-red-400">{simulatedFPR}%</div>
          <div className="text-[10px] text-gray-400">Photos flagged AI</div>
        </div>

        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-semibold text-[#8B96A8] uppercase">Dataset Scale</div>
          <div className="text-2xl font-black text-purple-300">{metrics.datasetScale.toLocaleString()}</div>
          <div className="text-[10px] text-gray-400">Corpus images</div>
        </div>

        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-semibold text-[#8B96A8] uppercase">Human Ledger</div>
          <div className="text-2xl font-black text-amber-300">{metrics.totalCorrectionsLogged}</div>
          <div className="text-[10px] text-gray-400">Verified records</div>
        </div>
      </div>

      {/* Threshold Control Bar */}
      <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span>Detection Decision Threshold & Sensitivity Controls</span>
          </h3>
          <span className="px-2.5 py-1 rounded bg-blue-950/60 border border-blue-500/40 text-blue-300 font-mono text-xs font-bold">
            Threshold: {(detectionThreshold * 100).toFixed(0)}%
          </span>
        </div>

        <div className="space-y-2">
          <input
            type="range"
            min="0.40"
            max="0.85"
            step="0.01"
            value={detectionThreshold}
            onChange={(e) => setDetectionThreshold(parseFloat(e.target.value))}
            className="w-full accent-blue-500 bg-[#0B0F19] h-2 rounded-lg cursor-pointer"
          />
          <div className="flex items-center justify-between text-[11px] text-[#8B96A8]">
            <span>0.40 (High Sensitivity / Lower False Negatives)</span>
            <span>0.62 (Balanced Optimal Forensic Baseline)</span>
            <span>0.85 (High Specificity / Minimal False Positives)</span>
          </div>
        </div>
      </div>

      {/* Confusion Matrix & Generator Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Confusion Matrix Card */}
        <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Confusion Matrix (Evaluation Corpus)</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-emerald-950/20 border border-emerald-500/30 p-3.5 rounded-xl">
              <div className="text-[10px] text-emerald-400 uppercase font-bold">True AI (TP)</div>
              <div className="text-2xl font-black text-white mt-1">{metrics.confusionMatrix.trueAi.toLocaleString()}</div>
            </div>

            <div className="bg-red-950/20 border border-red-500/30 p-3.5 rounded-xl">
              <div className="text-[10px] text-red-400 uppercase font-bold">False AI (FP)</div>
              <div className="text-2xl font-black text-white mt-1">{metrics.confusionMatrix.falseAi.toLocaleString()}</div>
            </div>

            <div className="bg-amber-950/20 border border-amber-500/30 p-3.5 rounded-xl">
              <div className="text-[10px] text-amber-400 uppercase font-bold">False Authentic (FN)</div>
              <div className="text-2xl font-black text-white mt-1">{metrics.confusionMatrix.falseAuthentic.toLocaleString()}</div>
            </div>

            <div className="bg-blue-950/20 border border-blue-500/30 p-3.5 rounded-xl">
              <div className="text-[10px] text-blue-400 uppercase font-bold">True Authentic (TN)</div>
              <div className="text-2xl font-black text-white mt-1">{metrics.confusionMatrix.trueAuthentic.toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Generator Benchmarks */}
        <div className="lg:col-span-2 bg-[#111827] border border-[#232D3F] rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span>Detection Accuracy Across Generative Models & Unseen Engines</span>
          </h3>

          <div className="space-y-3">
            {metrics.generatorPerformance.map((gen) => (
              <div key={gen.generator} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-200">{gen.generator}</span>
                  <span className="text-gray-400 font-mono">{gen.accuracy}% accuracy ({gen.samples.toLocaleString()} test images)</span>
                </div>
                <div className="w-full bg-[#0B0F19] h-2 rounded-full overflow-hidden border border-[#232D3F]">
                  <div
                    className={`h-full ${
                      gen.accuracy >= 92 ? 'bg-blue-500' : gen.accuracy >= 88 ? 'bg-purple-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${gen.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Accuracy History Line Chart */}
      <div className="bg-[#111827] border border-[#232D3F] rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-400" />
          <span>Accuracy Trend Across Continuous Retraining Epochs</span>
        </h3>

        <div className="h-60 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={metrics.accuracyHistory}>
              <XAxis dataKey="step" stroke="#8B96A8" fontSize={11} />
              <YAxis domain={['dataMin - 1', 'dataMax + 1']} stroke="#8B96A8" fontSize={11} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0B0F19', borderColor: '#232D3F', borderRadius: '12px' }}
                itemStyle={{ color: '#60A5FA' }}
              />
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
