# FindingAI 🔎
### AI-Assisted Digital Image Forensics & Authenticity Analysis

FindingAI is a digital image-forensics platform designed to analyze whether an image shows characteristics associated with **AI generation, manipulation, or authentic camera capture**.

Instead of relying on a single AI classifier, FindingAI combines multiple forensic and analytical techniques to examine an image from different perspectives and produces an **evidence-based forensic report**.

>  **Important:** FindingAI provides probabilistic forensic indicators, not absolute proof of whether an image is authentic or AI-generated. Results should be treated as supporting evidence and, where necessary, reviewed by a qualified human examiner.

---

## What Problem Does FindingAI Solve?

AI-generated and manipulated images are becoming increasingly difficult to distinguish from genuine photographs.

Traditional visual inspection may not always reveal subtle signs of:

- AI generation
- Image manipulation
- Synthetic textures
- Unusual compression patterns
- Metadata inconsistencies
- Pixel-level anomalies

FindingAI attempts to address this problem by combining **digital forensics, computer vision, metadata analysis, frequency analysis, and multimodal AI reasoning** into a single investigation workflow.


<img width="1900" height="838" alt="Image" src="https://github.com/user-attachments/assets/d751bcf7-ea99-4879-91ea-597a65902a9d" />

<img width="1593" height="813" alt="Image" src="https://github.com/user-attachments/assets/0fb88b25-db56-4aab-9a27-a200e0772465" />

<img width="1918" height="842" alt="Image" src="https://github.com/user-attachments/assets/81e5339e-7cb8-468c-9bd7-cedd9e453c53" />
---

# 🧠 How FindingAI Works


```text

                    IMAGE UPLOAD
                         │
                         ▼
              ┌─────────────────────┐
              │ Evidence Collection │
              └──────────┬──────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
   Metadata            ELA             File Hash
   Analysis          Analysis        & Integrity
        │                │                │
        └────────────────┼────────────────┘
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
       Edge Analysis            FFT Analysis
          (Sobel)              Frequency Domain
             │                       │
             └───────────┬───────────┘
                         ▼
               Semantic Analysis
             & Physical Plausibility
                         │
                         ▼
                Gemini Vision Audit
                         │
                         ▼
                Evidence Fusion
                         │
                         ▼
              FORENSIC ASSESSMENT
                         │
                         ▼
                 FORENSIC REPORT




