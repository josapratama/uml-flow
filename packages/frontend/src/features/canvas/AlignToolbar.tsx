import React from "react";

interface Props {
  onAlign: (
    alignment: "left" | "center" | "right" | "top" | "middle" | "bottom",
  ) => void;
  onDistribute: (direction: "horizontal" | "vertical") => void;
  nodeCount: number;
}

import { useI18n } from "../../i18n";

export function AlignToolbar({ onAlign, onDistribute, nodeCount }: Props) {
  const { t } = useI18n();
  if (nodeCount < 2) return null;

  return (
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-0.5 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-md z-10">
      <span className="text-[10px] text-slate-400 mr-1">
        {nodeCount} {t("align.selected")}
      </span>
      <Sep />
      <Btn onClick={() => onAlign("left")} title={t("align.alignLeft")}>
        ⫷
      </Btn>
      <Btn onClick={() => onAlign("center")} title={t("align.alignCenterH")}>
        ⫿
      </Btn>
      <Btn onClick={() => onAlign("right")} title={t("align.alignRight")}>
        ⫸
      </Btn>
      <Sep />
      <Btn onClick={() => onAlign("top")} title={t("align.alignTop")}>
        ⊤
      </Btn>
      <Btn onClick={() => onAlign("middle")} title={t("align.alignCenterV")}>
        ⊝
      </Btn>
      <Btn onClick={() => onAlign("bottom")} title={t("align.alignBottom")}>
        ⊥
      </Btn>
      {nodeCount >= 3 && (
        <>
          <Sep />
          <Btn
            onClick={() => onDistribute("horizontal")}
            title={t("align.distributeH")}
          >
            ⇔
          </Btn>
          <Btn
            onClick={() => onDistribute("vertical")}
            title={t("align.distributeV")}
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
