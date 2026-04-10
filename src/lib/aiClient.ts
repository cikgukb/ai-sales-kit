// Caching or extracting from env
const getReplicateKey = () => import.meta.env.VITE_REPLICATE_API_TOKEN || localStorage.getItem('REPLICATE_API_TOKEN');


import { supabase } from './supabase';

// Detect if running on Vercel production or local dev
const isProduction = () => !import.meta.env.DEV;

/* ──────────────────────────────────────
   POLLING HELPER
   When Replicate's Prefer: wait times out, the prediction
   returns with status "processing" and no output.
   This function polls until completion.
   ────────────────────────────────────── */
async function pollPrediction(prediction: any, apiKey: string, maxAttempts = 60): Promise<any> {
  if (prediction.status === 'succeeded' && prediction.output) {
    return prediction;
  }
  if (prediction.status === 'failed' || prediction.status === 'canceled') {
    throw new Error(`Prediction ${prediction.status}: ${prediction.error || 'Unknown error'}`);
  }

  const pollUrl = prediction.urls?.get;
  if (!pollUrl) {
    throw new Error('Tiada URL polling dari Replicate. Sila cuba lagi.');
  }

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, 2000)); // Wait 2s between polls

    const pollResponse = await fetch(pollUrl, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });

    if (!pollResponse.ok) continue;

    const updated = await pollResponse.json();
    console.log(`Polling attempt ${i + 1}: status=${updated.status}`);

    if (updated.status === 'succeeded' && updated.output) {
      return updated;
    }
    if (updated.status === 'failed' || updated.status === 'canceled') {
      throw new Error(`Prediction ${updated.status}: ${updated.error || 'Unknown error'}`);
    }
  }

  throw new Error('Prediction timeout — AI mengambil masa terlalu lama. Sila cuba lagi.');
}

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

export type LandingPageInput = {
  productDescription: string;
  targetAudience: string;
  priceRange: string;
  offerDetails: string;
};

export type LandingPageResponse = {
  sectionA: { headline: string; hook: string; };
  sectionB: { problem: string; pain: string; solutionContrast: string; };
  sectionC: { proofAndTrust: string; };
  sectionD: { mechanism: string; };
  sectionE: { mainProduct: string; bonuses: string[]; specialIncentive: string; valueStacking: string; };
  sectionF: { cta: string; urgencyLine: string; scarcityAngle: string; riskReversal: string; };
  bonusSection: { objectionHandling: string; };
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

  // Production: /api/replicate uses server-side REPLICATE_API_TOKEN (browser tidak perlu key).
  // Dev: kita perlu VITE_REPLICATE_API_TOKEN dalam .env untuk Vite proxy direct ke Replicate.
  let replicateKey = '';
  if (!isProduction()) {
    const key = getReplicateKey();
    if (!key) {
      throw new Error('Replicate API Key tidak ditemui untuk local dev. Sila tambah VITE_REPLICATE_API_TOKEN dalam .env.');
    }
    replicateKey = key;
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
    response = await fetch("/replicate-api/v1/models/anthropic/claude-4.5-sonnet/predictions", {
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
    console.error("Replicate Claude Error:", response.status, errorText);
    throw new Error(`Gagal memanggil Claude (${response.status}): ${errorText.substring(0, 200)}`);
  }

  let prediction = await response.json();
  
  // If Prefer: wait timed out, poll until completion.
  // Production: /api/replicate handles polling server-side (lihat api/replicate.js).
  // Dev: kita poll terus via Vite proxy yang perlukan VITE_REPLICATE_API_TOKEN.
  if (!prediction.output && prediction.status !== 'succeeded') {
    if (isProduction()) {
      throw new Error(`Tiada output dari Claude. Status: ${prediction.status}, Error: ${prediction.error || 'none'}`);
    }
    const devKey = getReplicateKey();
    if (!devKey) {
      throw new Error('Polling memerlukan VITE_REPLICATE_API_TOKEN dalam .env untuk local dev.');
    }
    prediction = await pollPrediction(prediction, devKey);
  }

  if (!prediction.output) {
     throw new Error(`Tiada output dari Claude. Status: ${prediction.status}, Error: ${prediction.error || 'none'}`);
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

export const generateLandingPage = async (input: LandingPageInput): Promise<LandingPageResponse> => {
  if (supabase) {
    const { data: usageData, error: usageError } = await supabase.rpc('process_usage', { p_type: 'copywriting' }) as { data: any, error: any };
    if (usageError || (usageData && !usageData.success)) {
      const errMsg = usageData?.message || usageError?.message || 'Baki kredit tidak mencukupi untuk menjana Landing Page.';
      throw new Error(errMsg.includes('kredit tidak mencukupi') || errMsg.includes('perlukan') ? `INSUFFICIENT_CREDITS: ${errMsg}` : errMsg);
    }
  }

  // Production: /api/replicate uses server-side REPLICATE_API_TOKEN (browser tidak perlu key).
  // Dev: kita perlu VITE_REPLICATE_API_TOKEN dalam .env untuk Vite proxy direct ke Replicate.
  let replicateKey = '';
  if (!isProduction()) {
    const key = getReplicateKey();
    if (!key) {
      throw new Error('Replicate API Key tidak ditemui untuk local dev. Sila tambah VITE_REPLICATE_API_TOKEN dalam .env.');
    }
    replicateKey = key;
  }

  const prompt = `
  Anda adalah pakar Copywriting Landing Page bertaraf dunia di Malaysia.
  Tugasan anda adalah membina modul: "Landing Page Builder (Conversion Framework + Offer Injection)".
  
  INFO BISNES:
  - Produk / Servis: ${input.productDescription}
  - Target Audience: ${input.targetAudience}
  - Harga: ${input.priceRange}
  - Offer (Tawaran Khusus): ${input.offerDetails}

  PENTING:
  - Anda WAJIB mengintegrasikan tawaran (offer) ini bagi meningkatkan urgency dan menguatkan CTA.
  - Sila guna Bahasa Melayu santai yang persuasif tapi jelas. Jangan terlalu overhype.
  
  HASILKAN OUTPUT REKA BENTUK DALAM FORMAT JSON SEPERTI BERIKUT SAHAJA:
  {
    "sectionA": {
      "headline": "(Penting: Inject OFFER di sini jika sesuai. Contoh: Belajar Ads + Dapat Template Siap Guna Terhad Minggu Ini)",
      "hook": "(Ayat pertama yang menangkap emosi audience)"
    },
    "sectionB": {
      "problem": "(Nyatakan masalah utama)",
      "pain": "(Besarkan kesakitan tu)",
      "solutionContrast": "(Bandingkan kesakitan dengan offer penyelesaian yang disediakan)"
    },
    "sectionC": {
      "proofAndTrust": "(Skrip: '...dengan tawaran ini, pengguna mencapai hasil...')"
    },
    "sectionD": {
      "mechanism": "(Penerangan bagaimana produk berkesan)"
    },
    "sectionE": {
      "mainProduct": "(Rewrite offer kepada HIGH VALUE version)",
      "bonuses": ["(Bonus 1 jika ada)", "(Bonus 2 jika ada)"],
      "specialIncentive": "(Insentif tambahan)",
      "valueStacking": "(Nilai terkumpul dan Perceived value untuk jadikan ia sangat berbaloi)"
    },
    "sectionF": {
      "cta": "(CTA beserta URGENCY: Daftar Sekarang Sebelum Slot Penuh)",
      "urgencyLine": "(Cth: Tawaran ini hanya untuk 50 peserta pertama)",
      "scarcityAngle": "(Cth: Bonus akan ditutup bila slot penuh)",
      "riskReversal": "(Guarantee atau Low-risk mitigation)"
    },
    "bonusSection": {
      "objectionHandling": "(Pecahkan keraguan prospect berhubung offer. Soalan & Jawapan)"
    }
  }

  Pastikan respons HANYA mengandungi objek JSON tulen tanpa blok markdown tambahan.
  `;

  const body = { input: { prompt: prompt, max_tokens: 4000 } };

  let response: Response;
  if (isProduction()) {
    response = await fetch("/api/replicate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } else {
    response = await fetch("/replicate-api/v1/models/anthropic/claude-4.5-sonnet/predictions", {
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
    console.error("Replicate Claude Error (Landing Page):", response.status, errorText);
    throw new Error(`Gagal memanggil Claude (${response.status}): ${errorText.substring(0, 200)}`);
  }

  let prediction = await response.json();
  
  // If Prefer: wait timed out, poll until completion.
  // Production: /api/replicate handles polling server-side (lihat api/replicate.js).
  // Dev: kita poll terus via Vite proxy yang perlukan VITE_REPLICATE_API_TOKEN.
  if (!prediction.output && prediction.status !== 'succeeded') {
    if (isProduction()) {
      throw new Error(`Tiada output dari Claude. Status: ${prediction.status}, Error: ${prediction.error || 'none'}`);
    }
    const devKey = getReplicateKey();
    if (!devKey) {
      throw new Error('Polling memerlukan VITE_REPLICATE_API_TOKEN dalam .env untuk local dev.');
    }
    prediction = await pollPrediction(prediction, devKey);
  }

  if (!prediction.output) {
     throw new Error(`Tiada output dari Claude. Status: ${prediction.status}, Error: ${prediction.error || 'none'}`);
  }

  const responseText = Array.isArray(prediction.output) ? prediction.output.join("") : prediction.output;
  let cleanedText = responseText.trim();
  if (cleanedText.startsWith('\`\`\`json')) {
    cleanedText = cleanedText.replace(/^\`\`\`json/g, '').replace(/\`\`\`$/g, '').trim();
  } else if (cleanedText.startsWith('\`\`\`')) {
    cleanedText = cleanedText.replace(/^\`\`\`/g, '').replace(/\`\`\`$/g, '').trim();
  }

  try {
    return JSON.parse(cleanedText) as LandingPageResponse;
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

export const generateProductImage = async (imagePrompt: string, userImageBase64?: string, _posterModel?: string): Promise<string> => {
  if (supabase) {
    const { data: usageData, error: usageError } = await supabase.rpc('process_usage', { p_type: 'image' }) as { data: any, error: any };
    if (usageError || (usageData && !usageData.success)) {
      const errMsg = usageData?.message || usageError?.message || 'Baki kredit tidak mencukupi untuk menjana gambar.';
      throw new Error(errMsg.includes('kredit tidak mencukupi') || errMsg.includes('perlukan') ? `INSUFFICIENT_CREDITS: ${errMsg}` : errMsg);
    }
  }

  // Production: /api/imagegen uses server-side REPLICATE_API_TOKEN (browser tidak perlu key).
  // Dev: kita perlu VITE_REPLICATE_API_TOKEN dalam .env untuk Vite proxy direct ke Replicate.
  let replicateKey = '';
  if (!isProduction()) {
    const key = getReplicateKey();
    if (!key) {
      throw new Error('Replicate API Key tidak ditemui untuk local dev. Sila tambah VITE_REPLICATE_API_TOKEN dalam .env.');
    }
    replicateKey = key;
  }

  try {
    return await generatePosterViaReplicate(replicateKey, imagePrompt, userImageBase64);
  } catch (err: any) {
    console.error("Image gen err", err);
    throw new Error(err.message || "Ralat penjanaan gambar");
  }
};

/* ──────────────────────────────────────
   GENERATE POSTER VIA REPLICATE
   Menggunakan google/nano-banana-2
   Schema: prompt, image_input[], aspect_ratio, resolution, output_format
   ────────────────────────────────────── */
async function generatePosterViaReplicate(apiKey: string, imagePrompt: string, base64Image?: string): Promise<string> {
  const selectedModel = "google/nano-banana-2";
  
  const inputPayload: any = {
    prompt: imagePrompt,
    aspect_ratio: "1:1",      // Square format for social media posters
    output_format: "jpg",
  };

  // nano-banana-2 accepts image_input as array of URIs
  if (base64Image) {
    inputPayload.image_input = [base64Image];
  }

  const body = { 
    input: inputPayload
  };

  let response: Response;
  if (isProduction()) {
    response = await fetch("/api/imagegen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  } else {
    response = await fetch(`/replicate-api/v1/models/${selectedModel}/predictions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Prefer": "wait"
      },
      body: JSON.stringify(body)
    });
  }

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Replicate Image Error:", response.status, errorText);
    let errMsg = "Ralat penjanaan Replicate";
    try {
      const parsed = JSON.parse(errorText);
      errMsg = parsed.error || parsed.detail || errorText;
    } catch(e) {}
    throw new Error(`Gagal menjana poster (${response.status}): ${errMsg}`);
  }

  const result = await response.json();
  
  // nano-banana-2 returns output as a single file URL string
  if (result.output) {
    if (typeof result.output === 'string') {
      return result.output;
    } else if (Array.isArray(result.output) && result.output.length > 0) {
      return result.output[0];
    }
  }
  
  console.error("Empty data returned:", result);
  throw new Error(`Sistem AI menapis imej ini atau tiada hasil dikembalikan. Respon: ${JSON.stringify(result).substring(0,100)}`);
}


export const generateAdsStrategy = async (input: AdsStrategyInput): Promise<AdsStrategyResponse> => {
  if (supabase) {
    const { data: usageData, error: usageError } = await supabase.rpc('process_usage', { p_type: 'copywriting' }) as { data: any, error: any };
    if (usageError || (usageData && !usageData.success)) {
      const errMsg = usageData?.message || usageError?.message || 'Baki kredit tidak mencukupi untuk menjana strategi iklan.';
      throw new Error(errMsg.includes('kredit tidak mencukupi') || errMsg.includes('perlukan') ? `INSUFFICIENT_CREDITS: ${errMsg}` : errMsg);
    }
  }

  // Production: /api/replicate uses server-side REPLICATE_API_TOKEN (browser tidak perlu key).
  // Dev: kita perlu VITE_REPLICATE_API_TOKEN dalam .env untuk Vite proxy direct ke Replicate.
  let replicateKey = '';
  if (!isProduction()) {
    const key = getReplicateKey();
    if (!key) {
      throw new Error('Replicate API Key tidak ditemui untuk local dev. Sila tambah VITE_REPLICATE_API_TOKEN dalam .env.');
    }
    replicateKey = key;
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
    response = await fetch("/replicate-api/v1/models/anthropic/claude-4.5-sonnet/predictions", {
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
    console.error("Replicate Error (Ads Strategy):", response.status, errorText);
    throw new Error(`Gagal memanggil Claude (${response.status}): ${errorText.substring(0, 200)}`);
  }

  let prediction = await response.json();

  // If Prefer: wait timed out, poll until completion.
  // Production: /api/replicate handles polling server-side (lihat api/replicate.js).
  // Dev: kita poll terus via Vite proxy yang perlukan VITE_REPLICATE_API_TOKEN.
  if (!prediction.output && prediction.status !== 'succeeded') {
    if (isProduction()) {
      throw new Error(`Tiada output dari Claude. Status: ${prediction.status}, Error: ${prediction.error || 'none'}`);
    }
    const devKey = getReplicateKey();
    if (!devKey) {
      throw new Error('Polling memerlukan VITE_REPLICATE_API_TOKEN dalam .env untuk local dev.');
    }
    prediction = await pollPrediction(prediction, devKey);
  }

  if (!prediction.output) {
    throw new Error(`Tiada output dari Claude. Status: ${prediction.status}, Error: ${prediction.error || 'none'}`);
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
