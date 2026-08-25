import {
  ForensicCase,
  FusionResult,
  FileInfo,
  GeminiAuditResult,
  SemanticReasoningResult,
  ForensicReportData,
  VerdictLabelType,
  AdminVerdictType,
  AdminReviewStatus,
} from '../types';
import { getCurrentUser } from './auth';
import { logAdminAction } from './auditLogger';

const CASES_STORAGE_KEY = 'finding_ai_forensic_cases';
const CASE_COUNTER_KEY = 'finding_ai_case_counter';

export function getNextCaseId(): string {
  let counter = 5; // Default starts after 4 demo cases
  try {
    const savedCounter = localStorage.getItem(CASE_COUNTER_KEY);
    if (savedCounter) {
      counter = parseInt(savedCounter, 10) + 1;
    }
  } catch {
    // fallback
  }
  localStorage.setItem(CASE_COUNTER_KEY, counter.toString());
  const year = new Date().getFullYear();
  return `FA-${year}-${counter.toString().padStart(6, '0')}`;
}

export function detectEvidenceConflict(fusion: FusionResult): { hasConflict: boolean; details: string } {
  const metadataScore = fusion.channels.find((c) => c.id === 'metadata')?.score ?? 50;
  const digitalForensicsScore = fusion.channels.find((c) => c.id === 'digital_forensics')?.score ?? 50;
  const mlScore = fusion.overallAiProbability;
  const semanticPlausibility = fusion.semanticResult?.overallPlausibilityScore ?? 50;

  // Case 1: Metadata indicates authentic camera / valid EXIF, but ELA/FFT shows high synthetic indicators
  if (metadataScore < 30 && digitalForensicsScore > 75) {
    return {
      hasConflict: true,
      details: 'Metadata indicates authentic camera capture, but Digital Forensics (ELA / 2D FFT) reveals significant high-frequency synthetic artifacts.',
    };
  }

  // Case 2: ML Detector predicts high AI probability, but scene has high real-world physical plausibility
  if (mlScore > 78 && semanticPlausibility > 82 && digitalForensicsScore < 40) {
    return {
      hasConflict: true,
      details: 'ML Detector flagged synthetic textures, but Semantic & Physical Plausibility analysis confirmed flawless real-world physics and anatomy.',
    };
  }

  // Case 3: Significant divergence between visual detection and forensic spectral layers
  if (Math.abs(mlScore - digitalForensicsScore) > 55) {
    return {
      hasConflict: true,
      details: `High divergence (${Math.abs(mlScore - digitalForensicsScore)}% gap) between Visual Neural Detector and Spectral Signal Forensics.`,
    };
  }

  return { hasConflict: false, details: '' };
}

export function getInitialDemoCases(): ForensicCase[] {
  return [
    {
      caseId: 'FA-2026-000001',
      userId: 'usr_001',
      userName: 'Analyst Sarah Chen',
      userRole: 'user',
      uploadTimestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
      filename: 'demo_synthetic_portrait_prompt_v6.png',
      fileHash: '8f7a9d0e21b34c56e8790123456789abcdef0123456789abcdef0123456789ab',
      md5Hash: '4a5b6c7d8e9f0123456789abcdef0123',
      fileSize: '2.4 MB',
      fileSizeBytes: 2516582,
      fileType: 'image/png',
      resolution: '1024 x 1024',
      originalAiVerdict: 'LIKELY AI GENERATED',
      aiProbability: 94,
      aiConfidence: 'High',
      aiConfidenceNumeric: 91,
      evidenceScores: {
        'Metadata Integrity': 85,
        'Digital Forensics (ELA/FFT)': 92,
        'Computer Vision & Anatomy': 96,
        'Geometric Continuity': 88,
        'Semantic Plausibility': 18,
      },
      fusionResult: {
        overallAiProbability: 94,
        overallAuthenticProbability: 6,
        manipulationProbability: 12,
        modelConfidence: 'High',
        modelConfidenceNumeric: 91,
        evidenceQuality: 'High',
        evidenceQualityNumeric: 93,
        verdictLabel: 'LIKELY AI GENERATED',
        generatorAttribution: {
          name: 'Midjourney v6',
          confidence: 92,
          isIdentified: true,
          statement: 'Characteristic photorealistic high-frequency skin smoothing and iris specular duplication consistent with Midjourney v6 diffusion latents.',
        },
        provenance: {
          status: 'Not Available',
          statement: 'No C2PA provenance manifest embedded.',
          editingHistory: [],
        },
        manipulation: {
          manipulationDetected: false,
          manipulationType: 'None Detected',
          manipulationConfidence: 88,
          copyMoveScore: 10,
          splicingScore: 12,
          resamplingScore: 14,
          localizedErrorVariance: 0.12,
          suspiciousRegionsCount: 0,
          findings: ['Uniform generative diffusion noise floor across all quadrants.'],
        },
        robustness: {
          overallStabilityScore: 92,
          jpegCompressionResilience: 89,
          resizeScalingResilience: 94,
          noiseDegradationResilience: 90,
          blurPerturbationResilience: 88,
          cropPerturbationResilience: 96,
          assessment: 'High stability across perturbations.',
        },
        semanticResult: {
          scene: {
            entities: [
              { id: 'e1', type: 'Human', label: 'Female Subject', attributes: { anatomicalIntegrity: 'Duplicated 6th digit on right hand' } },
            ],
            relationships: [],
            actions: [],
            sceneContext: 'Synthetic Reality Failure',
            contextExplanation: 'Anatomical anomaly detected with impossible 6th digit and non-convergent pupil reflections.',
            mediumClassification: 'AI-generated photorealistic image',
          },
          dimensions: [],
          overallPlausibilityScore: 18,
          syntheticIndicatorScore: 82,
          confidence: 90,
          unusualVsImplausibleSummary: 'Biological impossibility identified in hand anatomy and eye geometry.',
          isPhysicalImpossibilityDetected: true,
          contradictions: [
            {
              id: 'c1',
              location: 'Right Hand Region',
              type: 'Polydactyly / Digit Splitting',
              severity: 'Critical',
              confidence: 95,
              explanation: 'Six fully formed digits sharing singular metacarpal structure.',
            },
          ],
          anatomicalAssessment: {
            humanAnatomy: {
              handsAndFingers: 'Anomalous 6th digit rendered with distinct fingernail.',
              limbsAndJoints: 'Nominal placement.',
              facialSymmetryAndFeatures: 'Mismatched corneal reflection highlights.',
              bodyProportions: 'Plausible.',
              connectsAndFunctionsLogically: false,
            },
            animalAnatomy: {
              limbPlacement: 'N/A',
              pawsAndFeet: 'N/A',
              facialFeaturesAndEars: 'N/A',
              furContinuityAndTexture: 'N/A',
              connectsAndFunctionsLogically: true,
            },
          },
          affordanceAssessment: { objectsEvaluated: [] },
          physicsAssessment: {
            gravity: { status: 'Nominal', passed: true },
            shadows: { status: 'Nominal', passed: true },
            reflections: { status: 'Inconsistent pupil highlights', passed: false },
            contact: { status: 'Nominal', passed: true },
            perspective: { status: 'Nominal', passed: true },
            occlusion: { status: 'Nominal', passed: true },
            motion: { status: 'Nominal', passed: true },
          },
          humanLikeReport: {
            sceneSummary: 'Close-up studio portrait of a subject.',
            objectsDetectedStr: 'Human Subject, Studio Lighting',
            primaryRelationshipsStr: 'Subject facing camera',
            semanticAnomaliesStr: 'Severe anatomical duplication on hand digits',
            physicalAnomaliesStr: 'Inconsistent dual-angle corneal reflections',
            biologicalPlausibilityStr: 'Low (18/100) — Biological impossibility',
            realWorldPlausibilityStr: '18/100',
            semanticEvidenceStrength: 'Strong Supporting Evidence',
            explanationParagraph: 'Evidence across multiple channels confirms synthetic origin.',
            disclaimerText: 'Probabilistic indicator — verify with independent evidence.',
          },
          diagnostics: ['High-frequency lattice detected in FFT', 'ELA high localized variance'],
        },
        channels: [
          { id: 'ml_detector', name: 'ML AI Detector (ConvNeXt/ViT)', weight: 0.30, score: 94, confidence: 92, contribution: 'High', diagnostics: [] },
          { id: 'digital_forensics', name: 'Digital Forensics (FFT & ELA)', weight: 0.20, score: 92, confidence: 90, contribution: 'High', diagnostics: [] },
          { id: 'cv_consistency', name: 'Computer Vision & Anatomy', weight: 0.15, score: 96, confidence: 95, contribution: 'High', diagnostics: [] },
          { id: 'semantic_reasoning', name: 'Semantic Reality & Plausibility', weight: 0.20, score: 82, confidence: 90, contribution: 'High', diagnostics: [] },
          { id: 'metadata', name: 'Metadata & File Integrity', weight: 0.15, score: 85, confidence: 88, contribution: 'Medium', diagnostics: [] },
        ],
        reasons: {
          strongEvidence: ['Polydactyly digit artifact (6 fingers)', '2D FFT lattice peak signature'],
          supportingEvidence: ['Error Level Analysis high residual error', 'Non-camera software header fingerprint'],
          weakNeutralEvidence: ['Lighting vector nominal'],
        },
        verdictParagraph: 'Multi-layer forensic fusion confirms synthetic image generation with high confidence.',
        fusionWeights: { ml: 0.30, forensics: 0.20, cv: 0.15, semantic: 0.20, metadata: 0.15 },
        mlResult: {
          aiProbability: 94,
          authenticProbability: 6,
          modelConfidence: 91,
          confidenceRating: 'High',
          architectureName: 'ConvNeXt-Large + ViT Ensemble v2.4',
          patchesAnalyzedCount: 16,
          patches: [],
          syntheticTextureScore: 92,
          patchProbabilityDistribution: [95, 94, 92, 96, 91, 93, 95, 96, 94, 93, 92, 95, 94, 96, 95, 93],
        },
      },
      adminReviewStatus: 'Reviewed',
      adminVerdict: 'AI Correct',
      adminVerifiedLabel: 'LIKELY AI GENERATED',
      adminExplanation: 'Verified Midjourney v6 synthetic portrait. Ground truth confirmed by anatomical polydactyly and 2D FFT lattice peaks.',
      adminId: 'adm_001',
      adminName: 'Chief Examiner Marcus Vance',
      reviewTimestamp: new Date(Date.now() - 86400000 * 1.5).toISOString(),
      evidenceConflict: false,
      isDemoCase: true,
    },
    {
      caseId: 'FA-2026-000002',
      userId: 'usr_001',
      userName: 'Analyst Sarah Chen',
      userRole: 'user',
      uploadTimestamp: new Date(Date.now() - 86400000 * 1.8).toISOString(),
      filename: 'demo_theatrical_stage_photo_eos5d.jpg',
      fileHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      md5Hash: '9e107d9d372bb6826bd81d3542a419d6',
      fileSize: '4.8 MB',
      fileSizeBytes: 5033164,
      fileType: 'image/jpeg',
      resolution: '4000 x 3000',
      originalAiVerdict: 'LIKELY AI GENERATED',
      aiProbability: 78,
      aiConfidence: 'Medium',
      aiConfidenceNumeric: 72,
      evidenceScores: {
        'Metadata Integrity': 15,
        'Digital Forensics (ELA/FFT)': 74,
        'Computer Vision & Anatomy': 65,
        'Geometric Continuity': 55,
        'Semantic Plausibility': 94,
      },
      fusionResult: {
        overallAiProbability: 78,
        overallAuthenticProbability: 22,
        manipulationProbability: 10,
        modelConfidence: 'Medium',
        modelConfidenceNumeric: 72,
        evidenceQuality: 'High',
        evidenceQualityNumeric: 88,
        verdictLabel: 'LIKELY AI GENERATED',
        generatorAttribution: {
          name: 'Unidentified Generative Engine',
          confidence: 65,
          isIdentified: false,
          statement: 'Heuristic indicators flagged high-contrast stage lighting as synthetic texture.',
        },
        provenance: {
          status: 'Not Available',
          statement: 'Standard EXIF present.',
          editingHistory: [],
        },
        manipulation: {
          manipulationDetected: false,
          manipulationType: 'None Detected',
          manipulationConfidence: 85,
          copyMoveScore: 8,
          splicingScore: 10,
          resamplingScore: 12,
          localizedErrorVariance: 0.1,
          suspiciousRegionsCount: 0,
          findings: [],
        },
        robustness: {
          overallStabilityScore: 85,
          jpegCompressionResilience: 84,
          resizeScalingResilience: 86,
          noiseDegradationResilience: 82,
          blurPerturbationResilience: 85,
          cropPerturbationResilience: 88,
          assessment: 'Stable forensic signal.',
        },
        semanticResult: {
          scene: {
            entities: [],
            relationships: [],
            actions: [],
            sceneContext: 'Photorealistic Reality Claim',
            contextExplanation: 'Live theatrical concert performance with colored gel spotlights.',
            mediumClassification: 'Photorealistic Photograph',
          },
          dimensions: [],
          overallPlausibilityScore: 94,
          syntheticIndicatorScore: 15,
          confidence: 88,
          unusualVsImplausibleSummary: 'Unusual theatrical lighting setup is contextually coherent for concert photography.',
          isPhysicalImpossibilityDetected: false,
          contradictions: [],
          anatomicalAssessment: {
            humanAnatomy: {
              handsAndFingers: '5 distinct anatomical digits',
              limbsAndJoints: 'Nominal biomechanics',
              facialSymmetryAndFeatures: 'Natural asymmetric micro-expressions',
              bodyProportions: 'Natural human proportions',
              connectsAndFunctionsLogically: true,
            },
            animalAnatomy: {
              limbPlacement: 'N/A',
              pawsAndFeet: 'N/A',
              facialFeaturesAndEars: 'N/A',
              furContinuityAndTexture: 'N/A',
              connectsAndFunctionsLogically: true,
            },
          },
          affordanceAssessment: { objectsEvaluated: [] },
          physicsAssessment: {
            gravity: { status: 'Nominal', passed: true },
            shadows: { status: 'Multiple spot lights account for multi-directional shadows', passed: true },
            reflections: { status: 'Nominal', passed: true },
            contact: { status: 'Nominal', passed: true },
            perspective: { status: 'Nominal', passed: true },
            occlusion: { status: 'Nominal', passed: true },
            motion: { status: 'Motion blur consistent with shutter speed', passed: true },
          },
          humanLikeReport: {
            sceneSummary: 'Live stage performance.',
            objectsDetectedStr: 'Performer, Microphone, Stage Lights',
            primaryRelationshipsStr: 'Performer holding microphone',
            semanticAnomaliesStr: 'None',
            physicalAnomaliesStr: 'None',
            biologicalPlausibilityStr: 'High (94/100)',
            realWorldPlausibilityStr: '94/100',
            semanticEvidenceStrength: 'Strong Supporting Evidence',
            explanationParagraph: 'Visual lighting represents real concert equipment.',
            disclaimerText: 'Probabilistic indicator.',
          },
          diagnostics: [],
        },
        channels: [
          { id: 'ml_detector', name: 'ML AI Detector', weight: 0.30, score: 78, confidence: 72, contribution: 'High', diagnostics: [] },
          { id: 'digital_forensics', name: 'Digital Forensics', weight: 0.20, score: 74, confidence: 70, contribution: 'High', diagnostics: [] },
          { id: 'cv_consistency', name: 'Computer Vision', weight: 0.15, score: 65, confidence: 68, contribution: 'Medium', diagnostics: [] },
          { id: 'semantic_reasoning', name: 'Semantic Reality', weight: 0.20, score: 15, confidence: 88, contribution: 'High', diagnostics: [] },
          { id: 'metadata', name: 'Metadata', weight: 0.15, score: 15, confidence: 95, contribution: 'High', diagnostics: [] },
        ],
        reasons: {
          strongEvidence: ['Authentic Canon EOS 5D Mark IV EXIF tags with serial numbers'],
          supportingEvidence: ['Natural skin pore structure under zoom'],
          weakNeutralEvidence: ['Theatrical gels caused unusual color chromaticity'],
        },
        verdictParagraph: 'Initial automated model flagged image due to theatrical lighting.',
        fusionWeights: { ml: 0.30, forensics: 0.20, cv: 0.15, semantic: 0.20, metadata: 0.15 },
        mlResult: {
          aiProbability: 78,
          authenticProbability: 22,
          modelConfidence: 72,
          confidenceRating: 'Medium',
          architectureName: 'ConvNeXt-Large + ViT Ensemble v2.4',
          patchesAnalyzedCount: 16,
          patches: [],
          syntheticTextureScore: 75,
          patchProbabilityDistribution: [75, 78, 82, 79, 72, 70, 78, 80, 82, 75, 72, 78, 80, 75, 79, 82],
        },
      },
      adminReviewStatus: 'Reviewed',
      adminVerdict: 'AI Incorrect',
      adminVerifiedLabel: 'LIKELY AUTHENTIC',
      adminExplanation: 'Verified camera-origin photograph from Canon EOS 5D Mark IV with intact sensor PRNU and camera serial tags. Theatrical stage lighting caused model to overestimate synthetic texture indicators.',
      adminId: 'adm_001',
      adminName: 'Chief Examiner Marcus Vance',
      reviewTimestamp: new Date(Date.now() - 86400000 * 1.1).toISOString(),
      evidenceConflict: true,
      evidenceConflictDetails: 'Metadata indicates authentic camera capture, but ML Detector & ELA flagged false high-frequency artifacts due to theatrical colored fog.',
      isDemoCase: true,
    },
    {
      caseId: 'FA-2026-000003',
      userId: 'usr_001',
      userName: 'Analyst Sarah Chen',
      userRole: 'user',
      uploadTimestamp: new Date(Date.now() - 86400000 * 1.2).toISOString(),
      filename: 'demo_social_media_compressed_meme.jpg',
      fileHash: 'c7be2183e29f345a90123456789abcdef0123456789abcdef0123456789abcdef',
      md5Hash: '8e7d6c5b4a3f210987654321fedcba98',
      fileSize: '142 KB',
      fileSizeBytes: 145408,
      fileType: 'image/jpeg',
      resolution: '640 x 480',
      originalAiVerdict: 'INCONCLUSIVE',
      aiProbability: 52,
      aiConfidence: 'Low',
      aiConfidenceNumeric: 48,
      evidenceScores: {
        'Metadata Integrity': 50,
        'Digital Forensics (ELA/FFT)': 62,
        'Computer Vision & Anatomy': 48,
        'Geometric Continuity': 50,
        'Semantic Plausibility': 50,
      },
      fusionResult: {
        overallAiProbability: 52,
        overallAuthenticProbability: 48,
        manipulationProbability: 45,
        modelConfidence: 'Low',
        modelConfidenceNumeric: 48,
        evidenceQuality: 'Low',
        evidenceQualityNumeric: 35,
        verdictLabel: 'INCONCLUSIVE',
        generatorAttribution: {
          name: 'Indeterminate',
          confidence: 40,
          isIdentified: false,
          statement: 'Heavy JPEG compression loss prevents definitive attribution.',
        },
        provenance: { status: 'Not Available', statement: 'Metadata stripped.', editingHistory: [] },
        manipulation: {
          manipulationDetected: true,
          manipulationType: 'Resampling & Warping',
          manipulationConfidence: 62,
          copyMoveScore: 25,
          splicingScore: 30,
          resamplingScore: 70,
          localizedErrorVariance: 0.45,
          suspiciousRegionsCount: 2,
          findings: ['Heavy 8x8 blocking artifacts from multiple JPEG compressions.'],
        },
        robustness: {
          overallStabilityScore: 42,
          jpegCompressionResilience: 38,
          resizeScalingResilience: 45,
          noiseDegradationResilience: 40,
          blurPerturbationResilience: 44,
          cropPerturbationResilience: 43,
          assessment: 'Degraded signal due to low resolution.',
        },
        semanticResult: {
          scene: {
            entities: [],
            relationships: [],
            actions: [],
            sceneContext: 'Photorealistic Reality Claim',
            contextExplanation: 'Low resolution internet capture.',
            mediumClassification: 'Photorealistic Photograph',
          },
          dimensions: [],
          overallPlausibilityScore: 50,
          syntheticIndicatorScore: 50,
          confidence: 45,
          unusualVsImplausibleSummary: 'Signal degraded; insufficient resolution to verify physical micro-structures.',
          isPhysicalImpossibilityDetected: false,
          contradictions: [],
          anatomicalAssessment: {
            humanAnatomy: { handsAndFingers: 'Pixelated', limbsAndJoints: 'Nominal', facialSymmetryAndFeatures: 'Pixelated', bodyProportions: 'Nominal', connectsAndFunctionsLogically: true },
            animalAnatomy: { limbPlacement: 'N/A', pawsAndFeet: 'N/A', facialFeaturesAndEars: 'N/A', furContinuityAndTexture: 'N/A', connectsAndFunctionsLogically: true },
          },
          affordanceAssessment: { objectsEvaluated: [] },
          physicsAssessment: {
            gravity: { status: 'Nominal', passed: true },
            shadows: { status: 'Nominal', passed: true },
            reflections: { status: 'Nominal', passed: true },
            contact: { status: 'Nominal', passed: true },
            perspective: { status: 'Nominal', passed: true },
            occlusion: { status: 'Nominal', passed: true },
            motion: { status: 'Nominal', passed: true },
          },
          humanLikeReport: {
            sceneSummary: 'Degraded image.',
            objectsDetectedStr: 'Indeterminate',
            primaryRelationshipsStr: 'N/A',
            semanticAnomaliesStr: 'N/A',
            physicalAnomaliesStr: 'N/A',
            biologicalPlausibilityStr: 'Indeterminate (50/100)',
            realWorldPlausibilityStr: '50/100',
            semanticEvidenceStrength: 'Weak/Neutral Evidence',
            explanationParagraph: 'Evidence inconclusive due to re-compression artifacts.',
            disclaimerText: 'Probabilistic indicator.',
          },
          diagnostics: ['High quantization error in DCT coefficients'],
        },
        channels: [
          { id: 'ml_detector', name: 'ML AI Detector', weight: 0.30, score: 52, confidence: 48, contribution: 'Low', diagnostics: [] },
          { id: 'digital_forensics', name: 'Digital Forensics', weight: 0.20, score: 62, confidence: 45, contribution: 'Low', diagnostics: [] },
          { id: 'cv_consistency', name: 'Computer Vision', weight: 0.15, score: 48, confidence: 42, contribution: 'Low', diagnostics: [] },
          { id: 'semantic_reasoning', name: 'Semantic Reality', weight: 0.20, score: 50, confidence: 50, contribution: 'Low', diagnostics: [] },
          { id: 'metadata', name: 'Metadata', weight: 0.15, score: 50, confidence: 30, contribution: 'Low', diagnostics: [] },
        ],
        reasons: {
          strongEvidence: [],
          supportingEvidence: ['Heavy JPEG 8x8 blocking grid obscures PRNU sensor noise pattern'],
          weakNeutralEvidence: ['Metadata completely absent (stripped during re-upload)'],
        },
        verdictParagraph: 'Evidence is insufficient to support either generative AI or authentic classification.',
        fusionWeights: { ml: 0.30, forensics: 0.20, cv: 0.15, semantic: 0.20, metadata: 0.15 },
        mlResult: {
          aiProbability: 52,
          authenticProbability: 48,
          modelConfidence: 48,
          confidenceRating: 'Low',
          architectureName: 'ConvNeXt-Large + ViT Ensemble v2.4',
          patchesAnalyzedCount: 16,
          patches: [],
          syntheticTextureScore: 50,
          patchProbabilityDistribution: [52, 50, 55, 48, 54, 51, 53, 50, 49, 52, 55, 50, 52, 53, 51, 50],
        },
      },
      adminReviewStatus: 'Inconclusive',
      adminVerdict: 'Inconclusive',
      adminVerifiedLabel: 'INCONCLUSIVE',
      adminExplanation: 'Multiple generations of aggressive JPEG compression and WhatsApp re-encoding destroyed high-frequency Fourier components and EXIF headers. Definite forensic determination is impossible.',
      adminId: 'adm_001',
      adminName: 'Chief Examiner Marcus Vance',
      reviewTimestamp: new Date(Date.now() - 86400000 * 0.8).toISOString(),
      evidenceConflict: false,
      isDemoCase: true,
    },
    {
      caseId: 'FA-2026-000004',
      userId: 'usr_001',
      userName: 'Analyst Sarah Chen',
      userRole: 'user',
      uploadTimestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
      filename: 'demo_snow_leopard_anomaly_evaluation.jpg',
      fileHash: 'f45a6b7c8d9e0123456789abcdef0123456789abcdef0123456789abcdef0123',
      md5Hash: '1a2b3c4d5e6f7890123456789abcdef0',
      fileSize: '3.1 MB',
      fileSizeBytes: 3250585,
      fileType: 'image/jpeg',
      resolution: '2048 x 1536',
      originalAiVerdict: 'LIKELY AI GENERATED',
      aiProbability: 68,
      aiConfidence: 'Medium',
      aiConfidenceNumeric: 64,
      evidenceScores: {
        'Metadata Integrity': 40,
        'Digital Forensics (ELA/FFT)': 68,
        'Computer Vision & Anatomy': 72,
        'Geometric Continuity': 60,
        'Semantic Plausibility': 45,
      },
      fusionResult: {
        overallAiProbability: 68,
        overallAuthenticProbability: 32,
        manipulationProbability: 18,
        modelConfidence: 'Medium',
        modelConfidenceNumeric: 64,
        evidenceQuality: 'Medium',
        evidenceQualityNumeric: 74,
        verdictLabel: 'LIKELY AI GENERATED',
        generatorAttribution: {
          name: 'Stable Diffusion XL / Flux.1',
          confidence: 62,
          isIdentified: true,
          statement: 'Fur texture repetition patterns match diffusion latent upscalers.',
        },
        provenance: { status: 'Not Available', statement: 'No provenance manifest.', editingHistory: [] },
        manipulation: {
          manipulationDetected: false,
          manipulationType: 'None Detected',
          manipulationConfidence: 78,
          copyMoveScore: 12,
          splicingScore: 15,
          resamplingScore: 20,
          localizedErrorVariance: 0.18,
          suspiciousRegionsCount: 0,
          findings: [],
        },
        robustness: {
          overallStabilityScore: 78,
          jpegCompressionResilience: 76,
          resizeScalingResilience: 80,
          noiseDegradationResilience: 75,
          blurPerturbationResilience: 77,
          cropPerturbationResilience: 82,
          assessment: 'Moderate stability.',
        },
        semanticResult: {
          scene: {
            entities: [{ id: 'e1', type: 'Animal', label: 'Snow Leopard', attributes: { anatomicalIntegrity: 'Unusual paw angle' } }],
            relationships: [],
            actions: [],
            sceneContext: 'Photorealistic Reality Claim',
            contextExplanation: 'Wildlife scene in snowy mountainous terrain.',
            mediumClassification: 'AI-generated photorealistic image',
          },
          dimensions: [],
          overallPlausibilityScore: 45,
          syntheticIndicatorScore: 65,
          confidence: 68,
          unusualVsImplausibleSummary: 'Unusual biomechanical posture on rear hind leg requires expert human examination.',
          isPhysicalImpossibilityDetected: false,
          contradictions: [
            {
              id: 'c1',
              location: 'Rear Right Paw',
              type: 'Biomechanical Angle Strain',
              severity: 'Moderate',
              confidence: 70,
              explanation: 'Joint articulation angle is near extreme physiological threshold.',
            },
          ],
          anatomicalAssessment: {
            humanAnatomy: { handsAndFingers: 'N/A', limbsAndJoints: 'N/A', facialSymmetryAndFeatures: 'N/A', bodyProportions: 'N/A', connectsAndFunctionsLogically: true },
            animalAnatomy: {
              limbPlacement: 'Rear paw rotated 110 degrees outward',
              pawsAndFeet: 'Claw retractability unclear under snow layer',
              facialFeaturesAndEars: 'Pupils aligned with mountain sunlight',
              furContinuityAndTexture: 'Possible synthetic pattern repeating on flank',
              connectsAndFunctionsLogically: false,
            },
          },
          affordanceAssessment: { objectsEvaluated: [] },
          physicsAssessment: {
            gravity: { status: 'Nominal', passed: true },
            shadows: { status: 'Nominal', passed: true },
            reflections: { status: 'Nominal', passed: true },
            contact: { status: 'Paws sink into snow appropriately', passed: true },
            perspective: { status: 'Nominal', passed: true },
            occlusion: { status: 'Nominal', passed: true },
            motion: { status: 'Nominal', passed: true },
          },
          humanLikeReport: {
            sceneSummary: 'Wildlife snow leopard image.',
            objectsDetectedStr: 'Snow Leopard, Snow Ground',
            primaryRelationshipsStr: 'Leopard crouching in snow',
            semanticAnomaliesStr: 'Unusual rear limb joint orientation',
            physicalAnomaliesStr: 'None detected in snow physics',
            biologicalPlausibilityStr: 'Moderate (45/100)',
            realWorldPlausibilityStr: '45/100',
            semanticEvidenceStrength: 'Moderate Supporting Evidence',
            explanationParagraph: 'Conflicting animal anatomy indicators warrant human forensic review.',
            disclaimerText: 'Probabilistic indicator.',
          },
          diagnostics: ['Fur texture repetition metric: 72%'],
        },
        channels: [
          { id: 'ml_detector', name: 'ML AI Detector', weight: 0.30, score: 68, confidence: 64, contribution: 'Medium', diagnostics: [] },
          { id: 'digital_forensics', name: 'Digital Forensics', weight: 0.20, score: 68, confidence: 65, contribution: 'Medium', diagnostics: [] },
          { id: 'cv_consistency', name: 'Computer Vision', weight: 0.15, score: 72, confidence: 70, contribution: 'High', diagnostics: [] },
          { id: 'semantic_reasoning', name: 'Semantic Reality', weight: 0.20, score: 65, confidence: 68, contribution: 'Medium', diagnostics: [] },
          { id: 'metadata', name: 'Metadata', weight: 0.15, score: 40, confidence: 50, contribution: 'Low', diagnostics: [] },
        ],
        reasons: {
          strongEvidence: [],
          supportingEvidence: ['Flank fur exhibits subtle repetitive pattern tiles', 'Rear paw rotation exceeds typical felid anatomy'],
          weakNeutralEvidence: ['Snow surface contact geometry is physically plausible'],
        },
        verdictParagraph: 'Probabilistic indicators suggest synthetic generation, but human review is strongly recommended.',
        fusionWeights: { ml: 0.30, forensics: 0.20, cv: 0.15, semantic: 0.20, metadata: 0.15 },
        mlResult: {
          aiProbability: 68,
          authenticProbability: 32,
          modelConfidence: 64,
          confidenceRating: 'Medium',
          architectureName: 'ConvNeXt-Large + ViT Ensemble v2.4',
          patchesAnalyzedCount: 16,
          patches: [],
          syntheticTextureScore: 66,
          patchProbabilityDistribution: [65, 68, 70, 72, 64, 66, 68, 70, 72, 68, 65, 66, 68, 70, 68, 66],
        },
      },
      adminReviewStatus: 'Pending Review',
      evidenceConflict: false,
      isDemoCase: true,
    },
  ];
}

export function getAllCases(): ForensicCase[] {
  try {
    const raw = localStorage.getItem(CASES_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // fallback
  }
  const initial = getInitialDemoCases();
  localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(initial));
  return initial;
}

export function getUserCases(userId: string): ForensicCase[] {
  const all = getAllCases();
  return all.filter((c) => c.userId === userId);
}

export function getCaseById(caseId: string): ForensicCase | undefined {
  const all = getAllCases();
  return all.find((c) => c.caseId === caseId);
}

export function saveCase(
  fileInfo: FileInfo,
  fusionResult: FusionResult,
  originalImageUrl?: string,
  geminiAudit?: GeminiAuditResult | null,
  finalReport?: ForensicReportData
): ForensicCase {
  const user = getCurrentUser();
  const cases = getAllCases();
  const caseId = getNextCaseId();

  const conflictCheck = detectEvidenceConflict(fusionResult);

  const newCase: ForensicCase = {
    caseId,
    userId: user.id,
    userName: user.name,
    userRole: user.role,
    uploadTimestamp: new Date().toISOString(),
    filename: fileInfo.filename,
    fileHash: fileInfo.sha256,
    md5Hash: fileInfo.md5,
    fileSize: fileInfo.filesizeReadable,
    fileSizeBytes: fileInfo.filesizeBytes,
    fileType: fileInfo.format,
    resolution: fileInfo.resolution,
    originalAiVerdict: fusionResult.verdictLabel,
    aiProbability: fusionResult.overallAiProbability,
    aiConfidence: fusionResult.modelConfidence,
    aiConfidenceNumeric: fusionResult.modelConfidenceNumeric,
    evidenceScores: {
      'Metadata Integrity': fusionResult.channels.find((c) => c.id === 'metadata')?.score ?? 0,
      'Digital Forensics (ELA/FFT)': fusionResult.channels.find((c) => c.id === 'digital_forensics')?.score ?? 0,
      'Computer Vision & Anatomy': fusionResult.channels.find((c) => c.id === 'cv_consistency')?.score ?? 0,
      'Geometric Continuity': fusionResult.channels.find((c) => c.id === 'digital_forensics')?.score ?? 0,
      'Semantic Plausibility': fusionResult.semanticResult?.overallPlausibilityScore ?? 0,
    },
    fusionResult,
    geminiFindings: geminiAudit || undefined,
    semanticResult: fusionResult.semanticResult,
    finalReport,
    originalImageUrl,
    adminReviewStatus: 'Pending Review',
    evidenceConflict: conflictCheck.hasConflict,
    evidenceConflictDetails: conflictCheck.details,
    isDemoCase: false,
  };

  cases.unshift(newCase);
  localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(cases));

  return newCase;
}

export function reviewCase(
  caseId: string,
  review: {
    adminVerdict: AdminVerdictType;
    adminVerifiedLabel: VerdictLabelType;
    adminExplanation: string;
  }
): ForensicCase | null {
  const cases = getAllCases();
  const index = cases.findIndex((c) => c.caseId === caseId);
  if (index === -1) return null;

  const currentAdmin = getCurrentUser();
  const updatedCase: ForensicCase = {
    ...cases[index],
    adminReviewStatus: review.adminVerdict === 'Inconclusive' ? 'Inconclusive' : 'Reviewed',
    adminVerdict: review.adminVerdict,
    adminVerifiedLabel: review.adminVerifiedLabel,
    adminExplanation: review.adminExplanation,
    adminId: currentAdmin.id,
    adminName: currentAdmin.name,
    reviewTimestamp: new Date().toISOString(),
  };

  cases[index] = updatedCase;
  localStorage.setItem(CASES_STORAGE_KEY, JSON.stringify(cases));

  // Log admin action
  logAdminAction({
    adminId: currentAdmin.id,
    adminName: currentAdmin.name,
    action: review.adminVerdict === 'AI Incorrect' ? 'VERDICT_CORRECTED' : 'CASE_REVIEWED',
    caseId,
    description: `Admin marked case as ${review.adminVerdict} (Ground Truth: ${review.adminVerifiedLabel}). Reason: ${review.adminExplanation}`,
    severity: review.adminVerdict === 'AI Incorrect' ? 'WARNING' : 'INFO',
  });

  return updatedCase;
}
