import React from "react";

export interface SyntaxRow {
  symbol: string;
  keyword: string;
  description: string;
  example: string;
}

interface DocSyntaxTableProps {
  title?: string;
  rows: SyntaxRow[];
}

export function DocSyntaxTable({ title, rows }: DocSyntaxTableProps) {
  return (
    <div className="my-5 overflow-hidden rounded-xl border border-border/80 bg-surface-2/60 backdrop-blur-xs shadow-md">
      {title && (
        <div className="px-4 py-2 bg-surface-3/60 border-b border-border/60 text-xs font-semibold text-text">
          {title}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-surface-3/30 border-b border-border text-[11px] uppercase tracking-wider text-text-muted">
              <th className="py-2.5 px-3.5 font-semibold">Simbol / Keyword</th>
              <th className="py-2.5 px-3.5 font-semibold">Tipe / Makna</th>
              <th className="py-2.5 px-3.5 font-semibold">Contoh Penulisan</th>
              <th className="py-2.5 px-3.5 font-semibold">Keterangan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50 font-mono">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-surface-3/40 transition-colors">
                <td className="py-2.5 px-3.5 font-bold text-accent">
                  <code>{row.symbol}</code>
                </td>
                <td className="py-2.5 px-3.5 font-sans font-medium text-text">
                  {row.keyword}
                </td>
                <td className="py-2.5 px-3.5 text-text-muted">
                  <code className="px-1.5 py-0.5 rounded bg-surface-3 border border-border/50 text-[11px]">
                    {row.example}
                  </code>
                </td>
                <td className="py-2.5 px-3.5 font-sans text-text-muted">
                  {row.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
