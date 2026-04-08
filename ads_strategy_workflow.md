# 📊 Modul Ads Creative & Strategy: Workflow & Decision Tree

Dokumen ini menerangkan aliran kerja (workflow) lengkap bermula daripada pengguna memasukkan data, sehinggalah bagaimana kepakaran AI menentukan corak keputusan (decision tree) untuk menghasilkan strategi pengiklanan yang tepat.

---

## 1. Keseluruhan Aliran Sistem / System Workflow

Berikut merupakan aliran data daripada pengguna (User) kepada Enjin AI dan kembali sebagai strategi yang visualisasinya disusun secara teratur (Accordion style).

```mermaid
flowchart TD
    A[Pengguna Buka Dashboard] --> B{Pilihan Modul}
    
    B -->|Tab 1: AI Sales Kit| C1[Isi Form: Produk, Audience, Harga]
    B -->|Tab 2: Ads Strategy| C2[Isi Form Ads: Produk, Target, Harga, Objektif]

    C1 -.->|Auto-Fill Sync| C2
    C2 -.->|Auto-Fill Sync| C1

    C2 --> D[Klik 'Jana Strategi Ads']
    D --> E((Modul AI:<br/>Claude 3.7 Endpoint))
    
    E --> F1[Penjanaan Format JSON Ketat]
    F1 --> F2[Arahan Pakar Digital Marketing]
    
    F2 --> G[Render ke Frontend]
    
    G --> H1[Section A: Ads Creative]
    G --> H2[Section B: Execution Plan]
    G --> H3[Section C: Scenarios & Timeline]
```

---

## 2. Decision Tree: Keputusan Di Sebalik Tabir (AI Logic)

Modul **Ads Creative & Strategy** bukanlah sekadar menjana teks rawak. Ia diarahkan oleh kerangka pemasaran *performance marketing* yang ketat membahagikannya kepada beberapa keputusan bersasar.

### 🎯 Section A: Ads Creative (Pemilihan Angle Iklan)
Berdasarkan deskripsi produk dan "Target Audience" pengguna, AI akan menjana 3 sudut iklan yang unik. Keputusan dibuat secara serentak mengikut tiga matlamat psikologi berbeza:

```mermaid
graph LR
    Input([Input Pengguna]) --> AI{Analisis Psikologi Audien}
    
    AI -->|Pain-Based| A1[Hook Isu Kritikal]
    A1 --> A2[Agitate/Tekan Kesakitan]
    A2 --> A3[Bawa Solusi & Call-to-Action]
    
    AI -->|Curiosity / AI-Angle| B1[Hook Misteri/AI]
    B1 --> B2[Cetus Rasa Ingin Tahu]
    B2 --> B3[Suruh Bertindak Untuk Rahsia]
    
    AI -->|Proof-Based| C1[Hook Hasil Terbukti]
    C1 --> C2[Cerita Kejayaan / Fakta]
    C2 --> C3[Bawa Solusi & Call-to-Action]
```

### 📈 Section B & Timeline: Strategi Fasa (Execution Engine)
Tindakan apa yang perlu dilakukan pada bila-bila masa tertentu sepanjang kempen berjalan.

1. **Fasa 1: EXPLORE (Hari 1 hingga Hari 3)**
   - **Tindakan Pokok**: Hanya biarkan algoritma mencari ruang jualan (Broad + Advantage+). Jangan ubah iklan.
2. **Fasa 2: CONTROL (Hari 4 hingga Hari 7)**
   - **Tindakan Pokok**: Mula buat optimasi sekiranya matriks prestasi turun; matikan iklan gagal (*Kill losers*).
3. **Fasa 3: SCALE (Minggu Ke-2 dan ke atas)**
   - **Tindakan Pokok**: Tambah bajet sekiranya margin tercapai, mula mencari kelompok serupa (Lookalike audience).

---

### 🧠 Section C: Scenario Action Generator (Trigger -> Action)

Ini adalah bahagian enjin diagnostik iklan bagi menyelesaikan masalah biasa pengguna yang tidak tahu punca ketiadaan untung. Ini adalah senario yang diprogramkan untuk AI pecahkan mengikut situasi:

```mermaid
graph TD
    Check[Pengguna Menganalisis Prestasi Ads] --> Q1{Bagaimana metrik CTR & ROAS?}
    
    Q1 -->|CTR Rendah < 1.5%| R1[Masalah: Iklan Lemah]
    R1 --> S1(💡 Tindakan: Tukar Hook/Visual, Betulkan Mesej)
    
    Q1 -->|CTR Tinggi tetapi Tiada Jualan| R2[Masalah: Landing Page Tidak Menyokong]
    R2 --> S2(💡 Tindakan: Perbaiki Headline & Call-to-Action pada sistem)
    
    Q1 -->|Ada Jualan tapi Kos CPI/CPA Tinggi| R3[Masalah: Funnel Kurang Optimum]
    R3 --> S3(💡 Tindakan: Uji 'Angle' baru & perkemaskan tawaran diskaun)
    
    Q1 -->|Iklan Padu & ROAS Tinggi| R4[Masalah: Pemenang Ditemui]
    R4 --> S4(💡 Tindakan: Scale bajet secara berperingkat per 20%)
```

## Kesimpulan

Gabungan di antara **Auto-Sync Input**, **Arahan Pengkhususan AI (3 Sudut Psikologi)**, dan **Output Diagnostik (Senario & Fasa)**, menjadikan modul ini seumpama sebuah agen perunding teknikal iklan yang lengkap di dalam poket pakar jualan (micro-entrepreneurs). Tiada beban visual kerana setiap modul diikat melalui kawalan Accordion moden.
