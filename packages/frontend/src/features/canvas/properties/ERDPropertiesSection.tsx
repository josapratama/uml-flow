import React, { useState } from "react";
import type { ERDEntity } from "@uml-editor/shared";
import { useI18n } from "../../../i18n";

interface ERDPropertiesSectionProps {
  node: ERDEntity;
  onAddColumn?: (
    nodeId: string,
    name: string,
    type: string,
    isPK: boolean,
    isFK: boolean,
    isNullable: boolean,
  ) => void;
  onDeleteColumn?: (nodeId: string, index: number) => void;
}

export function ERDPropertiesSection({
  node,
  onAddColumn,
  onDeleteColumn,
}: ERDPropertiesSectionProps) {
  const { t, locale } = useI18n();
  const isId = locale === "id";
  const [adding, setAdding] = useState(false);
  const [colName, setColName] = useState("");
  const [colType, setColType] = useState("VARCHAR");
  const [isPK, setIsPK] = useState(false);
  const [isFK, setIsFK] = useState(false);
  const [isNullable, setIsNullable] = useState(true);

  const submit = () => {
    if (colName.trim() && onAddColumn) {
      onAddColumn(node.id, colName.trim(), colType, isPK, isFK, isNullable);
      setColName("");
      setColType("VARCHAR");
      setIsPK(false);
      setIsFK(false);
      setIsNullable(true);
      setAdding(false);
    }
  };

  return (
    <div className="pt-3 border-t border-border">
      <div className="flex justify-between items-center mb-2">
        <div className="text-[10px] uppercase tracking-wider text-text-muted">
          {t("properties.columns")} ({node.attributes.length})
        </div>
        {onAddColumn && (
          <button
            onClick={() => setAdding(true)}
            className="text-[10px] text-accent hover:text-accent-hover"
          >
            + {isId ? "Tambah" : "Add"}
          </button>
        )}
      </div>
      <ul className="space-y-0.5 font-mono text-[11px]">
        {node.attributes.map((a, i) => (
          <li
            key={i}
            className="flex justify-between items-center group text-text-muted"
          >
            <span>
              {a.isPrimaryKey ? "🔑 " : a.isForeignKey ? "🔗 " : "   "}
              {a.name}
              <span className="text-text-muted/60">: {a.type}</span>
              {a.isNullable && <span className="text-text-muted/40"> ?</span>}
            </span>
            {onDeleteColumn && (
              <button
                onClick={() => onDeleteColumn(node.id, i)}
                className="opacity-0 group-hover:opacity-100 text-[9px] text-red-400 hover:text-red-300 transition-opacity"
              >
                ✕
              </button>
            )}
          </li>
        ))}
      </ul>
      {adding && (
        <div className="mt-2 space-y-1.5">
          <div className="flex gap-1">
            <input
              value={colName}
              onChange={(e) => setColName(e.target.value)}
              placeholder={isId ? "nama kolom" : "column name"}
              className="flex-1 px-1.5 py-1 text-[11px] bg-surface-3 border border-border rounded outline-none text-text"
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
                if (e.key === "Escape") setAdding(false);
              }}
              autoFocus
            />
            <input
              value={colType}
              onChange={(e) => setColType(e.target.value)}
              placeholder={isId ? "tipe data" : "type"}
              className="w-20 px-1.5 py-1 text-[11px] bg-surface-3 border border-border rounded outline-none text-text"
              onKeyDown={(e) => {
                if (e.key === "Enter") submit();
              }}
            />
          </div>
          <div className="flex gap-2 items-center text-[10px] text-text-muted">
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={isPK}
                onChange={(e) => setIsPK(e.target.checked)}
                className="w-3 h-3 accent-accent"
              />
              PK
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={isFK}
                onChange={(e) => setIsFK(e.target.checked)}
                className="w-3 h-3 accent-accent"
              />
              FK
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="checkbox"
                checked={isNullable}
                onChange={(e) => setIsNullable(e.target.checked)}
                className="w-3 h-3 accent-accent"
              />
              Null
            </label>
            <button
              onClick={submit}
              className="ml-auto px-2 py-0.5 text-[10px] bg-accent text-white rounded"
            >
              {isId ? "Tambah" : "Add"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
