import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  // API Routes
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", app: "Finding AI", timestamp: new Date().toISOString() });
  });

  // Optional Gemini Vision Forensic Audit
  app.post("/api/gemini-analysis", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is not configured on the server. You can still use the local evidence fusion engine."
        });
      }

      const { imageBase64, mimeType = "image/jpeg", filename = "image.jpg" } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 data" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const prompt = `You are a senior digital image forensics expert inspecting an image named "${filename}".
Analyze this image for signatures of AI generation (e.g. Midjourney, DALL-E, Stable Diffusion, Flux, Firefly) vs authentic camera photograph.

Provide a structured JSON response with this exact schema:
{
  "aiProbability": number (0-100),
  "confidence": number (0-100),
  "verdict": "LIKELY AI GENERATED" | "INCONCLUSIVE — REQUIRES FURTHER INVESTIGATION" | "LIKELY AUTHENTIC",
  "detectedGenerator": string (e.g. "Midjourney v6", "DALL·E 3", "Stable Diffusion / Flux", "Camera Capture", "Unidentified Generative Model"),
  "structuredFindings": [
    {
      "finding": "Short summary of finding",
      "location": "Location in image (e.g., Facial Anatomy, Background, Hands, Reflections, Text)",
      "severity": "Critical" | "Moderate" | "Minor",
      "explanation": "Detailed forensic explanation",
      "aiRelevance": "High" | "Medium" | "Low",
      "confidence": number (0-100)
    }
  ],
  "forensicObservations": [
    "Observation string 1",
    "Observation string 2",
    "Observation string 3"
  ],
  "expertSummary": "Comprehensive forensic evaluation paragraph."
}

Return ONLY valid JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: mimeType,
                },
              },
              { text: prompt },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.error("Gemini Forensic Audit Error:", err);
      res.status(500).json({
        error: "Failed to perform Gemini vision audit.",
        details: err.message,
      });
    }
  });

  // Multimodal Gemini Vision Common-Sense Scene Understanding & Semantic Plausibility Endpoint
  app.post("/api/semantic-reasoning", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is not configured on the server. Using local rule-free semantic reasoning engine."
        });
      }

      const { imageBase64, mimeType = "image/jpeg" } = req.body;
      if (!imageBase64) {
        return res.status(400).json({ error: "Missing imageBase64 data" });
      }

      const ai = new GoogleGenAI({ apiKey });
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const prompt = `You are a Senior AI Systems Architect specializing in multimodal vision-language reasoning, scene understanding, and common-sense physical/biological plausibility analysis for image forensics.

Analyze the provided image and construct a rich structured Scene Graph and Physical Plausibility Assessment.

CRITICAL INSTRUCTIONS:
- Do NOT use simple keyword rules (e.g. bear + paintbrush = AI).
- Distinguish "unusual real-world event / surreal art / costume" from "physically / biologically impossible AI artifact".
- Semantic implausibility is SUPPORTING EVIDENCE ONLY.

Return a JSON object with this exact structure:
{
  "scene": {
    "entities": [
      {
        "id": "e1",
        "type": "Human" | "Animal" | "Vehicle" | "Tool" | "Furniture" | "Food" | "Building" | "Clothing" | "Plant" | "Electronic device" | "Environment" | "Anatomical Part" | "Background Object",
        "label": "Short label (e.g. Subject, Hand, Brush, Table)",
        "attributes": {
          "size": "string description",
          "shape": "string description",
          "color": "string description",
          "material": "string description",
          "clothingType": "string description",
          "position": "string description",
          "orientation": "string description",
          "texture": "string description",
          "symmetryScore": number (0-100),
          "anatomicalIntegrity": "string description"
        }
      }
    ],
    "relationships": [
      {
        "subject": "e1",
        "predicate": "holding" | "wearing" | "resting_on" | "standing_on" | "traveling_on" | "attached_to" | "inside" | "interacting_with" | "floating_above" | "merged_with" | "shading" | "reflecting",
        "object": "e2",
        "plausibilityStatus": "Plausible" | "Unusual But Real" | "Physically Implausible" | "Biologically Implausible",
        "description": "Short description"
      }
    ],
    "actions": [
      {
        "actor": "e1",
        "action": "Walking" | "Holding" | "Painting" | "Flying" | "Eating" | "Driving" | "Writing" | "Swimming" | "Sitting" | "Jumping",
        "target": "e2",
        "biomechanicalFeasibility": "Feasible" | "Awkward" | "Physically Impossible"
      }
    ],
    "sceneContext": "Photorealistic Reality Claim" | "Artistic / Surreal Illustration" | "Staged / Costume / Performance" | "Synthetic Reality Failure",
    "contextExplanation": "Explanation paragraph"
  },
  "dimensions": [
    {
      "id": "spatial_gravity",
      "name": "Spatial & Gravitational Physics",
      "score": number (0-100, 100=plausible),
      "status": "Nominal Plausibility" | "Unusual / Contextual Intent" | "Physical Violation" | "Biological Impossibility",
      "violations": [
        {
          "issue": "Short issue name",
          "location": "Image region",
          "severity": "Critical" | "Moderate" | "Minor",
          "explanation": "Detailed explanation",
          "isPhysicalImpossibility": boolean
        }
      ]
    },
    {
      "id": "biological_anatomy",
      "name": "Biological & Anatomical Plausibility",
      "score": number (0-100),
      "status": "Nominal Plausibility" | "Unusual / Contextual Intent" | "Physical Violation" | "Biological Impossibility",
      "violations": []
    },
    {
      "id": "material_physics",
      "name": "Material & Structural Physics",
      "score": number (0-100),
      "status": "Nominal Plausibility" | "Unusual / Contextual Intent" | "Physical Violation" | "Biological Impossibility",
      "violations": []
    },
    {
      "id": "lighting_photometric",
      "name": "Lighting & Photometric Physics",
      "score": number (0-100),
      "status": "Nominal Plausibility" | "Unusual / Contextual Intent" | "Physical Violation" | "Biological Impossibility",
      "violations": []
    },
    {
      "id": "contextual_coherence",
      "name": "Contextual Intent & Common Sense",
      "score": number (0-100),
      "status": "Nominal Plausibility" | "Unusual / Contextual Intent" | "Physical Violation" | "Biological Impossibility",
      "violations": []
    }
  ],
  "overallPlausibilityScore": number (0-100),
  "syntheticIndicatorScore": number (0-100),
  "confidence": number (0-100),
  "unusualVsImplausibleSummary": "Detailed summary distinguishing unusual real-world event from true physical/biological impossibility",
  "isPhysicalImpossibilityDetected": boolean,
  "diagnostics": ["Diagnostic string 1", "Diagnostic string 2", "Diagnostic string 3"]
}

Return ONLY valid JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  data: cleanBase64,
                  mimeType: mimeType,
                },
              },
              { text: prompt },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.error("Gemini Semantic Reasoning Error:", err);
      res.status(500).json({
        error: "Failed to perform Gemini semantic vision reasoning.",
        details: err.message,
      });
    }
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Finding AI] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server startup error:", err);
  process.exit(1);
});
