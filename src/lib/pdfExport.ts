import jsPDF from 'jspdf';
import type { GenerateResponse } from './aiClient';

/* ═══════════════════════════════════════════
   PDF Export — Real text, copy-pasteable, professional layout
   ═══════════════════════════════════════════ */

// ─── Layout ─── //
const PW = 210, PH = 297; // A4 mm
const ML = 20, MR = 20, MT = 25, MB = 22;
const CW = PW - ML - MR;

// ─── Colors ─── //
const C = {
  title:   [26, 26, 46]    as const,
  sub:     [100, 100, 120] as const,
  section: [0, 100, 165]   as const,
  body:    [51, 51, 51]    as const,
  muted:   [140, 140, 155] as const,
  divider: [215, 220, 230] as const,
  sectionBg: [235, 242, 250] as const,
};

// ─── Helpers ─── //
function strip(t: string): string {
  return t
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    .replace(/`(.+?)`/g, '$1');
}

function safe(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val))
    return val.map((v, i) => typeof v === 'string' ? `${i + 1}. ${v}` : safe(v)).join('\n\n');
  if (typeof val === 'object')
    return Object.entries(val).map(([k, v]) => {
      const label = k.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^\w/, c => c.toUpperCase()).trim();
      if (typeof v === 'string') return `### ${label}\n${v}`;
      if (Array.isArray(v)) return `### ${label}\n${(v as any[]).map((x: any, i: number) => typeof x === 'string' ? `${i + 1}. ${x}` : safe(x)).join('\n')}`;
      return `${label}: ${safe(v)}`;
    }).join('\n\n');
  return String(val);
}

async function loadImg(url: string): Promise<{ data: string; w: number; h: number } | null> {
  try {
    return await new Promise(resolve => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        c.getContext('2d')!.drawImage(img, 0, 0);
        resolve({ data: c.toDataURL('image/jpeg', 0.85), w: img.width, h: img.height });
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
  } catch { return null; }
}

/* ═══════════════════════════════════════════
   MAIN EXPORT
   ═══════════════════════════════════════════ */
export async function generateSalesKitPDF(data: GenerateResponse, imageUrl?: string): Promise<void> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  let y = MT;

  // ─── Page break handler ─── //
  const need = (h: number) => {
    if (y + h > PH - MB) { doc.addPage(); y = MT; }
  };

  // ─── Wrapped text renderer (per-line for precise page breaks) ─── //
  const text = (s: string, x: number, maxW: number, lh: number) => {
    const lines = doc.splitTextToSize(s, maxW);
    for (const ln of lines) { need(lh); doc.text(ln, x, y); y += lh; }
  };

  // ─── Section header ─── //
  const section = (title: string) => {
    need(18);
    y += 4;
    doc.setFillColor(...C.sectionBg);
    doc.roundedRect(ML, y - 5.5, CW, 9, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...C.section);
    doc.text(title, ML + 4, y);
    y += 10;
  };

  // ─── Markdown content renderer ─── //
  const content = (md: string) => {
    const lines = md.split('\n');
    for (const raw of lines) {
      const t = raw.trim();
      if (!t) { y += 2.5; continue; }

      // Headings
      if (t.startsWith('### ')) {
        need(8);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(...C.title);
        text(strip(t.substring(4)), ML, CW, 4.5);
        y += 2; continue;
      }
      if (t.startsWith('## ')) {
        need(9);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(12); doc.setTextColor(...C.title);
        text(strip(t.substring(3)), ML, CW, 5);
        y += 2.5; continue;
      }
      if (t.startsWith('# ')) {
        need(10);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...C.title);
        text(strip(t.substring(2)), ML, CW, 5.5);
        y += 3; continue;
      }

      // Horizontal rule
      if (t === '---' || t === '___' || t === '***') {
        need(5);
        doc.setDrawColor(...C.divider); doc.setLineWidth(0.3);
        doc.line(ML, y, ML + CW, y);
        y += 5; continue;
      }

      // Bullet list
      if (t.startsWith('- ') || t.startsWith('* ')) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...C.body);
        need(4);
        doc.text('\u2022', ML + 3, y);
        text(strip(t.substring(2)), ML + 8, CW - 8, 4);
        y += 1; continue;
      }

      // Numbered list
      const nm = t.match(/^(\d+)\.\s+(.+)/);
      if (nm) {
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...C.body);
        need(4);
        doc.text(`${nm[1]}.`, ML + 2, y);
        text(strip(nm[2]), ML + 10, CW - 10, 4);
        y += 1; continue;
      }

      // Regular paragraph
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor(...C.body);
      text(strip(t), ML, CW, 4);
      y += 1;
    }
    y += 4;
  };

  // ═══════════════════════════════════════
  // COVER PAGE
  // ═══════════════════════════════════════

  // Top accent bar
  doc.setFillColor(...C.section);
  doc.rect(0, 0, PW, 3.5, 'F');

  y = 28;

  // Title
  doc.setFont('helvetica', 'bold'); doc.setFontSize(28); doc.setTextColor(...C.title);
  doc.text('AI SALES KIT', ML, y);
  y += 10;

  // Subtitle
  doc.setFont('helvetica', 'normal'); doc.setFontSize(12); doc.setTextColor(...C.sub);
  doc.text('Laporan Janaan Profesional', ML, y);
  y += 7;

  // Date
  doc.setFontSize(10); doc.setTextColor(...C.muted);
  const dateStr = new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(`Dijana pada: ${dateStr}`, ML, y);
  y += 6;

  // Divider
  doc.setDrawColor(...C.divider); doc.setLineWidth(0.5);
  doc.line(ML, y, PW - MR, y);
  y += 12;

  // Poster image
  if (imageUrl) {
    const img = await loadImg(imageUrl);
    if (img) {
      const maxW = CW * 0.65, maxH = 95;
      const ratio = img.w / img.h;
      let iw = maxW, ih = iw / ratio;
      if (ih > maxH) { ih = maxH; iw = ih * ratio; }
      need(ih + 15);
      const ix = ML + (CW - iw) / 2;

      // Light border around image
      doc.setDrawColor(...C.divider); doc.setLineWidth(0.3);
      doc.rect(ix - 1, y - 1, iw + 2, ih + 2);
      doc.addImage(img.data, 'JPEG', ix, y, iw, ih);
      y += ih + 5;

      doc.setFont('helvetica', 'italic'); doc.setFontSize(9); doc.setTextColor(...C.muted);
      doc.text('Poster Iklan (AI Generated)', PW / 2, y, { align: 'center' });
      y += 8;
    }
  }

  // Image prompt
  if (data.imagePrompt) {
    need(15);
    doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(...C.muted);
    doc.text('Prompt Janaan Poster:', ML, y);
    y += 4;
    doc.setFont('helvetica', 'italic'); doc.setFontSize(8.5); doc.setTextColor(...C.muted);
    text(safe(data.imagePrompt), ML, CW, 3.5);
    y += 6;
  }

  // ═══════════════════════════════════════
  // CONTENT SECTIONS
  // ═══════════════════════════════════════

  doc.addPage(); y = MT;

  section('COPYWRITING JUALAN');
  content(safe(data.copywriting));

  section('SKRIP WHATSAPP & FOLLOW-UP');
  content(safe(data.whatsappScript));

  section('PELAN TINDAKAN 24 JAM');
  content(safe(data.actionPlan));

  section('IDEA TIKTOK, HEADLINE & URGENCY');
  content(safe(data.extraFeatures));

  // ═══════════════════════════════════════
  // FOOTERS ON ALL PAGES
  // ═══════════════════════════════════════
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    // Thin line above footer
    doc.setDrawColor(...C.divider); doc.setLineWidth(0.2);
    doc.line(ML, PH - 15, PW - MR, PH - 15);
    // Footer text
    doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor(...C.muted);
    doc.text('AI Sales Kit  |  Dijana oleh AI', ML, PH - 11);
    doc.text(`${i} / ${total}`, PW - MR, PH - 11, { align: 'right' });
  }

  doc.save('ai-sales-kit-penuh.pdf');
}
