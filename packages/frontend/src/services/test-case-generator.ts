import type { Diagram, DiagramNode } from "@uml-editor/shared";
import { calculateDiagramMetrics } from "./diagram-metrics";

export interface TestCase {
  id: string;
  name: string;
  scenario: string;
  precondition: string;
  steps: string[];
  expectedResult: string;
  testType: "White-Box (Basis Path)" | "Black-Box (Functional)" | "Boundary Value";
  status: "Draft" | "Ready";
}

/**
 * Automatically generates a formal Test Case Specification Matrix from a diagram.
 * Supports Flowchart (Basis Paths & Decision branches), Sequence (Message sequence),
 * and Class/ERD (CRUD & Constraint validation).
 */
export function generateTestCases(diagram: Diagram): TestCase[] {
  if (!diagram) return [];

  const testCases: TestCase[] = [];
  let counter = 1;

  const padId = (n: number) => `TC-${String(n).padStart(3, "0")}`;

  if (diagram.type === "flowchart" || diagram.type === "activity" || diagram.type === "state") {
    const nodes = diagram.nodes || [];
    const edges = diagram.edges || [];
    const decisions = nodes.filter((n) => (n.type || "").toLowerCase() === "decision" || (n.type || "").toLowerCase() === "choice");
    const terminalNodes = nodes.filter((n) => ["end", "final", "terminal"].includes((n.type || "").toLowerCase()));
    const startNode = nodes.find((n) => ["start", "initial"].includes((n.type || "").toLowerCase())) || nodes[0];

    if (decisions.length > 0) {
      for (const dec of decisions) {
        const outEdges = edges.filter((e) => e.source === dec.id);

        for (let idx = 0; idx < outEdges.length; idx++) {
          const edge = outEdges[idx];
          const targetNode = nodes.find((n) => n.id === edge.target);
          const branchLabel = edge.label?.text || (edge as any).label || (idx === 0 ? "True / Ya" : "False / Tidak");
          const isNegative = /tidak|no|false|gagal|error|batal/i.test(String(branchLabel));

          testCases.push({
            id: padId(counter++),
            name: `Uji Percabangan '${dec.name}' - Jalur ${branchLabel}`,
            scenario: `Memverifikasi alur sistem saat kondisi '${dec.name}' bernilai ${branchLabel}`,
            precondition: `Sistem berada pada kondisi '${startNode?.name || "Awal"}' dan siap menerima input pengguna`,
            steps: [
              `1. Eksekusi alur proses dari '${startNode?.name || "Mulai"}'`,
              `2. Memasukkan parameter input untuk kondisi '${dec.name}'`,
              `3. Memilih/mengevaluasi cabang '${branchLabel}'`,
              `4. Melanjutkan alur menuju simpul '${targetNode?.name || "Tujuan"}'`,
            ],
            expectedResult: `Sistem berhasil diarahkan ke '${targetNode?.name || "Tahap Selanjutnya"}' tanpa exception atau deadlock`,
            testType: isNegative ? "Black-Box (Functional)" : "White-Box (Basis Path)",
            status: "Ready",
          });
        }
      }
    }

    // If no decisions or in addition, trace general execution path
    const metrics = calculateDiagramMetrics(diagram);
    testCases.push({
      id: padId(counter++),
      name: `Pengujian Jalur Normal End-to-End (${diagram.name})`,
      scenario: `Menguji alur lengkap dari '${startNode?.name || "Mulai"}' hingga '${terminalNodes[0]?.name || "Selesai"}'`,
      precondition: "Semua service dependensi aktif dan konfigurasi environment valid",
      steps: [
        `1. Inisialisasi proses pada '${startNode?.name || "Start"}'`,
        "2. Melalui semua tahapan proses utama secara berurutan",
        `3. Memastikan alur berakhir pada simpul '${terminalNodes[0]?.name || "End"}'`,
      ],
      expectedResult: `Seluruh ${metrics.totalNodes} node alur berhasil dilewati dan berakhir pada status sukses`,
      testType: "White-Box (Basis Path)",
      status: "Ready",
    });
  } else if (diagram.type === "sequence") {
    const msgs = [...(diagram.messages || [])].sort((a, b) => a.order - b.order);

    testCases.push({
      id: padId(counter++),
      name: `Pengujian Sekuensial Interaksi Layanan (${diagram.name})`,
      scenario: "Memverifikasi urutan transmisi pesan kronologis antar-komponen",
      precondition: "Partisipan aktor dan layanan target terdaftar dan terhubung dalam jaringan",
      steps: msgs.map((m) => `Langkah ${m.order}: Pesan "${m.label || "invokasi"}" dari '${m.from}' menuju '${m.to}' (${m.type})`),
      expectedResult: "Setiap pesan berhasil dikirim dan direspon sesuai urutan tanpa timeout",
      testType: "White-Box (Basis Path)",
      status: "Ready",
    });
  } else {
    // Class / ERD: Generate CRUD & Integrity Test Cases
    const entities = (diagram.nodes || []).filter((n) => (n.type as string) !== "note" && (n.type as string) !== "boundary");

    for (const ent of entities) {
      const attrs = (ent as any).attributes || [];
      const pk = attrs.find((a: any) => a.isPrimaryKey) || attrs[0];

      testCases.push(
        {
          id: padId(counter++),
          name: `Validasi Create & Simpan Entitas '${ent.name}'`,
          scenario: `Menguji persistensi data baru pada model '${ent.name}' dengan atribut lengkap`,
          precondition: "Koneksi repositori data aktif dan skema telah dimigrasi",
          steps: [
            `1. Menyiapkan payload data '${ent.name}' valid`,
            `2. Memanggil fungsi/metode persistensi entitas`,
            `3. Memeriksa identitas unik primary key '${pk?.name || "id"}'`,
          ],
          expectedResult: `Data '${ent.name}' berhasil tersimpan dengan primary key valid`,
          testType: "Black-Box (Functional)",
          status: "Ready",
        },
        {
          id: padId(counter++),
          name: `Validasi Integritas Unik / Batas '${ent.name}'`,
          scenario: `Menguji penolakan duplikasi atau pelanggaran constraint pada '${ent.name}'`,
          precondition: `Record '${ent.name}' dengan primary key atau field unik sudah ada di sistem`,
          steps: [
            `1. Mengirim payload '${ent.name}' dengan data identik duplikat`,
            "2. Memverifikasi respon validasi error dari sistem",
          ],
          expectedResult: "Sistem menolak operasi dengan kode error validasi dan tidak merusak database",
          testType: "Boundary Value",
          status: "Ready",
        }
      );
    }
  }

  return testCases;
}

/**
 * Export test cases as a formatted Markdown report table for thesis / QA documentation
 */
export function exportTestCasesMarkdown(diagram: Diagram, testCases: TestCase[]): string {
  let md = `# MATRIKS PENGUJIAN PERANGKAT LUNAK (TEST CASE MATRIX)\n`;
  md += `## Diagram Target: ${diagram.name} (${diagram.type.toUpperCase()})\n`;
  md += `*Digenerate otomatis oleh UML Flow Testing Suite pada ${new Date().toLocaleDateString("id-ID")}*\n\n`;

  md += `| Test Case ID | Nama Uji & Skenario | Tipe Uji | Langkah Pengujian | Hasil Diharapkan | Status |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  for (const tc of testCases) {
    const stepsFormatted = tc.steps.join("<br>");
    md += `| **${tc.id}** | **${tc.name}**<br>*${tc.scenario}* | \`${tc.testType}\` | ${stepsFormatted} | ${tc.expectedResult} | **${tc.status}** |\n`;
  }

  md += `\n\n### Ringkasan Rencana Uji\n`;
  md += `- **Total Skenario Uji:** ${testCases.length} Test Cases\n`;
  md += `- **Cakupan Pengujian:** White-Box Basis Path, Functional Black-Box, Boundary Value Analysis\n`;
  md += `- **Kesiapan Naskah Skripsi:** Sesuai standar Bab IV Pengujian dan Evaluasi Sistem.\n`;

  return md;
}
