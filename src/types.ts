export interface FileInfo {
  filename: string;
  filesizeBytes: number;
  filesizeReadable: string;
  resolution: string;
  width: number;
  height: number;
  format: string;
  mode: string;
  sha256: string;
  md5: string;
  ingestedAt: string;
}

export interface PatchFinding {
  id: string;
  row: number;
  col: number;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  heightPercent: number;
  regionName: string;
  aiProbability: number;
  confidence: number;
  anomalyFeatures: string[];
}

export interface MLDetectorResult {
  aiProbability: number; // 0-100
  authenticProbability: number; // 0-100
  modelConfidence: number; // 0-100
  confidenceRating: "High" | "Medium" | "Low";
  architectureName: string;
  patchesAnalyzedCount: number;
  patches: PatchFinding[];
  syntheticTextureScore: number;
  patchProbabilityDistribution: number[];
}

export interface SceneEntity {
  id: string;
  type: "Human" | "Animal" | "Vehicle" | "Tool" | "Furniture" | "Food" | "Building" | "Clothing" | "Plant" | "Electronic device" | "Environment" | "Anatomical Part" | "Background Object";
  label: string;
  attributes: {
    size?: string;
    shape?: string;
    color?: string;
    material?: string;
    clothingType?: string;
    position?: string;
    orientation?: string;
    texture?: string;
    symmetryScore?: number;
    anatomicalIntegrity?: string;
    [key: string]: any;
  };
}

export interface SceneRelationship {
  subject: string; // entity id
  predicate: "holding" | "wearing" | "resting_on" | "standing_on" | "traveling_on" | "attached_to" | "inside" | "interacting_with" | "floating_above" | "merged_with" | "shading" | "reflecting" | string;
  object: string; // entity id
  plausibilityStatus: "Plausible" | "Unusual But Real" | "Physically Implausible" | "Biologically Implausible";
  description?: string;
}

export interface SceneAction {
  actor: string; // entity id
  action: "Walking" | "Holding" | "Painting" | "Flying" | "Eating" | "Driving" | "Writing" | "Swimming" | "Sitting" | "Jumping" | string;
  target?: string; // entity id
  biomechanicalFeasibility: "Feasible" | "Awkward" | "Physically Impossible";
}

export interface SceneRepresentation {
  entities: SceneEntity[];
  relationships: SceneRelationship[];
  actions: SceneAction[];
  sceneContext: "Photorealistic Reality Claim" | "Artistic / Surreal Illustration" | "Staged / Costume / Performance" | "Synthetic Reality Failure";
  contextExplanation: string;
  mediumClassification:
    | "Photorealistic Photograph"
    | "AI-generated photorealistic image"
    | "Digital Artwork"
    | "Illustration"
    | "Cartoon"
    | "3D Render"
    | "Advertisement"
    | "Screenshot"
    | "Composite/manipulated image";
}

export interface ContradictionFinding {
  id: string;
  location: string;
  type: string;
  severity: "Critical" | "Moderate" | "Minor";
  confidence: number;
  explanation: string;
}

export interface AnatomicalAssessment {
  humanAnatomy: {
    handsAndFingers: string;
    limbsAndJoints: string;
    facialSymmetryAndFeatures: string;
    bodyProportions: string;
    connectsAndFunctionsLogically: boolean;
  };
  animalAnatomy: {
    limbPlacement: string;
    pawsAndFeet: string;
    facialFeaturesAndEars: string;
    furContinuityAndTexture: string;
    connectsAndFunctionsLogically: boolean;
  };
}

export interface ObjectAffordanceAssessment {
  objectsEvaluated: {
    object: string;
    normalCapabilities: string[];
    observedAction: string;
    affordanceMatch: "Normal Affordance" | "Unusual Requirement" | "Physically Impossible";
  }[];
}

export interface PhysicsReasoningAssessment {
  gravity: { status: string; passed: boolean };
  shadows: { status: string; passed: boolean };
  reflections: { status: string; passed: boolean };
  contact: { status: string; passed: boolean };
  perspective: { status: string; passed: boolean };
  occlusion: { status: string; passed: boolean };
  motion: { status: string; passed: boolean };
}

export interface HumanLikeReport {
  sceneSummary: string;
  objectsDetectedStr: string;
  primaryRelationshipsStr: string;
  semanticAnomaliesStr: string;
  physicalAnomaliesStr: string;
  biologicalPlausibilityStr: string;
  realWorldPlausibilityStr: string;
  semanticEvidenceStrength: "Strong Supporting Evidence" | "Moderate Supporting Evidence" | "Weak/Neutral Evidence";
  explanationParagraph: string;
  disclaimerText: string;
}

export interface PlausibilityViolation {
  issue: string;
  location: string;
  severity: "Critical" | "Moderate" | "Minor";
  explanation: string;
  isPhysicalImpossibility: boolean; // True = physically/biologically impossible, False = unusual real-world event
}

export interface PlausibilityDimension {
  id: "spatial_gravity" | "biological_anatomy" | "material_physics" | "lighting_photometric" | "contextual_coherence";
  name: string;
  score: number; // 0-100 (100 = plausible, 0 = severe impossibility)
  status: "Nominal Plausibility" | "Unusual / Contextual Intent" | "Physical Violation" | "Biological Impossibility";
  violations: PlausibilityViolation[];
}

export interface SemanticReasoningResult {
  scene: SceneRepresentation;
  dimensions: PlausibilityDimension[];
  overallPlausibilityScore: number; // 0-100 (real-world plausibility score, e.g. 14/100)
  syntheticIndicatorScore: number; // 0-100 (semantic anomaly score, e.g. 86/100)
  confidence: number; // 0-100
  unusualVsImplausibleSummary: string;
  isPhysicalImpossibilityDetected: boolean;
  contradictions: ContradictionFinding[];
  anatomicalAssessment: AnatomicalAssessment;
  affordanceAssessment: ObjectAffordanceAssessment;
  physicsAssessment: PhysicsReasoningAssessment;
  humanLikeReport: HumanLikeReport;
  diagnostics: string[];
}

export interface EvidenceChannel {
  id: "ml_detector" | "digital_forensics" | "metadata" | "cv_consistency" | "semantic_reasoning";
  name: string;
  weight: number; // e.g. 0.35, 0.20, 0.15, 0.15, 0.15
  score: number; // 0-100
  confidence: number; // 0-100
  contribution: "High" | "Medium" | "Low";
  diagnostics: string[];
}

export interface EvidenceCategorizedReasons {
  strongEvidence: string[];
  supportingEvidence: string[];
  weakNeutralEvidence: string[];
}

export interface GeneratorAttribution {
  name: string;
  confidence: number; // 0-100
  isIdentified: boolean;
  statement: string;
}

export interface C2PAProvenanceResult {
  status: "Verified" | "Invalid" | "Not Available";
  issuer?: string;
  claimGenerator?: string;
  digitalSignatureValid?: boolean;
  editingHistory: string[];
  certificateDetails?: string;
  statement: string;
}

export interface ManipulationAnalysisResult {
  manipulationDetected: boolean;
  manipulationType: "Copy-Move Splicing" | "Localized Content Modification" | "Color / Lighting Retouch" | "Resampling & Warping" | "None Detected";
  manipulationConfidence: number;
  copyMoveScore: number;
  splicingScore: number;
  resamplingScore: number;
  localizedErrorVariance: number;
  suspiciousRegionsCount: number;
  findings: string[];
}

export interface RobustnessTestingResult {
  overallStabilityScore: number; // 0-100
  jpegCompressionResilience: number; // 0-100
  resizeScalingResilience: number; // 0-100
  noiseDegradationResilience: number; // 0-100
  blurPerturbationResilience: number; // 0-100
  cropPerturbationResilience: number; // 0-100
  assessment: string;
}

export type VerdictLabelType =
  | "LIKELY AI GENERATED"
  | "LIKELY AUTHENTIC"
  | "MANIPULATED PHOTOGRAPH"
  | "AI + MANIPULATION DETECTED"
  | "INCONCLUSIVE";

export interface FusionResult {
  overallAiProbability: number; // 0-100
  overallAuthenticProbability: number; // 0-100
  manipulationProbability: number; // 0-100
  modelConfidence: "High" | "Medium" | "Low";
  modelConfidenceNumeric: number;
  evidenceQuality: "High" | "Medium" | "Low";
  evidenceQualityNumeric: number;
  verdictLabel: VerdictLabelType;
  generatorAttribution: GeneratorAttribution;
  provenance: C2PAProvenanceResult;
  manipulation: ManipulationAnalysisResult;
  robustness: RobustnessTestingResult;
  semanticResult: SemanticReasoningResult;
  channels: EvidenceChannel[];
  reasons: EvidenceCategorizedReasons;
  verdictParagraph: string;
  fusionWeights: Record<string, number>;
  mlResult: MLDetectorResult;
}

export interface ChainOfCustodyStep {
  id: string;
  label: string;
  timestamp?: string;
  done: boolean;
  statusText?: string;
}

export interface FeedbackRecord {
  id: string;
  timestamp: string;
  filename: string;
  sha256: string;
  predictedLabel: string;
  predictedAiProbability: number;
  correctedLabel: "LIKELY AI GENERATED" | "LIKELY AUTHENTIC" | "MANIPULATED PHOTOGRAPH" | "AI + MANIPULATION DETECTED" | "INCONCLUSIVE";
  userNotes: string;
  systemConfidence: number;
  layerSnapshot: string;
  modelVersion: string;
}

export type CanvasTab =
  | "original"
  | "edge"
  | "fft"
  | "ela"
  | "heatmap"
  | "noise"
  | "patches"
  | "provenance"
  | "manipulation"
  | "robustness"
  | "metadata"
  | "semantic"
  | "explanation";

export interface GeminiStructuredFinding {
  finding: string;
  location: string;
  severity: "Critical" | "Moderate" | "Minor";
  explanation: string;
  aiRelevance: "High" | "Medium" | "Low";
  confidence: number;
}

export interface GeminiAuditResult {
  aiProbability: number;
  confidence: number;
  verdict: VerdictLabelType;
  detectedGenerator: string;
  structuredFindings: GeminiStructuredFinding[];
  forensicObservations: string[];
  expertSummary: string;
}

export interface EXIFSummary {
  [key: string]: string | number;
}

export interface MonitoringMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
  datasetScale: number;
  totalCorrectionsLogged: number;
  accuracyHistory: { step: string; accuracy: number; f1: number }[];
  confusionMatrix: {
    trueAi: number;
    falseAi: number;
    trueAuthentic: number;
    falseAuthentic: number;
  };
  generatorPerformance: { generator: string; accuracy: number; samples: number }[];
  categoryPerformance: { category: string; accuracy: number; samples: number }[];
}

export type UserRole = 'user' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  badgeNumber?: string;
  organization?: string;
  avatar?: string;
}

export type AdminReviewStatus = 'Pending Review' | 'Reviewed' | 'Inconclusive';
export type AdminVerdictType = 'AI Correct' | 'AI Incorrect' | 'Inconclusive';

export interface ForensicCase {
  caseId: string; // e.g. "FA-2026-000001"
  userId: string;
  userName: string;
  userRole: UserRole;
  uploadTimestamp: string;
  filename: string;
  fileHash: string; // SHA-256
  md5Hash: string;
  fileSize: string;
  fileSizeBytes: number;
  fileType: string;
  resolution: string;
  originalAiVerdict: VerdictLabelType;
  aiProbability: number;
  aiConfidence: "High" | "Medium" | "Low";
  aiConfidenceNumeric: number;
  evidenceScores: Record<string, number>;
  fusionResult: FusionResult;
  geminiFindings?: GeminiAuditResult | null;
  semanticResult?: SemanticReasoningResult;
  finalReport?: ForensicReportData;
  originalImageUrl?: string;
  adminReviewStatus: AdminReviewStatus;
  adminVerdict?: AdminVerdictType;
  adminVerifiedLabel?: VerdictLabelType;
  adminExplanation?: string;
  adminId?: string;
  adminName?: string;
  reviewTimestamp?: string;
  evidenceConflict: boolean;
  evidenceConflictDetails?: string;
  isDemoCase?: boolean;
}

export interface AdminAuditRecord {
  id: string;
  adminId: string;
  adminName: string;
  action:
    | 'ADMIN_LOGIN'
    | 'USER_LOGIN'
    | 'CASE_REVIEWED'
    | 'VERDICT_CORRECTED'
    | 'FEEDBACK_ADDED'
    | 'DATASET_EXPORTED'
    | 'REPORT_GENERATED'
    | 'DEMO_DATA_LOADED'
    | 'SECURITY_CHECK'
    | 'THRESHOLD_ADJUSTED'
    | 'ROLE_SWITCHED';
  caseId?: string;
  timestamp: string;
  description: string;
  ipAddress?: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface VerifiedDatasetRecord {
  case_id: string;
  image_hash: string;
  ai_verdict: string;
  ai_probability: number;
  ai_confidence: string;
  admin_verdict: string;
  correction_reason: string;
  reviewed_by: string;
  review_timestamp: string;
  is_demo?: boolean;
}

export interface ForensicReportData {
  caseId: string;
  generatedAt: string;
  fileInfo: FileInfo;
  fusionResult: FusionResult;
  geminiAudit?: GeminiAuditResult | null;
  exifSummary: EXIFSummary;
  analystNotes?: string;
  humanVerificationStatus: 'NOT REVIEWED' | 'VERIFIED';
  adminVerdict?: AdminVerdictType;
  adminVerifiedLabel?: VerdictLabelType;
  adminExplanation?: string;
  adminId?: string;
  adminReviewTimestamp?: string;
  evidenceConflict?: boolean;
  evidenceConflictDetails?: string;
}

