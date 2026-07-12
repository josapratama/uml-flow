import React, { useState } from "react";
import type { DiagramNode, ClassNode, ERDEntity } from "@uml-editor/shared";

interface Props {
  node: DiagramNode;
  onClose: () => void;
  onOpenStyle?: () => void;
  onOpenGlobalStyle?: () => void;
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
  onAddERDColumn?: (
    nodeId: string,
    name: string,
    type: string,
    isPK: boolean,
    isFK: boolean,
    isNullable: boolean,
  ) => void;
  onDeleteERDColumn?: (nodeId: string, index: number) => void;
}

export function PropertyPanel({
  node,
  onClose,
  onOpenStyle,
  onOpenGlobalStyle,
  onAddAttribute,
  onAddMethod,
  onDeleteAttribute,
  onDeleteMethod,
  onAddERDColumn,
  onDeleteERDColumn,
}: Props) {
  return (
    <div className="absolute right-0 top-0 bottom-0 w-72 bg-surface-2 border-l border-border overflow-y-auto z-20 shadow-xl">
      <div className="flex justify-between items-center px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-text">Properties</h3>
        <div className="flex gap-1">
          {onOpenGlobalStyle && (
            <button
              onClick={onOpenGlobalStyle}
              className="px-2 py-1 text-[10px] bg-surface-3 border border-border rounded text-text-muted hover:text-accent hover:border-accent transition-colors"
              title="Style all nodes"
            >
              🌐 All
            </button>
          )}
          {onOpenStyle && (
            <button
              onClick={onOpenStyle}
              className="px-2 py-1 text-[10px] bg-surface-3 border border-border rounded text-text-muted hover:text-accent hover:border-accent transition-colors"
              title="Style this node"
            >
              🎨 This
            </button>
          )}
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded text-text-muted hover:bg-surface-3 hover:text-text transition-colors"
          >
            ×
          </button>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <PropRow label="Type">
          <span className="px-2 py-0.5 bg-surface-3 rounded text-[11px] text-accent">
            {node.type}
          </span>
        </PropRow>
        <PropRow label="Name">{node.name}</PropRow>
        <PropRow label="Position">
          x: {Math.round(node.position.x)}, y: {Math.round(node.position.y)}
        </PropRow>
        <PropRow label="Size">
          {node.size.width} × {node.size.height}
        </PropRow>

        {"attributes" in node && "methods" in node && (
          <ClassProps
            node={node as ClassNode}
            onAddAttribute={onAddAttribute}
            onAddMethod={onAddMethod}
            onDeleteAttribute={onDeleteAttribute}
            onDeleteMethod={onDeleteMethod}
          />
        )}
        {"attributes" in node && !("methods" in node) && (
          <ERDProps
            node={node as ERDEntity}
            onAddColumn={onAddERDColumn}
            onDeleteColumn={onDeleteERDColumn}
          />
        )}
      </div>
    </div>
  );
}

function PropRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-text-muted mb-0.5">
        {label}
      </div>
      <div className="text-xs text-text">{children}</div>
    </div>
  );
}

function ClassProps({
  node,
  onAddAttribute,
  onAddMethod,
  onDeleteAttribute,
  onDeleteMethod,
}: {
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
}) {
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
            Attributes ({node.attributes.length})
          </div>
          {onAddAttribute && (
            <button
              onClick={() => setAddingAttr(true)}
              className="text-[10px] text-accent hover:text-accent-hover"
            >
              + Add
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
            Methods ({node.methods.length})
          </div>
          {onAddMethod && (
            <button
              onClick={() => setAddingMethod(true)}
              className="text-[10px] text-accent hover:text-accent-hover"
            >
              + Add
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

function ERDProps({
  node,
  onAddColumn,
  onDeleteColumn,
}: {
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
}) {
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
          Columns ({node.attributes.length})
        </div>
        {onAddColumn && (
          <button
            onClick={() => setAdding(true)}
            className="text-[10px] text-accent hover:text-accent-hover"
          >
            + Add
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
              placeholder="column name"
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
              placeholder="type"
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
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
