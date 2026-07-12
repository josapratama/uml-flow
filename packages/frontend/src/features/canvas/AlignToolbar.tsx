import React from "react";

interface Props {
  onAlign: (
    alignment: "left" | "center" | "right" | "top" | "middle" | "bottom",
  ) => void;
  onDistribute: (direction: "horizontal" | "vertical") => void;
  nodeCount: number;
}

/**
 * Floating toolbar that appears when multiple nodes are selected.
 * Provides align and distribute buttons.
 */
export function AlignToolbar({ onAlign, onDistribute, nodeCount }: Props) {
  if (nodeCount < 2) return null;

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-md z-10">
      <span className="text-[10px] text-slate-400 mr-1">
        {nodeCount} selected
      </span>
      <Sep />
      <Btn onClick={() => onAlign("left")} title="Align left">
        ⫷
      </Btn>
      <Btn onClick={() => onAlign("center")} title="Align center H">
        ⫿
      </Btn>
      <Btn onClick={() => onAlign("right")} title="Align right">
        ⫸
      </Btn>
      <Sep />
      <Btn onClick={() => onAlign("top")} title="Align top">
        ⊤
      </Btn>
      <Btn onClick={() => onAlign("middle")} title="Align center V">
        ⊝
      </Btn>
      <Btn onClick={() => onAlign("bottom")} title="Align bottom">
        ⊥
      </Btn>
      {nodeCount >= 3 && (
        <>
          <Sep />
          <Btn
            onClick={() => onDistribute("horizontal")}
            title="Distribute horizontally"
          >
            ⇔
          </Btn>
          <Btn
            onClick={() => onDistribute("vertical")}
            title="Distribute vertically"
          >
            ⇕
          </Btn>
        </>
      )}
    </div>
  );
}

function Btn({
  onClick,
  title,
  children,
}: {
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 text-sm"
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-5 bg-slate-200 mx-0.5" />;
}
