import type { Diagram } from "@uml-editor/shared";

export interface CrudCell {
  C: boolean;
  R: boolean;
  U: boolean;
  D: boolean;
}

export interface CrudMatrix {
  processes: string[];
  entities: string[];
  matrix: Record<string, Record<string, CrudCell>>;
}

const CRUD_VERBS = {
  create: [
    "tambah", "buat", "daftar", "registrasi", "input", "simpan", "unggah",
    "pesan", "checkout", "transaksi", "ajukan", "create", "add", "register",
    "new", "insert", "save", "upload", "order", "submit", "apply", "booking",
  ],
  read: [
    "lihat", "tampil", "baca", "cari", "cek", "monitoring", "laporan",
    "cetak", "rekap", "verifikasi", "login", "autentikasi", "read", "view",
    "get", "list", "search", "find", "check", "report", "print", "verify",
    "auth", "detail", "reviu", "review",
  ],
  update: [
    "ubah", "edit", "perbarui", "update", "ganti", "reset", "validasi",
    "konfirmasi", "setujui", "approve", "modify", "change",
    "bayar", "kembali",
  ],
  delete: [
    "hapus", "batal", "delete", "drop", "remove", "cancel", "arsip",
    "archive", "nonaktif",
  ],
  manage: [
    "kelola", "manajemen", "olah", "manage", "crud", "administer", "master",
  ],
};

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").trim();
}

/**
 * Extracts processes/use cases and entities from diagram and generates an initial CRUD matrix.
 * Prioritizes actual diagram connections (edges) between process/use case nodes and entity/database nodes.
 */
export function extractCrudMatrix(diagram: Diagram): CrudMatrix {
  // 1. Extract Processes
  let processes: string[] = [];

  const usecaseNodes = diagram.nodes.filter((n) => n.type === "usecase");
  const flowNodes = diagram.nodes.filter((n) =>
    ["process", "action", "task", "step"].includes(n.type)
  );
  const generalNodes = diagram.nodes.filter(
    (n) =>
      !["actor", "system", "database", "entity", "class", "interface", "note", "start", "end", "initial", "final", "fork", "join"].includes(
        n.type
      )
  );

  if (usecaseNodes.length > 0) {
    processes = usecaseNodes.map((n) => n.name.trim());
  } else if (flowNodes.length > 0) {
    processes = flowNodes.map((n) => n.name.trim());
  } else if (generalNodes.length > 0) {
    processes = generalNodes.map((n) => n.name.trim());
  }

  // Deduplicate processes
  processes = Array.from(new Set(processes)).filter(Boolean);
  if (processes.length === 0) {
    processes = [
      "Registrasi & Login Akun",
      "Kelola Data Master",
      "Pemrosesan Transaksi",
      "Cetak Laporan & Monitoring",
    ];
  }

  // 2. Extract Entities
  let entities: string[] = [];

  // Direct entity / class / database nodes
  const explicitEntities = diagram.nodes
    .filter((n) => ["entity", "class", "database"].includes(n.type))
    .map((n) => n.name.trim());

  if (explicitEntities.length > 0) {
    entities = explicitEntities;
  } else {
    // Infer entities from process names
    const inferredSet = new Set<string>();

    for (const p of processes) {
      const clean = p.replace(/\(.*?\)/g, "").trim();
      // Match patterns like "Kelola Data Pengguna", "Pemesanan Kamar", "Input Nilai Siswa"
      const match = clean.match(
        /(?:kelola|manajemen|data|input|tambah|ubah|hapus|lihat|cetak|proses|pendaftaran|pemesanan|pembayaran)\s+(?:data\s+)?([A-Za-z0-9_]+(?:\s+[A-Za-z0-9_]+)?)/i
      );
      if (match && match[1]) {
        const candidate = match[1].trim();
        const lower = candidate.toLowerCase();
        if (
          lower.length > 2 &&
          !["dan", "atau", "secara", "oleh", "pada", "untuk", "dengan", "sistem"].includes(lower)
        ) {
          const capitalized = candidate.charAt(0).toUpperCase() + candidate.slice(1);
          inferredSet.add(capitalized);
        }
      }
    }

    // Common domain entity keywords found anywhere in process names (word boundary checked)
    const domainKeywords = [
      "User", "Pengguna", "Admin", "Member", "Pelanggan", "Nasabah",
      "Mahasiswa", "Dosen", "Siswa", "Pegawai", "Karyawan",
      "Produk", "Barang", "Kategori", "Buku", "Kamar", "Tiket", "Layanan",
      "Transaksi", "Pesanan", "Pemesanan", "Peminjaman", "Pembayaran", "Tagihan",
      "Laporan", "Rekap", "Jadwal", "Nilai", "Presensi",
    ];

    for (const kw of domainKeywords) {
      const lowerKw = kw.toLowerCase();
      const kwRegex = new RegExp(`\\b${lowerKw}\\b`, "i");
      const found = processes.some((p) => kwRegex.test(normalizeText(p)));
      if (found) {
        inferredSet.add(kw);
      }
    }

    entities = Array.from(inferredSet);
  }

  entities = Array.from(new Set(entities)).filter(Boolean);
  if (entities.length === 0) {
    entities = ["User", "Data Master", "Transaksi", "Laporan"];
  }

  // 3. Build Graph Edge Connections between processes and entities
  const edgeConnections = new Set<string>();
  const edgeStereotypes = new Map<string, string>();

  for (const edge of diagram.edges || []) {
    const srcNode = diagram.nodes?.find((n) => n.id === edge.source);
    const tgtNode = diagram.nodes?.find((n) => n.id === edge.target);
    if (srcNode && tgtNode) {
      const srcName = srcNode.name.trim().toLowerCase();
      const tgtName = tgtNode.name.trim().toLowerCase();
      const key1 = `${srcName}::${tgtName}`;
      const key2 = `${tgtName}::${srcName}`;
      edgeConnections.add(key1);
      edgeConnections.add(key2);
      const edgeLabel = typeof edge.label === "string" ? edge.label : edge.label?.text || "";
      if (edgeLabel) {
        edgeStereotypes.set(key1, edgeLabel.toLowerCase());
        edgeStereotypes.set(key2, edgeLabel.toLowerCase());
      }
    }
  }

  // 4. Build Matrix & Apply CRUD Heuristics
  const matrix: Record<string, Record<string, CrudCell>> = {};

  for (const proc of processes) {
    matrix[proc] = {};
    const normP = normalizeText(proc);

    const isManage = CRUD_VERBS.manage.some((v) => new RegExp(`\\b${v}\\b`, "i").test(normP));
    const hasC = isManage || CRUD_VERBS.create.some((v) => new RegExp(`\\b${v}\\b`, "i").test(normP));
    const hasR = isManage || CRUD_VERBS.read.some((v) => new RegExp(`\\b${v}\\b`, "i").test(normP));
    const hasU = isManage || CRUD_VERBS.update.some((v) => new RegExp(`\\b${v}\\b`, "i").test(normP));
    const hasD = isManage || CRUD_VERBS.delete.some((v) => new RegExp(`\\b${v}\\b`, "i").test(normP));

    for (const ent of entities) {
      const normE = normalizeText(ent);

      const isConnectedByEdge = edgeConnections.has(`${proc.toLowerCase()}::${ent.toLowerCase()}`);
      const edgeLabel = edgeStereotypes.get(`${proc.toLowerCase()}::${ent.toLowerCase()}`) || "";

      let cellC = false;
      let cellR = false;
      let cellU = false;
      let cellD = false;

      // If diagram edge has explicit CRUD labels
      if (edgeLabel) {
        if (/create|tambah|simpan|\bc\b/i.test(edgeLabel)) cellC = true;
        if (/read|lihat|baca|tampil|\br\b/i.test(edgeLabel)) cellR = true;
        if (/update|ubah|edit|\bu\b/i.test(edgeLabel)) cellU = true;
        if (/delete|hapus|batal|\bd\b/i.test(edgeLabel)) cellD = true;
        if (/crud/i.test(edgeLabel)) {
          cellC = true;
          cellR = true;
          cellU = true;
          cellD = true;
        }
      }

      // Word boundary matching
      const isEntityMentioned =
        new RegExp(`\\b${normE}\\b`, "i").test(normP) ||
        (normE === "user" && /\b(pengguna|akun|login|registrasi)\b/i.test(normP)) ||
        (normE === "pengguna" && /\b(user|akun|login)\b/i.test(normP)) ||
        (normE === "transaksi" && /\b(pesan|bayar|pinjam|checkout)\b/i.test(normP)) ||
        (normE === "laporan" && /\b(rekap|cetak|monitoring)\b/i.test(normP));

      if (!cellC && !cellR && !cellU && !cellD) {
        if (isConnectedByEdge || isEntityMentioned) {
          cellC = hasC || isManage;
          cellR = hasR || isManage || (!hasC && !hasU && !hasD);
          cellU = hasU || isManage;
          cellD = hasD || isManage;
        }
      }

      matrix[proc][ent] = {
        C: cellC,
        R: cellR,
        U: cellU,
        D: cellD,
      };
    }

    // Safety fallback: if no entity matched, default to the first relevant entity
    const anyActive = entities.some(
      (ent) =>
        matrix[proc][ent].C ||
        matrix[proc][ent].R ||
        matrix[proc][ent].U ||
        matrix[proc][ent].D
    );
    if (!anyActive && entities.length > 0) {
      matrix[proc][entities[0]] = {
        C: hasC,
        R: hasR || (!hasC && !hasU && !hasD),
        U: hasU,
        D: hasD,
      };
    }
  }

  return { processes, entities, matrix };
}

/** Formats a CrudCell into human readable shorthand: "C R U D", "C R", or "-" */
export function formatCrudCell(cell?: CrudCell): string {
  if (!cell) return "-";
  const parts: string[] = [];
  if (cell.C) parts.push("C");
  if (cell.R) parts.push("R");
  if (cell.U) parts.push("U");
  if (cell.D) parts.push("D");
  return parts.length > 0 ? parts.join("") : "-";
}

/** Exports the CRUD Matrix as GitHub Flavored Markdown table */
export function exportCrudMatrixMarkdown(
  data: CrudMatrix,
  diagramTitle = "Sistem Informasi"
): string {
  const { processes, entities, matrix } = data;
  const lines: string[] = [];

  lines.push(`### Matriks CRUD (Proses × Entitas): ${diagramTitle}`);
  lines.push("");
  lines.push("> **Keterangan:**");
  lines.push("> - **C** : *Create* (Membuat atau mendaftarkan data baru)");
  lines.push("> - **R** : *Read* (Membaca, menampilkan, atau mencari data)");
  lines.push("> - **U** : *Update* (Mengubah atau memperbarui status data)");
  lines.push("> - **D** : *Delete* (Menghapus atau membatalkan data)");
  lines.push("");

  // Table header
  const headerCols = ["No", "Proses / Use Case", ...entities];
  lines.push(`| ${headerCols.join(" | ")} |`);
  lines.push(`| ${headerCols.map((_, i) => (i === 0 ? ":---:" : i === 1 ? ":---" : ":---:")).join(" | ")} |`);

  // Table rows
  processes.forEach((proc, idx) => {
    const rowVals = [
      String(idx + 1),
      `**${proc}**`,
      ...entities.map((ent) => formatCrudCell(matrix[proc]?.[ent])),
    ];
    lines.push(`| ${rowVals.join(" | ")} |`);
  });

  lines.push("");
  return lines.join("\n");
}

/** Exports the CRUD Matrix as CSV */
export function exportCrudMatrixCSV(data: CrudMatrix): string {
  const { processes, entities, matrix } = data;
  const lines: string[] = [];

  const escapeCsv = (str: string) => `"${str.replace(/"/g, '""')}"`;

  lines.push(["No", "Proses / Use Case", ...entities].map(escapeCsv).join(","));

  processes.forEach((proc, idx) => {
    const rowVals = [
      String(idx + 1),
      proc,
      ...entities.map((ent) => formatCrudCell(matrix[proc]?.[ent])),
    ];
    lines.push(rowVals.map(escapeCsv).join(","));
  });

  return lines.join("\r\n");
}

/** Exports the CRUD Matrix as Excel-ready HTML table document (.xls compatible) */
export function exportCrudMatrixExcel(data: CrudMatrix, diagramTitle = "Sistem Informasi"): string {
  const { processes, entities, matrix } = data;
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Matriks CRUD</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
  <style>
    th { background-color: #f1f5f9; color: #1e293b; font-weight: bold; border: 1px solid #cbd5e1; padding: 8px; text-align: center; }
    td { border: 1px solid #cbd5e1; padding: 6px; }
    .proc-col { text-align: left; font-weight: 600; }
    .center-col { text-align: center; }
  </style>
</head>
<body>
  <h2>Matriks CRUD (Proses &times; Entitas): ${diagramTitle}</h2>
  ${exportCrudMatrixHTML(data)}
</body>
</html>`;
}

/** Exports the CRUD Matrix as styled HTML table */
export function exportCrudMatrixHTML(data: CrudMatrix): string {
  const { processes, entities, matrix } = data;
  let html = `<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:12px;text-align:center;">\n`;
  html += `  <thead>\n    <tr style="background:#f1f5f9;font-weight:bold;">\n`;
  html += `      <th style="width:40px;">No</th>\n`;
  html += `      <th style="text-align:left;min-width:180px;">Proses / Use Case</th>\n`;
  for (const ent of entities) {
    html += `      <th>${ent}</th>\n`;
  }
  html += `    </tr>\n  </thead>\n  <tbody>\n`;

  processes.forEach((proc, idx) => {
    const bg = idx % 2 === 0 ? "#ffffff" : "#f8fafc";
    html += `    <tr style="background:${bg};">\n`;
    html += `      <td>${idx + 1}</td>\n`;
    html += `      <td style="text-align:left;font-weight:600;">${proc}</td>\n`;
    for (const ent of entities) {
      const val = formatCrudCell(matrix[proc]?.[ent]);
      const color = val !== "-" ? "#2563eb" : "#94a3b8";
      const fw = val !== "-" ? "bold" : "normal";
      html += `      <td style="color:${color};font-weight:${fw};">${val}</td>\n`;
    }
    html += `    </tr>\n`;
  });

  html += `  </tbody>\n</table>`;
  return html;
}
