import type { Diagram, DiagramNode, Edge } from "@uml-editor/shared";

export interface UseCaseScenario {
  id: string;
  code: string;
  name: string;
  actors: string[];
  description: string;
  precondition: string;
  postcondition: string;
  includes: string[];
  extends: string[];
  mainFlow: string[];
  alternativeFlows: { condition: string; action: string }[];
}

/**
 * Extracts structured Use Case Specifications from a Use Case diagram.
 */
export function extractUseCaseScenarios(diagram: Diagram): UseCaseScenario[] {
  if (!diagram || !diagram.nodes) return [];

  const usecases = diagram.nodes.filter((n) => n.type === "usecase");
  const actors = diagram.nodes.filter((n) => n.type === "actor");
  const edges = diagram.edges || [];

  return usecases.map((uc, index) => {
    const code = `UC-${String(index + 1).padStart(2, "0")}`;
    const name = uc.name || "Untitled Use Case";

    // Find linked actors
    const linkedActorNames: string[] = [];
    for (const edge of edges) {
      if (edge.target === uc.id) {
        const sourceActor = actors.find((a) => a.id === edge.source);
        if (sourceActor) linkedActorNames.push(sourceActor.name);
      } else if (edge.source === uc.id) {
        const targetActor = actors.find((a) => a.id === edge.target);
        if (targetActor) linkedActorNames.push(targetActor.name);
      }
    }

    const uniqueActors = Array.from(new Set(linkedActorNames));
    const actorStr = uniqueActors.length > 0 ? uniqueActors : ["Pengguna Terdaftar"];

    // Find includes and extends
    const includes: string[] = [];
    const extendsList: string[] = [];

    for (const edge of edges) {
      if (edge.source === uc.id) {
        const targetNode = diagram.nodes.find((n) => n.id === edge.target);
        if (targetNode) {
          if (edge.type === "include" || (edge.label?.text && edge.label.text.toLowerCase().includes("include"))) {
            includes.push(targetNode.name);
          } else if (edge.type === "extend" || (edge.label?.text && edge.label.text.toLowerCase().includes("extend"))) {
            extendsList.push(targetNode.name);
          }
        }
      } else if (edge.target === uc.id) {
        const sourceNode = diagram.nodes.find((n) => n.id === edge.source);
        if (sourceNode) {
          if (edge.type === "extend" || (edge.label?.text && edge.label.text.toLowerCase().includes("extend"))) {
            extendsList.push(sourceNode.name);
          }
        }
      }
    }

    // Generate intelligent default scenario flows based on usecase name semantics
    const lowerName = name.toLowerCase();
    let mainFlow: string[];
    let altFlows: { condition: string; action: string }[];
    let precondition = "Aktor telah mengakses sistem dan memiliki otorisasi yang sesuai.";
    let postcondition = "Data transaksi/aktivitas berhasil disimpan dan status sistem diperbarui.";

    if (lowerName.includes("login") || lowerName.includes("masuk")) {
      precondition = "Aktor berada pada halaman autentikasi dan akun sudah terdaftar.";
      postcondition = "Sesi aktif terbentuk dan aktor diarahkan ke dashboard utama.";
      mainFlow = [
        "Aktor memasukkan kredensial login (identitas dan kata sandi).",
        "Aktor menekan tombol Masuk / Login.",
        "Sistem memverifikasi kredensial terhadap basis data terenkripsi.",
        "Sistem menginisiasi token sesi dan mencatat log audit akses.",
        "Sistem mengarahkan aktor ke halaman beranda sesuai peran hak akses.",
      ];
      altFlows = [
        {
          condition: "Kredensial tidak cocok / tidak ditemukan",
          action: "Sistem menampilkan pesan 'Username atau Password salah' dan meminta input ulang.",
        },
        {
          condition: "Akun terkunci karena percobaan berulang",
          action: "Sistem menonaktifkan login sementara dan mengirim notifikasi keamanan.",
        },
      ];
    } else if (lowerName.includes("krs") || lowerName.includes("jadwal") || lowerName.includes("matakuliah") || lowerName.includes("mata kuliah")) {
      precondition = "Masa registrasi akademik/kegiatan aktif dan prasyarat akademik terpenuhi.";
      postcondition = "Daftar pilihan tersimpan resmi pada basis data akademik sistem.";
      mainFlow = [
        "Aktor memilih menu " + name + ".",
        "Sistem menampilkan daftar item yang tersedia beserta kuota dan prasyarat.",
        "Aktor memilih data yang diinginkan dan menekan tombol Konfirmasi.",
        "Sistem melakukan validasi aturan bisnis (bentrok jadwal, batas SKS, prasyarat).",
        "Sistem menyimpan data dan menampilkan bukti pendaftaran/pemilihan.",
      ];
      altFlows = [
        {
          condition: "Batas kapasitas/kuota atau jadwal bentrok",
          action: "Sistem memberikan peringatan visual dan menyarankan alternatif pilihan lain.",
        },
      ];
    } else if (lowerName.includes("cetak") || lowerName.includes("transkrip") || lowerName.includes("laporan")) {
      precondition = "Data historis telah tervalidasi dan siap digenerate.";
      postcondition = "Dokumen resmi siap cetak/unduh dalam format standar.";
      mainFlow = [
        "Aktor memilih menu " + name + " dan menentukan parameter filter periode.",
        "Sistem mengumpulkan dan mengagregasi data sesuai kriteria.",
        "Sistem merender pratinjau dokumen dengan watermark dan tanda tangan digital.",
        "Aktor menekan tombol Unduh PDF / Cetak.",
        "Sistem menghasilkan file dokumen keluaran resmi.",
      ];
      altFlows = [
        {
          condition: "Data pada periode yang diminta belum lengkap",
          action: "Sistem menampilkan pemberitahuan bahwa sebagian data masih dalam proses validasi.",
        },
      ];
    } else {
      mainFlow = [
        `Aktor mengakses fitur ${name} melalui menu utama antarmuka.`,
        "Sistem memuat formulir input dan data pendukung yang relevan.",
        "Aktor memasukkan atau memperbarui rincian informasi yang diperlukan.",
        "Sistem memvalidasi kelengkapan serta integritas data yang dikirimkan.",
        "Sistem menyimpan perubahan ke basis data dan menampilkan pesan konfirmasi sukses.",
      ];
      altFlows = [
        {
          condition: "Terdapat kolom wajib yang kosong atau format tidak valid",
          action: "Sistem menandai bidang formulir terkait dan menampilkan petunjuk perbaikan.",
        },
        {
          condition: "Koneksi ke server terputus",
          action: "Sistem menyimpan draf lokal dan menawarkan opsi sinkronisasi ulang.",
        },
      ];
    }

    return {
      id: uc.id,
      code,
      name,
      actors: actorStr,
      description: `Menyediakan mekanisme bagi ${actorStr.join(", ")} untuk memproses ${name.toLowerCase()} secara terstruktur dan terverifikasi.`,
      precondition,
      postcondition,
      includes,
      extends: extendsList,
      mainFlow,
      alternativeFlows: altFlows,
    };
  });
}

/**
 * Generates thesis-ready Markdown documentation containing formal Use Case specifications.
 */
export function generateUseCaseNarrativeMarkdown(diagram: Diagram): string {
  const scenarios = extractUseCaseScenarios(diagram);
  if (scenarios.length === 0) {
    return "# Spesifikasi Skenario Use Case\n\n*Tidak ada node use case yang terdeteksi dalam diagram ini.*";
  }

  const lines: string[] = [];
  lines.push(`# Dokumen Spesifikasi Skenario Use Case`);
  lines.push(`**Diagram**: ${diagram.name || "Use Case Diagram"}`);
  lines.push(`**Standar**: OMG UML 2.5 / Format Standar Bab 3 Skripsi & Rekayasa Perangkat Lunak`);
  lines.push(`**Total Use Case**: ${scenarios.length}`);
  lines.push(`**Tanggal**: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}\n`);
  lines.push(`---`);
  lines.push(`\n## 1. Daftar Ringkasan Use Case\n`);
  lines.push(`| Kode | Nama Use Case | Aktor Terlibat | Relasi Khusus |`);
  lines.push(`| :--- | :--- | :--- | :--- |`);

  for (const s of scenarios) {
    const rels: string[] = [];
    if (s.includes.length > 0) rels.push(`«include»: ${s.includes.join(", ")}`);
    if (s.extends.length > 0) rels.push(`«extend»: ${s.extends.join(", ")}`);
    const relText = rels.length > 0 ? rels.join("<br/>") : "-";
    lines.push(`| **${s.code}** | ${s.name} | ${s.actors.join(", ")} | ${relText} |`);
  }

  lines.push(`\n---\n`);
  lines.push(`## 2. Rincian Narasi Skenario Use Case\n`);

  for (const s of scenarios) {
    lines.push(`### ${s.code}: ${s.name}`);
    lines.push(`| Komponen | Penjelasan |`);
    lines.push(`| :--- | :--- |`);
    lines.push(`| **Nomor Use Case** | ${s.code} |`);
    lines.push(`| **Nama Use Case** | ${s.name} |`);
    lines.push(`| **Aktor** | ${s.actors.join(", ")} |`);
    lines.push(`| **Deskripsi Singkat** | ${s.description} |`);
    lines.push(`| **Prekondisi** | ${s.precondition} |`);
    lines.push(`| **Postkondisi** | ${s.postcondition} |`);

    if (s.includes.length > 0) {
      lines.push(`| **Include Relasi** | «include» ${s.includes.join(", ")} |`);
    }
    if (s.extends.length > 0) {
      lines.push(`| **Extend Relasi** | «extend» ${s.extends.join(", ")} |`);
    }

    lines.push(``);
    lines.push(`**Skenario Utama (Main Success Scenario):**`);
    s.mainFlow.forEach((step, idx) => {
      lines.push(`${idx + 1}. ${step}`);
    });

    if (s.alternativeFlows.length > 0) {
      lines.push(``);
      lines.push(`**Skenario Alternatif / Eksepsi:**`);
      s.alternativeFlows.forEach((alt, idx) => {
        lines.push(`- **Kondisi ${idx + 1} (${alt.condition})**: ${alt.action}`);
      });
    }

    lines.push(`\n---\n`);
  }

  return lines.join("\n");
}
