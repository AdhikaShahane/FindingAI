import React, { useState } from 'react';
import {
  BrainCircuit,
  Boxes,
  Compass,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Layers,
  Sparkles,
  Code,
  Info,
  Activity,
  Maximize2,
  Minimize2,
  GitCommit,
  Workflow,
  Scale,
  FileText,
  UserCheck,
} from 'lucide-react';
import {
  SemanticReasoningResult,
  SceneEntity,
  SceneRelationship,
  SceneAction,
  PlausibilityDimension,
  FileInfo,
} from '../types';

interface SemanticReasoningViewProps {
  semanticResult: SemanticReasoningResult;
  fileInfo: FileInfo;
  originalUrl: string | null;
  onRefreshWithGemini?: () => void;
  isGeminiLoading?: boolean;
}

export const SemanticReasoningView: React.FC<SemanticReasoningViewProps> = ({
  semanticResult,
  fileInfo,
  originalUrl,
  onRefreshWithGemini,
  isGeminiLoading = false,
}) => {
  const [selectedEntity, setSelectedEntity] = useState<SceneEntity | null>(
    semanticResult.scene.entities[0] || null
  );
  const [showJsonView, setShowJsonView] = useState(false);
  const [activeDimension, setActiveDimension] = useState<string>('spatial_gravity');
  const [activeSubTab, setActiveSubTab] = useState<'graph' | 'report' | 'anatomy_physics' | 'contradictions' | 'pipeline'>('report');

  const {
    scene,
    dimensions,
    overallPlausibilityScore,
    syntheticIndicatorScore,
    unusualVsImplausibleSummary,
    isPhysicalImpossibilityDetected,
    contradictions = [],
    anatomicalAssessment,
    affordanceAssessment,
    physicsAssessment,
    humanLikeReport,
  } = semanticResult;

  return (
    <div className="w-full bg-[#111827] rounded-2xl border border-[#232D3F] p-5 space-y-6 text-xs">
      {/* Header Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#232D3F] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-400 animate-pulse" />
            <h3 className="text-base font-bold text-white">
              Semantic Reality & Common-Sense Reasoning Engine
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-semibold border border-purple-500/30">
              World-Model Channel: 20% Weight
            </span>
          </div>
          <p className="text-gray-400 mt-1">
            Evaluates scene graph structure, visual medium classification, anatomical biomechanics, object affordances, physical gravity, and shadow consistency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onRefreshWithGemini && (
            <button
              onClick={onRefreshWithGemini}
              disabled={isGeminiLoading}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-purple-600/20"
            >
              {isGeminiLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 text-purple-200" />
              )}
              <span>{isGeminiLoading ? 'Analyzing Scene...' : 'Run Gemini Vision Scene Audit'}</span>
            </button>
          )}

          <button
            onClick={() => setShowJsonView(!showJsonView)}
            className="px-3 py-2 rounded-xl bg-[#1E293B] hover:bg-[#27344A] text-gray-300 font-semibold text-xs border border-[#232D3F] transition flex items-center gap-1.5"
          >
            <Code className="w-4 h-4 text-blue-400" />
            <span>{showJsonView ? 'Hide Scene JSON' : 'View Scene Graph JSON'}</span>
          </button>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#232D3F] pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('report')}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 ${
            activeSubTab === 'report'
              ? 'bg-purple-600 text-white border border-purple-500'
              : 'bg-[#0B0F19] text-gray-300 hover:bg-[#1E293B] border border-[#232D3F]'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-purple-300" />
          <span>Semantic Reality Analysis Report</span>
        </button>

        <button
          onClick={() => setActiveSubTab('graph')}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 ${
            activeSubTab === 'graph'
              ? 'bg-purple-600 text-white border border-purple-500'
              : 'bg-[#0B0F19] text-gray-300 hover:bg-[#1E293B] border border-[#232D3F]'
          }`}
        >
          <Boxes className="w-3.5 h-3.5 text-blue-300" />
          <span>Scene Consistency Graph & Entities</span>
        </button>

        <button
          onClick={() => setActiveSubTab('anatomy_physics')}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 ${
            activeSubTab === 'anatomy_physics'
              ? 'bg-purple-600 text-white border border-purple-500'
              : 'bg-[#0B0F19] text-gray-300 hover:bg-[#1E293B] border border-[#232D3F]'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-emerald-300" />
          <span>Anatomy, Physics & Affordances</span>
        </button>

        <button
          onClick={() => setActiveSubTab('contradictions')}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 ${
            activeSubTab === 'contradictions'
              ? 'bg-purple-600 text-white border border-purple-500'
              : 'bg-[#0B0F19] text-gray-300 hover:bg-[#1E293B] border border-[#232D3F]'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
          <span>Contradictions ({contradictions.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('pipeline')}
          className={`px-3 py-1.5 rounded-lg font-bold text-xs transition flex items-center gap-1.5 ${
            activeSubTab === 'pipeline'
              ? 'bg-purple-600 text-white border border-purple-500'
              : 'bg-[#0B0F19] text-gray-300 hover:bg-[#1E293B] border border-[#232D3F]'
          }`}
        >
          <Workflow className="w-3.5 h-3.5 text-cyan-300" />
          <span>Pipeline Flow Architecture</span>
        </button>
      </div>

      {/* Top Banner: Medium Classifier & Common-Sense Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Visual Medium Classifier */}
        <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-[#232D3F] space-y-1.5">
          <div className="text-[10px] text-[#8B96A8] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            <span>Visual Medium Classifier</span>
          </div>
          <div className="text-sm font-black text-white flex items-center gap-2">
            <span>{scene.mediumClassification || 'Photorealistic Photograph'}</span>
          </div>
          <p className="text-[10px] text-gray-400">
            {scene.mediumClassification?.includes('Illustration') || scene.mediumClassification?.includes('Artwork')
              ? 'Non-photorealistic artistic medium detected. Physical impossibility is classified as artistic expression rather than synthetic AI artifact.'
              : 'Photorealistic claim mode active. Scene physical/biological laws strictly evaluated.'}
          </p>
        </div>

        {/* Real-World Plausibility Score */}
        <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-[#232D3F] space-y-1.5">
          <div className="text-[10px] text-[#8B96A8] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Real-World Plausibility Score</span>
          </div>
          <div className="text-2xl font-black text-emerald-400">
            {overallPlausibilityScore} / 100
          </div>
          <p className="text-[10px] text-gray-400">
            Measures how naturally the scene geometry, subject behaviors, and environmental setting fit ordinary reality.
          </p>
        </div>

        {/* Semantic Anomaly Score */}
        <div className="bg-[#0B0F19] p-3.5 rounded-xl border border-[#232D3F] space-y-1.5">
          <div className="text-[10px] text-[#8B96A8] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Semantic Anomaly Score</span>
          </div>
          <div className="text-2xl font-black text-purple-400">
            {syntheticIndicatorScore} / 100
          </div>
          <p className="text-[10px] text-gray-400">
            Supporting evidence signal feeding into multi-channel fusion matrix. Never used as standalone proof.
          </p>
        </div>
      </div>

      {/* Distinction Summary Banner */}
      <div
        className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${
          isPhysicalImpossibilityDetected
            ? 'bg-red-950/40 border-red-500/40 text-red-200'
            : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
        }`}
      >
        <div className="flex items-start gap-3">
          {isPhysicalImpossibilityDetected ? (
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold text-white text-xs uppercase tracking-wider mb-0.5">
              Methodological Scene Audit Summary
            </div>
            <p className="text-xs text-gray-200 leading-relaxed">
              {unusualVsImplausibleSummary}
            </p>
          </div>
        </div>
      </div>

      {/* JSON Viewer Modal / Expandable Box */}
      {showJsonView && (
        <div className="bg-[#0B0F19] p-4 rounded-xl border border-blue-500/30 space-y-2 font-mono text-[11px]">
          <div className="flex items-center justify-between border-b border-[#232D3F] pb-2 text-gray-300 font-sans font-bold">
            <span className="flex items-center gap-1.5">
              <Code className="w-4 h-4 text-blue-400" />
              Module 1: Structured Scene Representation Output
            </span>
            <span className="text-[10px] text-[#8B96A8]">Entities & Relationship Graph</span>
          </div>
          <pre className="text-blue-300 overflow-x-auto max-h-80 p-2 bg-[#111827] rounded-lg">
            {JSON.stringify(scene, null, 2)}
          </pre>
        </div>
      )}

      {/* SUB-TAB 1: Human-Like Reasoning Report */}
      {activeSubTab === 'report' && humanLikeReport && (
        <div className="bg-[#0B0F19] p-5 rounded-2xl border border-purple-500/30 space-y-4">
          <div className="flex items-center justify-between border-b border-[#232D3F] pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-400" />
              <h4 className="text-sm font-bold text-white">Semantic Reality Analysis Report</h4>
            </div>
            <span className="px-2.5 py-1 rounded-lg bg-purple-950 text-purple-300 font-bold border border-purple-800 text-[11px]">
              Evidence Strength: {humanLikeReport.semanticEvidenceStrength}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#111827] rounded-xl border border-[#232D3F] space-y-1">
              <span className="font-bold text-gray-400 uppercase text-[10px] block">Scene Summary:</span>
              <p className="text-white font-medium">{humanLikeReport.sceneSummary}</p>
            </div>

            <div className="p-3 bg-[#111827] rounded-xl border border-[#232D3F] space-y-1">
              <span className="font-bold text-gray-400 uppercase text-[10px] block">Objects Detected:</span>
              <p className="text-blue-300 font-medium">{humanLikeReport.objectsDetectedStr}</p>
            </div>

            <div className="p-3 bg-[#111827] rounded-xl border border-[#232D3F] space-y-1">
              <span className="font-bold text-gray-400 uppercase text-[10px] block">Primary Relationships:</span>
              <p className="text-purple-300 font-medium">{humanLikeReport.primaryRelationshipsStr}</p>
            </div>

            <div className="p-3 bg-[#111827] rounded-xl border border-[#232D3F] space-y-1">
              <span className="font-bold text-gray-400 uppercase text-[10px] block">Semantic Anomalies:</span>
              <p className="text-amber-300 font-medium">{humanLikeReport.semanticAnomaliesStr}</p>
            </div>

            <div className="p-3 bg-[#111827] rounded-xl border border-[#232D3F] space-y-1">
              <span className="font-bold text-gray-400 uppercase text-[10px] block">Physical Anomalies:</span>
              <p className="text-gray-200 font-medium">{humanLikeReport.physicalAnomaliesStr}</p>
            </div>

            <div className="p-3 bg-[#111827] rounded-xl border border-[#232D3F] space-y-1">
              <span className="font-bold text-gray-400 uppercase text-[10px] block">Biological Plausibility:</span>
              <p className="text-emerald-300 font-medium">{humanLikeReport.biologicalPlausibilityStr}</p>
            </div>
          </div>

          {/* Narrative Explanation */}
          <div className="p-4 bg-[#111827] rounded-xl border border-purple-500/20 space-y-2">
            <span className="font-bold text-purple-300 text-xs block">World-Model Reasoning Verdict Explanation:</span>
            <p className="text-gray-300 leading-relaxed italic text-xs">
              "{humanLikeReport.explanationParagraph}"
            </p>
            <div className="pt-2 border-t border-[#232D3F] text-[10px] font-bold text-amber-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>METHODOLOGICAL GUARANTEE: {humanLikeReport.disclaimerText}</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 2: Scene Graph Tree & Entity Inspector */}
      {activeSubTab === 'graph' && (
        <div className="space-y-4">
          <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#232D3F] space-y-2">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 border-b border-[#232D3F] pb-2">
              <GitCommit className="w-4 h-4 text-purple-400" />
              <span>Scene Consistency Graph Representation</span>
            </h4>

            {/* Tree ASCII Visualizer */}
            <div className="bg-[#111827] p-3 rounded-lg border border-[#232D3F] font-mono text-[11px] text-purple-300 space-y-1 overflow-x-auto">
              <div className="font-bold text-white">ROOT SCENE OBJECTS ({scene.entities[0]?.label || 'PRIMARY SUBJECT'})</div>
              {scene.relationships.map((rel, idx) => (
                <div key={idx} className="pl-4">
                  ├── <span className="text-blue-400">{rel.predicate}</span> → <span className="text-emerald-300">{rel.object}</span> [{rel.plausibilityStatus}]
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Detected Entities List */}
            <div className="bg-[#0B0F19] p-3 rounded-xl border border-[#232D3F] space-y-2">
              <div className="font-bold text-gray-300 text-[11px] border-b border-[#232D3F] pb-1.5 flex justify-between">
                <span>Extracted Entities ({scene.entities.length})</span>
                <span className="text-[#8B96A8] font-normal">Click to inspect</span>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {scene.entities.map((ent) => (
                  <button
                    key={ent.id}
                    onClick={() => setSelectedEntity(ent)}
                    className={`w-full p-2 rounded-lg border text-left transition flex items-center justify-between ${
                      selectedEntity?.id === ent.id
                        ? 'bg-blue-600/20 border-blue-500 text-white'
                        : 'bg-[#111827] border-[#232D3F] text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div>
                      <span className="font-bold block text-xs">{ent.label}</span>
                      <span className="text-[10px] text-[#8B96A8]">{ent.type}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1E293B] text-blue-300 border border-[#232D3F]">
                      {ent.id}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Entity Attribute Inspector */}
            <div className="bg-[#0B0F19] p-3 rounded-xl border border-[#232D3F] space-y-2">
              <div className="font-bold text-gray-300 text-[11px] border-b border-[#232D3F] pb-1.5">
                Attribute Inspector ({selectedEntity?.label || 'Select Entity'})
              </div>

              {selectedEntity ? (
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-[#232D3F]/60">
                    <span className="text-[#8B96A8]">Entity Type:</span>
                    <span className="font-bold text-white">{selectedEntity.type}</span>
                  </div>
                  {Object.entries(selectedEntity.attributes).map(([attrK, attrV]) => (
                    <div key={attrK} className="flex justify-between py-1 border-b border-[#232D3F]/40">
                      <span className="text-[#8B96A8] capitalize">{attrK.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="text-gray-200 font-mono text-[10px] truncate max-w-[140px]">
                        {String(attrV)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-gray-500 italic py-6 text-center">Select an entity to inspect attributes</div>
              )}
            </div>

            {/* Relationships */}
            <div className="bg-[#0B0F19] p-3 rounded-xl border border-[#232D3F] space-y-2">
              <div className="font-bold text-gray-300 text-[11px] border-b border-[#232D3F] pb-1.5">
                Relationships & Actions
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {scene.relationships.map((rel, idx) => (
                  <div key={idx} className="bg-[#111827] p-2 rounded-lg border border-[#232D3F] space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-bold text-blue-300">
                        {rel.subject} → <span className="text-purple-300">{rel.predicate}</span> → {rel.object}
                      </span>
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          rel.plausibilityStatus === 'Plausible'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : rel.plausibilityStatus === 'Unusual But Real'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-red-950 text-red-400 border border-red-800'
                        }`}
                      >
                        {rel.plausibilityStatus}
                      </span>
                    </div>
                    {rel.description && <p className="text-[10px] text-gray-400">{rel.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 3: Anatomy, Physics & Affordances */}
      {activeSubTab === 'anatomy_physics' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Anatomical Reasoning Panel */}
            <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#232D3F] space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 border-b border-[#232D3F] pb-2">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Anatomical Reasoning (Humans & Animals)</span>
              </h4>

              <div className="space-y-2 text-xs">
                <div className="bg-[#111827] p-2.5 rounded-lg border border-[#232D3F]">
                  <span className="font-bold text-blue-300 block mb-0.5">Hands, Fingers & Extremities:</span>
                  <p className="text-gray-300">{anatomicalAssessment?.humanAnatomy.handsAndFingers}</p>
                </div>
                <div className="bg-[#111827] p-2.5 rounded-lg border border-[#232D3F]">
                  <span className="font-bold text-purple-300 block mb-0.5">Limbs, Joints & Posture:</span>
                  <p className="text-gray-300">{anatomicalAssessment?.humanAnatomy.limbsAndJoints}</p>
                </div>
                <div className="bg-[#111827] p-2.5 rounded-lg border border-[#232D3F]">
                  <span className="font-bold text-emerald-300 block mb-0.5">Facial Symmetry & Pupil Alignment:</span>
                  <p className="text-gray-300">{anatomicalAssessment?.humanAnatomy.facialSymmetryAndFeatures}</p>
                </div>
              </div>
            </div>

            {/* Object Affordance Panel */}
            <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#232D3F] space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 border-b border-[#232D3F] pb-2">
                <Boxes className="w-4 h-4 text-purple-400" />
                <span>Object Affordance Capability Assessment</span>
              </h4>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {affordanceAssessment?.objectsEvaluated.map((aff, i) => (
                  <div key={i} className="bg-[#111827] p-2.5 rounded-lg border border-[#232D3F] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{aff.object}</span>
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          aff.affordanceMatch === 'Normal Affordance'
                            ? 'bg-emerald-950 text-emerald-400'
                            : 'bg-amber-950 text-amber-300'
                        }`}
                      >
                        {aff.affordanceMatch}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400">
                      Normal Capabilities: {aff.normalCapabilities.join(', ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Physics Reasoning Checks Matrix */}
          <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#232D3F] space-y-3">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 border-b border-[#232D3F] pb-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span>Physics Reasoning Matrix (7 Laws)</span>
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-center text-[10px]">
              {Object.entries(physicsAssessment || {}).map(([physK, physV]) => (
                <div key={physK} className="bg-[#111827] p-2.5 rounded-lg border border-[#232D3F] space-y-1">
                  <div className="font-bold text-gray-300 uppercase">{physK}</div>
                  <div
                    className={`font-bold py-0.5 px-1 rounded ${
                      physV.passed ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                    }`}
                  >
                    {physV.passed ? 'PASSED' : 'VIOLATION'}
                  </div>
                  <div className="text-[9px] text-gray-400 truncate">{physV.status}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: Contradictions Panel */}
      {activeSubTab === 'contradictions' && (
        <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#232D3F] space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 border-b border-[#232D3F] pb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Contradiction Detection System ({contradictions.length} findings)</span>
          </h4>

          {contradictions.length === 0 ? (
            <p className="text-emerald-400 italic text-center py-6">
              No internal physical, lighting, or anatomical contradictions detected.
            </p>
          ) : (
            <div className="space-y-2">
              {contradictions.map((c) => (
                <div key={c.id} className="bg-[#111827] p-3 rounded-xl border border-amber-500/30 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      {c.type}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-bold text-[10px]">
                      Severity: {c.severity} | Confidence: {c.confidence}%
                    </span>
                  </div>
                  <p className="text-gray-300">{c.explanation}</p>
                  <span className="text-[10px] text-[#8B96A8] block">Location: {c.location}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 5: Complete Pipeline Flow */}
      {activeSubTab === 'pipeline' && (
        <div className="bg-[#0B0F19] p-4 rounded-xl border border-[#232D3F] space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-2 border-b border-[#232D3F] pb-2">
            <Workflow className="w-4 h-4 text-cyan-400" />
            <span>Complete Forensic & World-Model Analysis Pipeline</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 text-[10px] font-mono">
            {[
              '1. IMAGE UPLOAD',
              '2. FILE VALIDATION',
              '3. HASH + PRESERVATION',
              '4. MEDIUM CLASSIFIER',
              '5. OBJECT DETECTION',
              '6. ACTION DETECTION',
              '7. RELATIONSHIP GRAPH',
              '8. SCENE GRAPH BUILD',
              '9. SEMANTIC REASONING',
              '10. PHYSICAL CONSISTENCY',
              '11. ANATOMICAL CHECK',
              '12. ML AI DETECTOR',
              '13. ELA + FFT + NOISE',
              '14. C2PA / PROVENANCE',
              '15. EVIDENCE FUSION',
            ].map((step, idx) => (
              <div
                key={idx}
                className={`p-2 rounded-lg border font-bold text-center ${
                  step.includes('SEMANTIC') || step.includes('PHYSICAL') || step.includes('RELATIONSHIP')
                    ? 'bg-purple-600/30 border-purple-500 text-purple-200'
                    : 'bg-[#111827] border-[#232D3F] text-gray-300'
                }`}
              >
                {step}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

