import React, { useState } from "react";
import type { ClassNode } from "@uml-editor/shared";
import { useI18n } from "../../../i18n";

interface ClassPropertiesSectionProps {
  node: ClassNode;
  onAddAttribute?: (
    nodeId: string,
    name: string,
    type: string,
    visibility: string,
  ) => void;
  onAddMethod?: (
    nodeId: string,
    name: string,
    returnType: string,
    visibility: string,
  ) => void;
  onDeleteAttribute?: (nodeId: string, index: number) => void;
  onDeleteMethod?: (nodeId: string, index: number) => void;
}

export function ClassPropertiesSection({
  node,
  onAddAttribute,
  onAddMethod,
  onDeleteAttribute,
  onDeleteMethod,
}: ClassPropertiesSectionProps) {
  const { t, locale } = useI18n();
  const [addingAttr, setAddingAttr] = useState(false);
  const [addingMethod, setAddingMethod] = useState(false);
  const [attrName, setAttrName] = useState("");
  const [attrType, setAttrType] = useState("string");
  const [methodName, setMethodName] = useState("");
  const [methodReturn, setMethodReturn] = useState("void");

  const submitAttr = () => {
    if (attrName.trim() && onAddAttribute) {
      onAddAttribute(node.id, attrName.trim(), attrType, "+");
      setAttrName("");
      setAttrType("string");
      setAddingAttr(false);
    }
  };

  const submitMethod = () => {
    if (methodName.trim() && onAddMethod) {
      onAddMethod(node.id, methodName.trim(), methodReturn, "+");
      setMethodName("");
      setMethodReturn("void");
      setAddingMethod(false);
    }
  };

  return (
    <>
      <div className="pt-3 border-t border-border">
        <div className="flex justify-between items-center mb-2">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">
            {t("properties.attributes")} ({node.attributes.length})
          </div>
          {onAddAttribute && (
            <button
              onClick={() => setAddingAttr(true)}
              className="text-[10px] text-accent hover:text-accent-hover"
            >
              + {locale === "id" ? "Tambah" : "Add"}
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
                <span className="text-accent">{a.visibility}</span>
                {a.name}
                {a.type && (
                  <span className="text-text-muted/60">: {a.type}</span>
                )}
              </span>
              {onDeleteAttribute && (
                <button
                  onClick={() => onDeleteAttribute(node.id, i)}
                  className="opacity-0 group-hover:opacity-100 text-[9px] text-red-400 hover:text-red-300 transition-opacity"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
        {addingAttr && (
          <div className="mt-2 flex gap-1">
            <input
              value={attrName}
              onChange={(e) => setAttrName(e.target.value)}
              placeholder="name"
              className="flex-1 px-1.5 py-1 text-[11px] bg-surface-3 border border-border rounded outline-none text-text"
              onKeyDown={(e) => {
                if (e.key === "Enter") submitAttr();
                if (e.key === "Escape") setAddingAttr(false);
              }}
              autoFocus
            />
            <input
              value={attrType}
              onChange={(e) => setAttrType(e.target.value)}
              placeholder="type"
              className="w-16 px-1.5 py-1 text-[11px] bg-surface-3 border border-border rounded outline-none text-text"
              onKeyDown={(e) => {
                if (e.key === "Enter") submitAttr();
              }}
            />
            <button
              onClick={submitAttr}
              className="px-1.5 py-1 text-[10px] bg-accent text-white rounded"
            >
              ✓
            </button>
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-border">
        <div className="flex justify-between items-center mb-2">
          <div className="text-[10px] uppercase tracking-wider text-text-muted">
            {t("properties.methods")} ({node.methods.length})
          </div>
          {onAddMethod && (
            <button
              onClick={() => setAddingMethod(true)}
              className="text-[10px] text-accent hover:text-accent-hover"
            >
              + {locale === "id" ? "Tambah" : "Add"}
            </button>
          )}
        </div>
        <ul className="space-y-0.5 font-mono text-[11px]">
          {node.methods.map((m, i) => (
            <li
              key={i}
              className="flex justify-between items-center group text-text-muted"
            >
              <span>
                <span className="text-accent">{m.visibility}</span>
                {m.name}()
                <span className="text-text-muted/60">: {m.returnType}</span>
              </span>
              {onDeleteMethod && (
                <button
                  onClick={() => onDeleteMethod(node.id, i)}
                  className="opacity-0 group-hover:opacity-100 text-[9px] text-red-400 hover:text-red-300 transition-opacity"
                >
                  ✕
                </button>
              )}
            </li>
          ))}
        </ul>
        {addingMethod && (
          <div className="mt-2 flex gap-1">
            <input
              value={methodName}
              onChange={(e) => setMethodName(e.target.value)}
              placeholder="name"
              className="flex-1 px-1.5 py-1 text-[11px] bg-surface-3 border border-border rounded outline-none text-text"
              onKeyDown={(e) => {
                if (e.key === "Enter") submitMethod();
                if (e.key === "Escape") setAddingMethod(false);
              }}
              autoFocus
            />
            <input
              value={methodReturn}
              onChange={(e) => setMethodReturn(e.target.value)}
              placeholder="return"
              className="w-14 px-1.5 py-1 text-[11px] bg-surface-3 border border-border rounded outline-none text-text"
              onKeyDown={(e) => {
                if (e.key === "Enter") submitMethod();
              }}
            />
            <button
              onClick={submitMethod}
              className="px-1.5 py-1 text-[10px] bg-accent text-white rounded"
            >
              ✓
            </button>
          </div>
        )}
      </div>
    </>
  );
}
