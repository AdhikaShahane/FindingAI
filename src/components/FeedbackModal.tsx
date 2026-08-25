import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { saveFeedbackRecord } from '../utils/feedback';
import { FusionResult, FileInfo } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileInfo: FileInfo | null;
  fusionResult: FusionResult | null;
  onSubmitted: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  fileInfo,
  fusionResult,
  onSubmitted,
}) => {
  const [correctedLabel, setCorrectedLabel] = useState<"LIKELY AI GENERATED" | "LIKELY AUTHENTIC" | "INCONCLUSIVE">(
    "LIKELY AUTHENTIC"
  );
  const [userNotes, setUserNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen || !fileInfo || !fusionResult) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveFeedbackRecord({
      filename: fileInfo.filename,
      sha256: fileInfo.sha256,
      predictedLabel: fusionResult.verdictLabel,
      predictedAiProbability: fusionResult.overallAiProbability,
      correctedLabel,
      userNotes,
      systemConfidence: fusionResult.modelConfidenceNumeric,
      layerSnapshot: fusionResult.channels.map((c) => `${c.name}:${c.score}%`).join(" | "),
      modelVersion: fusionResult.mlResult.architectureName,
    });

    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onSubmitted();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#232D3F] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        <div className="p-5 border-b border-[#232D3F] flex items-center justify-between bg-[#1E293B]/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Report Incorrect Detection</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-white">Correction Appended to Ledger!</h3>
            <p className="text-sm text-[#8B96A8]">
              Your feedback was recorded in the human correction log and updated model monitoring parameters.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-[#232D3F] space-y-1">
              <div className="text-xs text-[#8B96A8]">File Name:</div>
              <div className="text-sm font-medium text-white truncate">{fileInfo.filename}</div>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-[#232D3F]/60">
                <span className="text-[#8B96A8]">System Prediction:</span>
                <span className="font-semibold text-amber-400">{fusionResult.verdictLabel} ({fusionResult.overallAiProbability}%)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-2">Select Correct Ground Truth Label:</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "LIKELY AUTHENTIC", label: "Authentic Photo", icon: CheckCircle2, color: "text-emerald-400 border-emerald-500/30" },
                  { id: "LIKELY AI GENERATED", label: "AI Generated", icon: AlertCircle, color: "text-red-400 border-red-500/30" },
                  { id: "INCONCLUSIVE", label: "Inconclusive", icon: AlertTriangle, color: "text-amber-400 border-amber-500/30" },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSelected = correctedLabel === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setCorrectedLabel(item.id as any)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col items-center justify-center gap-1.5 ${
                        isSelected
                          ? `bg-blue-600/20 border-blue-500 text-white`
                          : `bg-[#1E293B] border-[#232D3F] text-gray-400 hover:border-gray-500`
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${item.color.split(" ")[0]}`} />
                      <span className="text-xs font-medium text-center">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 mb-1.5">User Observations & Notes:</label>
              <textarea
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                rows={3}
                placeholder="Describe why this prediction was wrong (e.g. valid EXIF camera tags stripped by social media, known Midjourney prompt artifacts, etc.)"
                className="w-full bg-[#0B0F19] border border-[#232D3F] rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#232D3F]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white transition shadow-lg shadow-blue-600/20"
              >
                Submit Correction
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
