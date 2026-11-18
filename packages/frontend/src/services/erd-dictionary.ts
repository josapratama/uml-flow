import type { Diagram } from "@uml-editor/shared";

export interface DataDictionaryField {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  isNullable: boolean;
  isUnique: boolean;
  references?: string;
  description: string;
}

export interface DataDictionaryTable {
  id: string;
  name: string;
  comment?: string;
  fields: DataDictionaryField[];
}

/**
 * Extracts structured data dictionary tables and attributes from an ERD diagram.
 */
export function extractDataDictionary(diagram: Diagram): DataDictionaryTable[] {
  if (!diagram || !diagram.nodes) return [];

  const entityNodes = diagram.nodes.filter(
    (n) => n.type === "entity" || n.type === "weak-entity" || ("attributes" in n && !("methods" in n)),
  );
  const edges = diagram.edges || [];

  return entityNodes.map((entity: any) => {
    const rawAttrs: any[] = entity.attributes || [];

    const fields: DataDictionaryField[] = rawAttrs.map((attr) => {
      const isPK = Boolean(attr.isPrimaryKey || attr.pk);
      const isFK = Boolean(attr.isForeignKey || attr.fk);
      const isNullable = Boolean(attr.isNullable);
      const isUnique = Boolean(attr.isUnique);
      const type = attr.type || "VARCHAR(255)";

      // Attempt to resolve FK reference from edges
      let references: string | undefined;
      if (isFK) {
        for (const e of edges) {
          if (e.source === entity.id || e.target === entity.id) {
            const otherId = e.source === entity.id ? e.target : e.source;
            const otherNode = diagram.nodes.find((n) => n.id === otherId);
            if (otherNode && otherNode.id !== entity.id) {
              references = otherNode.name;
              break;
            }
          }
        }
      }

      // Semantic description inference
      let desc = attr.comment || "";
      if (!desc) {
        const lower = (attr.name || "").toLowerCase();
        if (isPK) desc = `Primary Key unik untuk identifikasi entitas ${entity.name}`;
        else if (isFK) desc = `Foreign Key yang berelasi ke tabel ${references || "terkait"}`;
        else if (lower.includes("email")) desc = "Alamat surel resmi pengguna";
        else if (lower.includes("nama") || lower.includes("name")) desc = `Nama lengkap atau sebutan untuk ${entity.name}`;
        else if (lower.includes("created_at") || lower.includes("dibuat")) desc = "Waktu pencatatan data pertama kali";
        else if (lower.includes("updated_at") || lower.includes("diubah")) desc = "Waktu terakhir pembaruan record";
        else if (lower.includes("status")) desc = "Status operasional entitas";
        else if (lower.includes("telp") || lower.includes("phone")) desc = "Nomor telepon aktif";
        else if (lower.includes("harga") || lower.includes("price") || lower.includes("total")) desc = "Nilai nominal transaksi";
        else desc = `Informasi atribut ${attr.name}`;
      }

      return {
        name: attr.name || "id",
        type,
        isPrimaryKey: isPK,
        isForeignKey: isFK,
        isNullable,
        isUnique,
        references,
        description: desc,
      };
    });

    return {
      id: entity.id,
      name: entity.name,
      comment: entity.comment || `Tabel entitas master / transaksional untuk data ${entity.name}`,
      fields,
    };
  });
}

/**
 * Generates thesis-ready Markdown tables representing the complete Data Dictionary.
 */
export function generateDataDictionaryMarkdown(diagram: Diagram): string {
  const tables = extractDataDictionary(diagram);
  if (tables.length === 0) {
    return "# Kamus Data (Data Dictionary)\n\n*Tidak ada entitas ERD yang terdeteksi dalam diagram ini.*";
  }

  const lines: string[] = [];
  lines.push(`# Kamus Data Sistem (Data Dictionary)`);
  lines.push(`**Diagram**: ${diagram.name || "Entity Relationship Diagram (ERD)"}`);
  lines.push(`**Standar**: Bab 3 / 4 Perancangan Basis Data Skripsi & Rekayasa Perangkat Lunak`);
  lines.push(`**Total Tabel**: ${tables.length}`);
  lines.push(`**Tanggal Cetak**: ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}\n`);
  lines.push(`---`);

  tables.forEach((tbl, idx) => {
    lines.push(`\n### ${idx + 1}. Tabel \`${tbl.name}\``);
    lines.push(`- **Deskripsi Tabel**: ${tbl.comment}`);
    lines.push(`- **Jumlah Kolom**: ${tbl.fields.length}\n`);

    lines.push(`| No | Nama Kolom | Tipe Data | Kunci | Nullable | Keterangan |`);
    lines.push(`| :-: | :--- | :--- | :-: | :-: | :--- |`);

    tbl.fields.forEach((f, fIdx) => {
      const keys: string[] = [];
      if (f.isPrimaryKey) keys.push("**PK**");
      if (f.isForeignKey) keys.push(f.references ? `**FK** (${f.references})` : "**FK**");
      if (f.isUnique && !f.isPrimaryKey) keys.push("UQ");
      const keyStr = keys.length > 0 ? keys.join(", ") : "-";
      const nullStr = f.isNullable ? "NULL" : "**NOT NULL**";

      lines.push(
        `| ${fIdx + 1} | \`${f.name}\` | \`${f.type}\` | ${keyStr} | ${nullStr} | ${f.description} |`,
      );
    });

    lines.push(``);
  });

  return lines.join("\n");
}

/**
 * Generates CSV data for opening in Microsoft Excel or Google Sheets.
 */
export function generateDataDictionaryCSV(diagram: Diagram): string {
  const tables = extractDataDictionary(diagram);
  const rows: string[] = [
    `"Tabel","No","Nama Kolom","Tipe Data","Primary Key","Foreign Key","Nullable","Referensi","Keterangan"`,
  ];

  for (const tbl of tables) {
    tbl.fields.forEach((f, idx) => {
      rows.push(
        `"${tbl.name}","${idx + 1}","${f.name}","${f.type}","${f.isPrimaryKey ? "YES" : "NO"}","${f.isForeignKey ? "YES" : "NO"}","${f.isNullable ? "YES" : "NO"}","${f.references || "-"}","${f.description.replace(/"/g, '""')}"`,
      );
    });
  }

  return rows.join("\n");
}
