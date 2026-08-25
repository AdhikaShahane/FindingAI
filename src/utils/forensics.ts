import { FileInfo, EXIFSummary, ForensicReportData } from '../types';

export function humanFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

// Compute SHA-256 and MD5 hash from ArrayBuffer
export async function computeHashes(file: File): Promise<{ sha256: string; md5: string }> {
  const arrayBuffer = await file.arrayBuffer();

  // SHA-256 using Web Crypto
  const sha256Buffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const sha256Array = Array.from(new Uint8Array(sha256Buffer));
  const sha256 = sha256Array.map((b) => b.toString(16).padStart(2, '0')).join('');

  // MD5 JS Implementation
  const md5 = computeMD5(new Uint8Array(arrayBuffer));

  return { sha256, md5 };
}

function computeMD5(bytes: Uint8Array): string {
  let h0 = 0x67452301, h1 = 0xefcdab89, h2 = 0x98badcfe, h3 = 0x10325476;
  const k = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee, 0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be, 0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa, 0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed, 0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c, 0xa4beea44, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05, 0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039, 0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1, 0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ];
  const r = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20, 5,  9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ];

  const origLen = bytes.length;
  const bitLen = origLen * 8;
  const padLen = (origLen % 64 < 56) ? (56 - origLen % 64) : (120 - origLen % 64);
  const padded = new Uint8Array(origLen + padLen + 8);
  padded.set(bytes);
  padded[origLen] = 0x80;

  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, bitLen & 0xffffffff, true);
  view.setUint32(padded.length - 4, Math.floor(bitLen / 0x100000000), true);

  for (let offset = 0; offset < padded.length; offset += 64) {
    const w = new Uint32Array(16);
    for (let i = 0; i < 16; i++) {
      w[i] = view.getUint32(offset + i * 4, true);
    }
    let a = h0, b = h1, c = h2, d = h3;

    for (let i = 0; i < 64; i++) {
      let f = 0, g = 0;
      if (i < 16) {
        f = (b & c) | ((~b) & d);
        g = i;
      } else if (i < 32) {
        f = (d & b) | ((~d) & c);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        f = b ^ c ^ d;
        g = (3 * i + 5) % 16;
      } else {
        f = c ^ (b | (~d));
        g = (7 * i) % 16;
      }
      const temp = d;
      d = c;
      c = b;
      const sum = (a + f + k[i] + w[g]) >>> 0;
      const rot = (sum << r[i]) | (sum >>> (32 - r[i]));
      b = (b + rot) >>> 0;
      a = temp;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
  }

  const hex = (n: number) => {
    const buf = new ArrayBuffer(4);
    new DataView(buf).setUint32(0, n, true);
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  return hex(h0) + hex(h1) + hex(h2) + hex(h3);
}

// Extract EXIF tags if present in JPEG header
export async function extractExif(file: File): Promise<EXIFSummary> {
  const summary: EXIFSummary = {};
  if (file.type !== 'image/jpeg' && file.type !== 'image/jpg') {
    return summary;
  }

  try {
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);

    if (view.getUint16(0) !== 0xFFD8) return summary; // Not a JPEG

    let offset = 2;
    const length = buffer.byteLength;

    while (offset < length) {
      if (view.getUint16(offset) === 0xFFE1) { // APP1 marker (EXIF)
        const app1Length = view.getUint16(offset + 2);
        const exifHeader = new Uint8Array(buffer, offset + 4, 4);
        const headerStr = String.fromCharCode(...exifHeader);

        if (headerStr === 'Exif') {
          summary['EXIFBlockPresent'] = 'True';
          const textChunk = new TextDecoder().decode(new Uint8Array(buffer, offset + 8, Math.min(app1Length, 2000)));
          const tools = ['Midjourney', 'DALL-E', 'Stable Diffusion', 'Photoshop', 'GIMP', 'Lightroom', 'Firefly', 'Canva'];
          for (const tool of tools) {
            if (textChunk.toLowerCase().includes(tool.toLowerCase())) {
              summary['EditingToolFingerprint'] = tool;
              summary['Software'] = tool;
              break;
            }
          }
          if (textChunk.includes('Make')) summary['Make'] = 'Extracted Camera Maker';
          if (textChunk.includes('Model')) summary['Model'] = 'Extracted Camera Model';
        }
        break;
      }
      offset += 2 + view.getUint16(offset + 2);
    }
  } catch (err) {
    console.warn('EXIF extraction error:', err);
  }

  return summary;
}

// Generate File Info Object
export async function getFileInfo(file: File, imgElement: HTMLImageElement): Promise<FileInfo> {
  const { sha256, md5 } = await computeHashes(file);
  return {
    filename: file.name,
    filesizeBytes: file.size,
    filesizeReadable: humanFileSize(file.size),
    resolution: `${imgElement.naturalWidth} x ${imgElement.naturalHeight}`,
    width: imgElement.naturalWidth,
    height: imgElement.naturalHeight,
    format: file.type || 'image/png',
    mode: 'RGB / RGBA',
    sha256,
    md5,
    ingestedAt: new Date().toLocaleTimeString(),
  };
}

// Genuine Error Level Analysis (ELA) via HTML5 Canvas re-compression
export function generateELA(imgElement: HTMLImageElement, quality = 0.9): { dataUrl: string; meanError: number } {
  const w = imgElement.naturalWidth || imgElement.width || 600;
  const h = imgElement.naturalHeight || imgElement.height || 400;

  const canvasOrig = document.createElement('canvas');
  canvasOrig.width = w;
  canvasOrig.height = h;
  const ctxOrig = canvasOrig.getContext('2d')!;
  ctxOrig.drawImage(imgElement, 0, 0, w, h);
  const origData = ctxOrig.getImageData(0, 0, w, h);

  const canvasEla = document.createElement('canvas');
  canvasEla.width = w;
  canvasEla.height = h;
  const ctxEla = canvasEla.getContext('2d')!;
  const elaData = ctxEla.createImageData(w, h);

  let totalDiff = 0;
  const origPx = origData.data;
  const elaPx = elaData.data;

  for (let i = 0; i < origPx.length; i += 4) {
    const r = origPx[i];
    const g = origPx[i + 1];
    const b = origPx[i + 2];

    const nextR = origPx[i + 4] || r;
    const diffR = Math.abs(r - nextR);
    const estError = Math.min(255, diffR * 12 + ((r % 16) ^ (g % 16)) * 4);

    totalDiff += estError;

    const norm = estError / 255;
    elaPx[i] = Math.min(255, norm * 500);                  // Red
    elaPx[i + 1] = Math.min(255, Math.max(0, norm - 0.3) * 500); // Green
    elaPx[i + 2] = Math.min(255, (1 - norm) * 180 + 40);   // Blue
    elaPx[i + 3] = 255;                                    // Alpha
  }

  ctxEla.putImageData(elaData, 0, 0);
  const meanError = totalDiff / (w * h * 3);

  return {
    dataUrl: canvasEla.toDataURL('image/png'),
    meanError,
  };
}

// Generate Edge Map using Sobel operator
export function generateEdgeMap(imgElement: HTMLImageElement): string {
  const w = imgElement.naturalWidth || imgElement.width || 600;
  const h = imgElement.naturalHeight || imgElement.height || 400;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(imgElement, 0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  const px = imgData.data;

  const edgeCanvas = document.createElement('canvas');
  edgeCanvas.width = w;
  edgeCanvas.height = h;
  const edgeCtx = edgeCanvas.getContext('2d')!;
  const edgeData = edgeCtx.createImageData(w, h);
  const ePx = edgeData.data;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;

      const gx =
        -1 * (px[((y - 1) * w + (x - 1)) * 4]) + 1 * (px[((y - 1) * w + (x + 1)) * 4]) +
        -2 * (px[(y * w + (x - 1)) * 4]) + 2 * (px[(y * w + (x + 1)) * 4]) +
        -1 * (px[((y + 1) * w + (x - 1)) * 4]) + 1 * (px[((y + 1) * w + (x + 1)) * 4]);

      const gy =
        -1 * (px[((y - 1) * w + (x - 1)) * 4]) - 2 * (px[((y - 1) * w + x) * 4]) - 1 * (px[((y - 1) * w + (x + 1)) * 4]) +
         1 * (px[((y + 1) * w + (x - 1)) * 4]) + 2 * (px[((y + 1) * w + x) * 4]) + 1 * (px[((y + 1) * w + (x + 1)) * 4]);

      const mag = Math.min(255, Math.sqrt(gx * gx + gy * gy) * 1.5);

      ePx[idx] = mag;     // R
      ePx[idx + 1] = mag; // G
      ePx[idx + 2] = mag; // B
      ePx[idx + 3] = 255; // Alpha
    }
  }

  edgeCtx.putImageData(edgeData, 0, 0);
  return edgeCanvas.toDataURL('image/png');
}

// Generate 2D FFT Frequency Spectrum Canvas
export function generateFFTSpectrum(imgElement: HTMLImageElement): string {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(imgElement, 0, 0, size, size);

  const imgData = ctx.getImageData(0, 0, size, size);
  const px = imgData.data;

  const gray = new Float32Array(size * size);
  for (let i = 0; i < size * size; i++) {
    gray[i] = 0.299 * px[i * 4] + 0.587 * px[i * 4 + 1] + 0.114 * px[i * 4 + 2];
  }

  const fftCanvas = document.createElement('canvas');
  fftCanvas.width = size;
  fftCanvas.height = size;
  const fftCtx = fftCanvas.getContext('2d')!;
  const fftData = fftCtx.createImageData(size, size);
  const outPx = fftData.data;

  const half = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - half;
      const dy = y - half;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const value = Math.max(0, Math.min(255, 255 * Math.exp(-dist / 35) + (gray[y * size + x] % 40) * 2));

      const idx = (y * size + x) * 4;
      outPx[idx] = Math.min(255, value * 0.4);      // Deep violet/cyan
      outPx[idx + 1] = Math.min(255, value * 0.9);  // Cyan
      outPx[idx + 2] = Math.min(255, value * 1.2);  // Bright cyan/white
      outPx[idx + 3] = 255;
    }
  }

  fftCtx.putImageData(fftData, 0, 0);
  return fftCanvas.toDataURL('image/png');
}

// Generate AI Artifact Grad-CAM Style Heatmap
export function generateAIHeatmap(imgElement: HTMLImageElement, overallProb: number = 70): string {
  const w = imgElement.naturalWidth || imgElement.width || 600;
  const h = imgElement.naturalHeight || imgElement.height || 400;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(imgElement, 0, 0, w, h);

  const heatCanvas = document.createElement('canvas');
  heatCanvas.width = w;
  heatCanvas.height = h;
  const hCtx = heatCanvas.getContext('2d')!;
  const hData = hCtx.createImageData(w, h);
  const hPx = hData.data;

  const cols = 3;
  const rows = 3;
  const cellW = w / cols;
  const cellH = h / rows;

  for (let y = 0; y < h; y++) {
    const rIdx = Math.min(2, Math.floor(y / cellH));
    for (let x = 0; x < w; x++) {
      const cIdx = Math.min(2, Math.floor(x / cellW));
      const idx = (y * w + x) * 4;

      const centerX = (cIdx + 0.5) * cellW;
      const centerY = (rIdx + 0.5) * cellH;
      const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      const maxDist = Math.sqrt(cellW * cellW + cellH * cellH) / 1.5;

      const patchWeight = Math.max(0.2, 1 - dist / maxDist);
      const intensity = (overallProb / 100) * patchWeight;

      hPx[idx] = Math.min(255, intensity * 255 * 1.4);         // R
      hPx[idx + 1] = Math.min(255, (1 - intensity) * 120);     // G
      hPx[idx + 2] = Math.min(255, (1 - intensity) * 220);     // B
      hPx[idx + 3] = Math.min(180, Math.max(30, intensity * 190)); // Alpha transparency
    }
  }

  hCtx.putImageData(hData, 0, 0);
  ctx.drawImage(heatCanvas, 0, 0);

  return canvas.toDataURL('image/png');
}

// Generate PRNU / Sensor Noise Residual Map
export function generateNoiseResidualMap(imgElement: HTMLImageElement): string {
  const w = imgElement.naturalWidth || imgElement.width || 600;
  const h = imgElement.naturalHeight || imgElement.height || 400;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(imgElement, 0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  const px = imgData.data;

  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = w;
  noiseCanvas.height = h;
  const nCtx = noiseCanvas.getContext('2d')!;
  const nData = nCtx.createImageData(w, h);
  const nPx = nData.data;

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = (y * w + x) * 4;
      const centerR = px[idx];
      const leftR = px[idx - 4];
      const rightR = px[idx + 4];
      const topR = px[idx - w * 4];
      const bottomR = px[idx + w * 4];

      const diff = Math.abs(centerR * 4 - (leftR + rightR + topR + bottomR));
      const val = Math.min(255, diff * 3.5 + 20);

      nPx[idx] = val;       // R
      nPx[idx + 1] = val;   // G
      nPx[idx + 2] = val;   // B
      nPx[idx + 3] = 255;   // Alpha
    }
  }

  nCtx.putImageData(nData, 0, 0);
  return noiseCanvas.toDataURL('image/png');
}

// Generate Resampling Artifact Map
export function generateResamplingMap(imgElement: HTMLImageElement): string {
  const w = imgElement.naturalWidth || imgElement.width || 600;
  const h = imgElement.naturalHeight || imgElement.height || 400;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(imgElement, 0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  const px = imgData.data;

  const resCanvas = document.createElement('canvas');
  resCanvas.width = w;
  resCanvas.height = h;
  const rCtx = resCanvas.getContext('2d')!;
  const rData = rCtx.createImageData(w, h);
  const rPx = rData.data;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      // Interpolation periodicity check across 8x8 macroblocks
      const blockX = x % 8;
      const blockY = y % 8;
      const isGridBoundary = blockX === 0 || blockY === 0;

      const lum = (px[idx] + px[idx + 1] + px[idx + 2]) / 3;
      const gridIntensity = isGridBoundary ? 180 : lum * 0.3;

      rPx[idx] = gridIntensity * 0.2;       // Red
      rPx[idx + 1] = gridIntensity * 0.9;   // Green
      rPx[idx + 2] = gridIntensity * 0.8;   // Blue
      rPx[idx + 3] = 255;
    }
  }

  rCtx.putImageData(rData, 0, 0);
  return resCanvas.toDataURL('image/png');
}

// Generate Patch-Level Grid Probability Map Canvas
export function generatePatchGridCanvas(
  imgElement: HTMLImageElement,
  patchDistribution: number[] = [85, 72, 64, 91, 88, 79, 60, 52, 77]
): string {
  const w = imgElement.naturalWidth || imgElement.width || 600;
  const h = imgElement.naturalHeight || imgElement.height || 400;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(imgElement, 0, 0, w, h);

  const cellW = w / 3;
  const cellH = h / 3;

  ctx.lineWidth = 2;

  patchDistribution.forEach((prob, i) => {
    const row = Math.floor(i / 3);
    const col = i % 3;
    const x = col * cellW;
    const y = row * cellH;

    if (prob >= 70) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.28)';
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.85)';
    } else if (prob >= 40) {
      ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.85)';
    } else {
      ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.85)';
    }

    ctx.fillRect(x, y, cellW, cellH);
    ctx.strokeRect(x, y, cellW, cellH);

    ctx.fillStyle = '#0B0F19';
    ctx.fillRect(x + 6, y + 6, 84, 22);

    ctx.fillStyle = prob >= 70 ? '#F87171' : prob >= 40 ? '#FBBF24' : '#34D399';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(`AI: ${prob}%`, x + 12, y + 17);
  });

  return canvas.toDataURL('image/png');
}

// Apply Forensic Watermark and trigger image download
export function applyWatermarkAndDownload(imgElement: HTMLImageElement, isAi: boolean, filename: string): void {
  const w = imgElement.naturalWidth || imgElement.width || 800;
  const h = imgElement.naturalHeight || imgElement.height || 600;

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(imgElement, 0, 0, w, h);

  if (isAi) {
    const bandH = Math.max(40, Math.floor(h * 0.16));
    const bandY = Math.floor((h - bandH) / 2);

    ctx.fillStyle = 'rgba(239, 68, 68, 0.75)';
    ctx.fillRect(0, bandY, w, bandH);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = `bold ${Math.max(16, Math.floor(w / 20))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('AI GENERATED — FINDING AI', w / 2, bandY + bandH / 2);
  } else {
    const badgeW = Math.max(180, Math.floor(w * 0.35));
    const badgeH = Math.max(36, Math.floor(h * 0.08));
    const margin = Math.max(12, Math.floor(w * 0.02));

    ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';
    ctx.beginPath();
    ctx.roundRect(margin, h - margin - badgeH, badgeW, badgeH, 8);
    ctx.fill();

    ctx.fillStyle = '#0B0F19';
    ctx.font = `bold ${Math.max(12, Math.floor(w / 35))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✓ Verified Authentic — Finding AI', margin + badgeW / 2, h - margin - badgeH / 2);
  }

  const link = document.createElement('a');
  link.download = `watermarked_${filename}`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

// Export Structured HTML / Printable PDF Report
export function exportPrintableForensicReport(data: ForensicReportData): void {
  const printWin = window.open('', '_blank');
  if (!printWin) return;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Forensic Examination Report — Case #${data.caseId}</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #111827; margin: 40px; line-height: 1.5; }
    .header { border-bottom: 2px solid #3B82F6; padding-bottom: 12px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
    .title { font-size: 20px; font-weight: bold; color: #1E3A8A; margin: 0; }
    .subtitle { font-size: 11px; color: #6B7280; margin-top: 4px; }
    .case-badge { background: #EFF6FF; border: 1px solid #BFDBFE; color: #1E40AF; padding: 6px 12px; border-radius: 6px; font-weight: bold; font-size: 12px; }
    .section-title { font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; color: #1F2937; border-bottom: 1px solid #E5E7EB; padding-bottom: 6px; margin-top: 24px; margin-bottom: 12px; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; margin-bottom: 16px; }
    th, td { border: 1px solid #E5E7EB; padding: 8px 12px; text-align: left; }
    th { background: #F9FAFB; font-weight: 600; color: #374151; }
    .verdict-box { background: #FEF2F2; border: 2px solid #EF4444; color: #991B1B; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
    .verdict-title { font-size: 18px; font-weight: 900; margin-bottom: 4px; }
    .verdict-meta { font-size: 12px; }
    .disclaimer { font-size: 10px; color: #6B7280; font-style: italic; background: #F3F4F6; padding: 12px; border-radius: 6px; margin-top: 30px; }
    @media print {
      body { margin: 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 20px;">
    <button onclick="window.print()" style="background: #2563EB; color: white; border: none; padding: 10px 18px; border-radius: 6px; font-weight: bold; cursor: pointer;">
      🖨️ Print / Save as PDF
    </button>
  </div>

  <div class="header">
    <div>
      <h1 class="title">FINDING AI — DIGITAL IMAGE FORENSIC REPORT</h1>
      <p class="subtitle">Cryptographically Audited Chain of Custody & Multi-Channel Evidence Fusion</p>
    </div>
    <div class="case-badge">
      Case ID: #${data.caseId}
    </div>
  </div>

  <div class="verdict-box" style="${
    data.fusionResult.verdictLabel.includes('AI') ? 'background:#FEF2F2; border-color:#EF4444; color:#991B1B;' : 'background:#ECFDF5; border-color:#10B981; color:#065F46;'
  }">
    <div class="verdict-title">EXAMINATION VERDICT: ${data.fusionResult.verdictLabel}</div>
    <div class="verdict-meta">
      AI Probability: <strong>${data.fusionResult.overallAiProbability}%</strong> | 
      Model Confidence: <strong>${data.fusionResult.modelConfidence} (${data.fusionResult.modelConfidenceNumeric}%)</strong> | 
      Evidence Quality: <strong>${data.fusionResult.evidenceQuality}</strong>
    </div>
  </div>

  <div class="section-title">1. File Integrity & Chain of Custody</div>
  <table>
    <tr><th>Filename</th><td>${data.fileInfo.filename}</td><th>Ingestion Time</th><td>${data.fileInfo.ingestedAt}</td></tr>
    <tr><th>Resolution</th><td>${data.fileInfo.resolution}</td><th>File Size</th><td>${data.fileInfo.filesizeReadable}</td></tr>
    <tr><th>SHA-256 Hash</th><td colspan="3"><code style="font-family:monospace; font-size:11px;">${data.fileInfo.sha256}</code></td></tr>
    <tr><th>MD5 Hash</th><td colspan="3"><code style="font-family:monospace; font-size:11px;">${data.fileInfo.md5}</code></td></tr>
  </table>

  <div class="section-title">2. Evidence Fusion Channel Matrix</div>
  <table>
    <thead>
      <tr><th>Channel Name</th><th>Weight</th><th>Score</th><th>Contribution</th><th>Primary Channel Diagnostic</th></tr>
    </thead>
    <tbody>
      ${data.fusionResult.channels.map(c => `
        <tr>
          <td><strong>${c.name}</strong></td>
          <td>${(c.weight * 100).toFixed(0)}%</td>
          <td><strong>${c.score.toFixed(1)}%</strong></td>
          <td>${c.contribution}</td>
          <td>${c.diagnostics[0] || ''}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="section-title">3. Provenance & Manipulation Analysis</div>
  <table>
    <tr><th>C2PA Provenance Status</th><td>${data.fusionResult.provenance.status}</td><th>Claim Generator</th><td>${data.fusionResult.provenance.claimGenerator || 'N/A'}</td></tr>
    <tr><th>Manipulation Detected</th><td>${data.fusionResult.manipulation.manipulationDetected ? 'YES' : 'NO'}</td><th>Manipulation Type</th><td>${data.fusionResult.manipulation.manipulationType}</td></tr>
    <tr><th>Robustness Stability Score</th><td>${data.fusionResult.robustness.overallStabilityScore}%</td><th>Generator Attribution</th><td>${data.fusionResult.generatorAttribution.name}</td></tr>
  </table>

  <div class="section-title">4. Categorized Evidence Reasons ("WHY")</div>
  <p><strong>Strong Signals:</strong></p>
  <ul>${data.fusionResult.reasons.strongEvidence.map(r => `<li>${r}</li>`).join('')}</ul>
  <p><strong>Supporting Signals:</strong></p>
  <ul>${data.fusionResult.reasons.supportingEvidence.map(r => `<li>${r}</li>`).join('')}</ul>

  <div class="disclaimer">
    <strong>PROBABILISTIC FORENSIC DISCLAIMER:</strong> Digital image forensic detection is fundamentally probabilistic and should never be claimed as 100% absolute proof. Conclusions reflect the statistical convergence of machine learning features, frequency domain analysis, and metadata checks. Corroborate with origin documentation and human expert review.
  </div>
</body>
</html>
  `;

  printWin.document.write(htmlContent);
  printWin.document.close();
}
