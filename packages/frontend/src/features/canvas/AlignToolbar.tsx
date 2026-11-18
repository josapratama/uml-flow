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
    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-surface-2/95 backdrop-blur-md border border-border rounded-xl px-2.5 py-1.5 shadow-xl z-20 animate-in fade-in slide-in-from-bottom-2 duration-150">
      <span className="text-[11px] font-semibold text-text-muted mr-1">
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
      className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-surface-3 text-text hover:text-accent font-bold text-sm transition-colors"
    >
      {children}
    </button>
  );
}

function Sep() {
  return <div className="w-px h-4 bg-border/80 mx-0.5" />;
}
