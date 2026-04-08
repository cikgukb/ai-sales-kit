// Caching or extracting from env
const getReplicateKey = () => import.meta.env.VITE_REPLICATE_API_TOKEN || localStorage.getItem('REPLICATE_API_TOKEN');
const getImageRouterKey = () => import.meta.env.VITE_IMAGEROUTER_API_KEY || localStorage.getItem('IMAGEROUTER_API_KEY');

import { supabase } from './supabase';

// Detect if running on Vercel production or local dev
const isProduction = () => !import.meta.env.DEV;

export type SalesInput = {
  jenisProduk: string;
  namaJenama?: string;
  targetCustomer: string;
  harga: string;
  masalahCustomer: string;
  ciriKeunikan?: string;
  tawaran?: string;
  ctaType?: string; // e.g. "Sila WhatsApp", "Masukkan nombor telefon", etc.
  ctaValue?: string; // The actual phone number or link
  userImage?: string; // base64 data URL from user upload (optional)
  posterModel?: 'recraft/recraft-v3' | 'bytedance/seedream-4.5';
};

export type GenerateResponse = {
  copywriting: string;
  whatsappScript: string;
  actionPlan: string;
  extraFeatures: string;
  imagePrompt: string;
};

export type AdsStrategyInput = {
  productDescription: string;
  targetAudience: string;
  priceRange: string;
  objective: string;
};

export type AdsStrategyResponse = {
  sectionA: {
    painBased: { hook: string; body: string; cta: string; visualSuggestion: string; awareness: string; };
    curiosityBased: { hook: string; body: string; cta: string; visualSuggestion: string; awareness: string; };
    proofBased: { hook: string; body: string; cta: string; visualSuggestion: string; awareness: string; };
  };
  sectionB: {
    phase1: { phase: string; audience: string; advantagePlus: string; budget: string; kpi: string[]; };
    phase2: { phase: string; trigger: string; actions: string[]; };
    phase3: { phase: string; requirement: string; actions: string[]; };
  };
  sectionC: {
    scenarios: Array<{ situation: string; meaning: string; action: string[]; }>;
  };
  timeline: {
    day1to3: string[];
    day4to7: string[];
    week2: string[];
  };
};

/* ══════════════════════════════════════════════
   POSTER FRAMEWORK PROMPT TEMPLATE
   Based on poster_framework.html:
   1. Title — the hook (3-7 words, bold, top/center)
   2. Main Image — product as hero, professional style
   3. CTA — action verb + outcome, bottom third
   ══════════════════════════════════════════════ */

export const generateSalesKit = async (input: SalesInput): Promise<GenerateResponse> => {
  if (supabase) {
    const { data: usageData, error: usageError } = await supabase.rpc('process_usage', { p_type: 'copywriting' }) as { data: any, error: any };
    if (usageError || (usageData && !usageData.success)) {
      const errMsg = usageData?.message || usageError?.message || 'Baki kredit tidak mencukupi untuk menjana copywriting.';
      throw new Error(errMsg.includes('kredit tidak mencukupi') || errMsg.includes('perlukan') ? `INSUFFICIENT_CREDITS: ${errMsg}` : errMsg);
    }
  }

  const replicateKey = getReplicateKey();
  if (!replicateKey) {
    throw new Error('Replicate API Key tidak ditemui. Sila masukkan di tetapan.');
  }

  const prompt = `
  Anda adalah pakar 'Direct Response Marketing' bertaraf dunia di Malaysia yang pakar membantu Usahawan Mikro SME.
  Objektif utama: Bantu usahawan dapatkan jualan pertama dalam 24-48 jam.
  
  Gunakan gaya "BM santai" dicampur sedikit English (pemasaran Malaysia). Elakkan teori panjang, terus berikan bahan yang sedia untuk di-post.
  Jangan guna perkataan terlalu formal/skema. WAJIB fokus kepada SALES, convert, dan urgency.

  Maklumat Produk Usahawan:
  - Nama Jenama: ${input.namaJenama || 'Tidak dinyatakan'}
  - Jenis Produk: ${input.jenisProduk}
  - Target Customer: ${input.targetCustomer}
  - Harga: ${input.harga}
  - Masalah Customer yg diselesaikan: ${input.masalahCustomer}
  - Ciri-Ciri Keunikan / Kelebihan: ${input.ciriKeunikan || 'Tidak dinyatakan'}
  - Tawaran / Offer: ${input.tawaran || 'Tidak dinyatakan (TOLONG berikan cadangan tawaran/offer yang biasa & berkesan digunakan oleh IKS di dalam copywriting nanti)'}
  - CTA Type: ${input.ctaType || 'WhatsApp Sekarang'}
  - CTA Detail: ${input.ctaValue || ''}

  Sila berikan output dalam format JSON yang tepat MENGANDUNGI kunci-kunci berikut (pastikan format JSON sah):
  1. "copywriting": Teks iklan Facebook/TikTok. Mesti ada Hook memukau, penerangan ringkas (Problem+Solution), dan CTA untuk WhatsApp/DM.
  2. "whatsappScript": Skrip rasmi untuk WhatsApp. Mesti ada bahagian balas mesej pertama, skrip close sale (urgency), dan skrip handle objection (jika pelanggan kata mahal/fikir dulu).
  3. "actionPlan": Tindakan langkah-demi-langkah apa usahawan perlu buat dalam 24 jam pertama (Bila nak post, nak DM siapa, bila nak follow up).
  4. "extraFeatures": Idea konten TikTok (3 angle), cadangan A/B testing Headline, dan trick mencipta urgency.
  5. "imagePrompt": Ini PALING PENTING — mesti ikut POSTER FRAMEWORK di bawah.

  ===== POSTER FRAMEWORK (WAJIB IKUT) =====
  Prompt mesti menghasilkan POSTER IKLAN SIAP JUAL, bukan sekadar gambar produk biasa.
  Prompt mesti dalam Bahasa Inggeris dan mesti mengandungi 3 elemen ini:

  SYARAT UTAMA KARAKTER (WAJIB):
  - Jika ada karakter manusia dalam poster, MESTI gunakan karakter rakyat Malaysia (Malay, Chinese, Indian, or other Malaysian ethnicities).
  - JANGAN sesekali gunakan karakter orang asing atau "non-Malaysian characters".
  - Gunakan perkataan seperti "Malaysian person", "Malay woman", "Chinese man", "Indian entrepreneur" dalam prompt untuk ketepatan.

  ELEMEN 1 — TITLE (Hook):
  - Ayat pendek 3-7 perkataan, bold, besar, di bahagian atas poster.
  - Contoh: "PUSH HARDER RECOVER FASTER", "MAKE YOUR DAY STAY HYDRATED"
  - Mesti benefit-driven dan memukau.

  ELEMEN 2 — MAIN IMAGE:
  - Produk sebagai hero utama, nampak besar dan jelas.
  - Gaya photorealistic, studio lighting, professional.
  - Background yang sesuai (solid color, gradient, atau lifestyle scene).
  - Warna dominan 2-4 yang harmoni.
  - Produk mesti menonjol dan ada "breathing room" untuk teks.
  - Jika ada model/manusia, pastikan wajah dan gaya penampilan adalah rakyat Malaysia.

  ELEMEN 3 — CALL TO ACTION:
  - Di bahagian bawah poster.
  - MUST use this CTA type: "${input.ctaType || 'WhatsApp'}"
  - MUST include this detail: "${input.ctaValue || ''}"
  - MESTI letakkan arahan melukis ikon yang bersesuaian di sebelah teks CTA dalam prompt gambar. Panduan Ikon:
    * Jika CTA adalah 'WhatsApp' -> Arahkan lukisan 'a 3d green WhatsApp logo'
    * Jika CTA adalah 'ClickBio' -> Arahkan lukisan 'an Instagram logo or Link icon'
    * Jika CTA adalah 'Laman Web' -> Arahkan lukisan 'a glowing Globe or Website icon'
    * Jika CTA adalah 'Hubungi' -> Arahkan lukisan 'a Phone call receiver icon'
    * Jika CTA adalah 'Datang ke premis' -> Arahkan lukisan 'a Map pin or Location icon'
  - ${(!input.harga || input.harga === '0') ? 'DO NOT include any price in the poster.' : `Include price: "${input.harga}"`}
  - Example: "[Relevant Icon] ${input.ctaType || 'Order Now'} [CTA_VALUE] ${(!input.harga || input.harga === '0') ? '' : `- Only ${input.harga}`}".

  FORMAT PROMPT YANG BETUL (CONTOH):
  "Professional sales poster for [product]. Bold headline text '[HEADLINE]' at the top in large white bold typography. A friendly Malaysian [model_type] entrepreneur as the secondary element or hero product user. The [product] as the primary hero in the center, photorealistic, studio lighting, [color] gradient background. At the bottom, call-to-action text '[CTA TYPE] [CTA DETAIL]' with a [Relevant Icon] next to it, with price '[PRICE]'. Clean modern poster layout, high contrast, commercial quality, social media ready, 1080x1080px format."

  INGAT: Prompt "imagePrompt" MESTI menghasilkan POSTER LENGKAP dengan teks, dan WAJIB menggunakan wajah rakyat Malaysia!
  ==========================================

  Pastikan respons HANYA mengandungi objek JSON tanpa markdown blockquotes tambahan jika boleh, atau pastikan ia boleh dipars. Return raw JSON.
  `;

  const body = { input: { prompt: prompt, max_tokens: 4000 } };

  let response: Response;
  if (isProduction()) {
    // Production: use Vercel serverless function (API key stays server-side)
    response = await fetch("/api/replicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } else {
    // Local dev: use Vite proxy
    response = await fetch("/replicate-api/v1/models/anthropic/claude-3.7-sonnet/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${replicateKey}`,
        "Content-Type": "application/json",
        "Prefer": "wait"
      },
      body: JSON.stringify(body)
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Replicate Claude Error:", errorText);
    throw new Error("Gagal memanggil Claude dari Replicate.");
  }

  const prediction = await response.json();
  
  if (!prediction.output) {
     throw new Error("Tiada output dari Claude Replicate.");
  }

  const responseText = Array.isArray(prediction.output) ? prediction.output.join("") : prediction.output;
  
  let cleanedText = responseText.trim();
  if (cleanedText.startsWith('\`\`\`json')) {
    cleanedText = cleanedText.replace(/^\`\`\`json/g, '').replace(/\`\`\`$/g, '').trim();
  } else if (cleanedText.startsWith('\`\`\`')) {
    cleanedText = cleanedText.replace(/^\`\`\`/g, '').replace(/\`\`\`$/g, '').trim();
  }

  try {
    return JSON.parse(cleanedText) as GenerateResponse;
  } catch (e) {
    console.error("Gagal parse JSON dari Claude", cleanedText);
    throw new Error("Ralat memproses jawapan JSON dari Claude AI.");
  }
};

/* ══════════════════════════════════════════════
   GENERATE POSTER IMAGE
   Dua mod:
   A) Pengguna upload gambar → flux-kontext-pro (edit gambar jadi poster)
   B) Tiada gambar → FLUX-1-schnell (jana poster dari prompt)
   ══════════════════════════════════════════════ */

export const generateProductImage = async (imagePrompt: string, userImageBase64?: string, posterModel?: string): Promise<string> => {
  if (supabase) {
    const { data: usageData, error: usageError } = await supabase.rpc('process_usage', { p_type: 'image' }) as { data: any, error: any };
    if (usageError || (usageData && !usageData.success)) {
      const errMsg = usageData?.message || usageError?.message || 'Baki kredit tidak mencukupi untuk menjana gambar.';
      throw new Error(errMsg.includes('kredit tidak mencukupi') || errMsg.includes('perlukan') ? `INSUFFICIENT_CREDITS: ${errMsg}` : errMsg);
    }
  }

  const imageRouterKey = getImageRouterKey();
  if (!imageRouterKey) {
    throw new Error('ImageRouter API Key tidak ditemui. Sila masukkan di .env.');
  }

  try {
    // ─── MOD A: Pengguna ada upload gambar → Edit jadi poster ───
    if (userImageBase64) {
      return await editImageIntoPoster(imageRouterKey, imagePrompt, userImageBase64);
    }

    // ─── MOD B: Tiada gambar → Jana poster dari prompt ───
    return await generatePosterFromPrompt(imageRouterKey, imagePrompt, posterModel);

  } catch (err: any) {
    console.error("Image gen err", err);
    throw new Error(err.message || "Ralat penjanaan gambar");
  }
};

/* ──────────────────────────────────────
   MOD A: Edit gambar pengguna jadi poster
   Menggunakan flux-kontext-pro via /images/edits
   ────────────────────────────────────── */
async function editImageIntoPoster(apiKey: string, posterPrompt: string, base64DataUrl: string): Promise<string> {
  // Extract binary from base64 data URL
  const base64Data = base64DataUrl.split(',')[1];
  const byteChars = atob(base64Data);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) {
    byteNumbers[i] = byteChars.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  
  // Determine mime type
  const mimeMatch = base64DataUrl.match(/^data:(image\/\w+);/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
  const ext = mimeType.split('/')[1] || 'png';
  
  const imageBlob = new Blob([byteArray], { type: mimeType });

  const editPrompt = `Transform this product photo into a professional sales poster. ${posterPrompt}. Keep the original product clearly visible as the hero element. Add bold headline text at the top, professional background styling, and call-to-action text at the bottom. Make it look like a premium commercial advertisement poster ready for social media.`;

  const formData = new FormData();
  formData.append('image', imageBlob, `product.${ext}`);
  formData.append('prompt', editPrompt);
  formData.append('model', 'black-forest-labs/flux-kontext-pro');
  formData.append('response_format', 'url');

  let response: Response;
  if (isProduction()) {
    response = await fetch("/api/imageedit", {
      method: "POST",
      body: formData
    });
  } else {
    response = await fetch("/imagerouter-api/v1/openai/images/edits", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}` },
      body: formData
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("ImageRouter Edit Error:", errorText);
    // Fallback: If edit fails, try generating from prompt instead
    console.warn("Edit gagal, cuba generate dari prompt...");
    return await generatePosterFromPrompt(apiKey, posterPrompt);
  }

  const result = await response.json();
  if (result.data && result.data.length > 0) {
    const imgData = result.data[0];
    if (imgData.url) return imgData.url;
    if (imgData.b64_json) return `data:image/png;base64,${imgData.b64_json}`;
  }
  
  throw new Error("Gagal mendapat hasil edit gambar dari ImageRouter");
}

/* ──────────────────────────────────────
   MOD B: Jana poster dari prompt sahaja
   Menggunakan model pilihan (Default: NanoBanana 2)
   ────────────────────────────────────── */
async function generatePosterFromPrompt(apiKey: string, imagePrompt: string, _model?: string): Promise<string> {
  // Use DALL-E 3 (ChatGPT's image generator) as requested
  const selectedModel = _model || "google/nano-banana-2";
  
  const body: any = { 
    prompt: imagePrompt, 
    model: selectedModel, 
    num_inference_steps: 4, // Fast generation
    response_format: "url"
  };

  let response: Response;
  if (isProduction()) {
    response = await fetch("/api/imagegen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } else {
    response = await fetch("/imagerouter-api/v1/openai/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("ImageRouter Error:", errorText);
    let errMsg = "Ralat ImageRouter";
    try {
      const parsed = JSON.parse(errorText);
      errMsg = parsed.error?.message || errorText;
    } catch(e) {}
    throw new Error(`Gagal menjana poster: ${errMsg}`);
  }

  const result = await response.json();
  
  if (result.data && result.data.length > 0) {
    const imgData = result.data[0];
    if (imgData.url) return imgData.url;
    if (imgData.b64_json) return `data:image/png;base64,${imgData.b64_json}`;
  }
  
  console.error("Empty data returned:", result);
  throw new Error(`Sistem AI menapis imej ini atau tiada hasil dikembalikan. Sila cuba 'Jana Kit Baru' (Tukar prompt teks anda). Respon: ${JSON.stringify(result).substring(0,100)}`);
}

export const generateAdsStrategy = async (input: AdsStrategyInput): Promise<AdsStrategyResponse> => {
  const replicateKey = getReplicateKey();
  if (!replicateKey) {
    throw new Error('Replicate API Key tidak ditemui. Sila masukkan di tetapan.');
  }

  const prompt = `
  Anda adalah pakar strategi digital Ads (Facebook/TikTok/IG) berkelas dunia di Malaysia.
  Tugasan anda adalah membina modul: "Ads Creative & Strategy" khas untuk produk/servis berikut:

  - Produk / Servis: ${input.productDescription}
  - Target Audience: ${input.targetAudience}
  - Harga Barangan: ${input.priceRange}
  - Objektif Kempen: ${input.objective}
  
  Sila guna Bahasa Melayu yang ringkas, jelas (actionable) dan tanpa jargon teknikal berlebihan.

  HASILKAN OUTPUT REKA BENTUK DALAM FORMAT JSON SEPERTI BERIKUT SAHAJA:
  {
    "sectionA": {
      "painBased": { "hook": "...", "body": "...", "cta": "...", "visualSuggestion": "...", "awareness": "Cold/Warm" },
      "curiosityBased": { "hook": "...", "body": "...", "cta": "...", "visualSuggestion": "...", "awareness": "Cold/Warm" },
      "proofBased": { "hook": "...", "body": "...", "cta": "...", "visualSuggestion": "...", "awareness": "Cold/Warm" }
    },
    "sectionB": {
      "phase1": { "phase": "PHASE 1: EXPLORE", "audience": "Broad", "advantagePlus": "ON", "budget": "RMxx - RMyy sehari", "kpi": ["...", "..."] },
      "phase2": { "phase": "PHASE 2: CONTROL", "trigger": "Performance drop", "actions": ["...", "..."] },
      "phase3": { "phase": "PHASE 3: SCALE", "requirement": "Minimum 1,000 data", "actions": ["...", "..."] }
    },
    "sectionC": {
      "scenarios": [
        { "situation": "Low CTR (<1.5%)", "meaning": "Creative is weak", "action": ["...", "..."] },
        { "situation": "High CTR tapi tiada jualan", "meaning": "Landing page problem", "action": ["...", "..."] },
        { "situation": "Ada jualan tapi kos tinggi (High CPA)", "meaning": "Funnel not optimized", "action": ["...", "..."] },
        { "situation": "Ads sangat padu (High ROAS)", "meaning": "Winning pattern found", "action": ["...", "..."] }
      ]
    },
    "timeline": {
      "day1to3": ["Launch ads", "Jangan buat sebarang pertukaran (Do not make changes)"],
      "day4to7": ["Analyze CTR", "Tutup (kill) ads yang low-performing"],
      "week2": ["Scale winning ads", "Introduce new creatives"]
    }
  }

  PENTING:
  - Kembalikan HANYA JSON block tanpa text tambahan, tanpa \`\`\`json (atau saya akan parse fail secara langsung).
  `;

  const body = { input: { prompt: prompt, max_tokens: 3000 } };

  let response: Response;
  if (isProduction()) {
    response = await fetch("/api/replicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } else {
    response = await fetch("/replicate-api/v1/models/anthropic/claude-3.7-sonnet/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${replicateKey}`,
        "Content-Type": "application/json",
        "Prefer": "wait"
      },
      body: JSON.stringify(body)
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Replicate Error:", errorText);
    throw new Error("Gagal mendapat maklumat strategi dari AI.");
  }

  const prediction = await response.json();
  if (!prediction.output) {
    throw new Error("Tiada output yang dijana.");
  }

  const responseText = Array.isArray(prediction.output) ? prediction.output.join("") : prediction.output;
  let cleanedText = responseText.trim();
  if (cleanedText.startsWith('\`\`\`json')) {
    cleanedText = cleanedText.replace(/^\`\`\`json/g, '').replace(/\`\`\`$/g, '').trim();
  } else if (cleanedText.startsWith('\`\`\`')) {
    cleanedText = cleanedText.replace(/^\`\`\`/g, '').replace(/\`\`\`$/g, '').trim();
  }

  try {
    return JSON.parse(cleanedText) as AdsStrategyResponse;
  } catch (e) {
    console.error("Parse Error:", cleanedText);
    throw new Error("Gagal menyusun strategi Ads.");
  }
};
