import {
  computeFlowNodeSize,
  type Diagram,
  type LayoutOptions,
} from "@uml-editor/shared";
import {
  layoutLayered,
  layoutLinear,
  layoutSequence,
  layoutForce,
  layoutGrid,
  layoutRadial,
} from "./strategies";

export type LayoutPreset =
  | "auto"
  | "layered"
  | "linear"
  | "force"
  | "grid"
  | "radial";

const DEFAULT_OPTIONS: LayoutOptions = {
  direction: "TB",
  nodeSpacing: 80,
  rankSpacing: 120,
  edgeRouting: "orthogonal",
};

/**
 * Layout engine facade.
 * All presets support all diagram types.
 * Sequence diagrams always use sequence layout for participants,
 * but other presets can still rearrange participant positions.
 */
export class LayoutEngine {
  private options: LayoutOptions;
  private preset: LayoutPreset;

  constructor(options?: Partial<LayoutOptions>, preset?: LayoutPreset) {
    this.options = { ...DEFAULT_OPTIONS, ...options };
    this.preset = preset || "auto";
  }

  layout(diagram: Diagram): Diagram {
    if (diagram.nodes.length === 0 && !diagram.participants?.length) {
      return diagram;
    }

    // Sequence diagrams: always layout participants, then apply preset to nodes if any
    if (diagram.type === "sequence") {
      return this.layoutSequenceDiagram(diagram);
    }

    // Normalize node sizes for flow/activity/state diagrams before computing positions
    const normalized = this.normalizeNodeSizes(diagram);

    // For all other diagrams, apply the selected preset
    if (this.preset === "auto") {
      return this.autoLayout(normalized);
    }
    return this.applyPreset(normalized, this.preset);
  }

  private normalizeNodeSizes(diagram: Diagram): Diagram {
    if (
      diagram.type !== "flowchart" &&
      diagram.type !== "activity" &&
      diagram.type !== "state"
    ) {
      return diagram;
    }

    const nodes = diagram.nodes.map((node) => {
      if (
        "attributes" in node ||
        "methods" in node ||
        node.type === "composite"
      ) {
        return node;
      }
      const fontSize = (node as any).style?.fontSize || 13;
      const optimalSize = computeFlowNodeSize(
        node.type,
        node.name || "",
        fontSize,
        diagram.type,
      );
      return { ...node, size: optimalSize };
    });

    return { ...diagram, nodes };
  }

  private hasBranching(diagram: Diagram): boolean {
    const outCounts = new Map<string, number>();
    for (const edge of diagram.edges) {
      outCounts.set(edge.source, (outCounts.get(edge.source) || 0) + 1);
      if ((outCounts.get(edge.source) || 0) > 1) return true;
    }
    return false;
  }

  private autoLayout(diagram: Diagram): Diagram {
    switch (diagram.type) {
      case "activity":
      case "flowchart":
        if (this.hasBranching(diagram)) {
          return layoutLayered(diagram, {
            ...this.options,
            rankSpacing: 96,
            nodeSpacing: 80,
          });
        }
        return layoutLinear(diagram, this.options);
      case "usecase":
        return layoutLayered(diagram, {
          ...this.options,
          direction: "LR",
          rankSpacing: 180,
          nodeSpacing: 70,
        });
      case "state":
        return layoutLayered(diagram, {
          ...this.options,
          direction: "LR",
          rankSpacing: 200,
          nodeSpacing: 90,
        });
      case "component":
        return layoutLayered(diagram, this.options);
      case "deployment":
        return layoutLayered(diagram, { ...this.options, rankSpacing: 150 });
      default:
        return layoutLayered(diagram, this.options);
    }
  }

  private applyPreset(diagram: Diagram, preset: LayoutPreset): Diagram {
    const isFlow =
      diagram.type === "flowchart" || diagram.type === "activity";
    switch (preset) {
      case "layered":
        return layoutLayered(
          diagram,
          isFlow
            ? { ...this.options, rankSpacing: 96, nodeSpacing: 80 }
            : this.options,
        );
      case "linear":
        return layoutLinear(diagram, this.options);
      case "force":
        return layoutForce(diagram, this.options);
      case "grid":
        return layoutGrid(diagram, this.options);
      case "radial":
        return layoutRadial(diagram, this.options);
      default:
        return layoutLayered(diagram, this.options);
    }
  }

  private layoutSequenceDiagram(diagram: Diagram): Diagram {
    // Always position participants horizontally
    let result = layoutSequence(diagram, this.options);

    // If there are also nodes (rare for sequence), layout them too
    if (result.nodes.length > 0 && this.preset !== "auto") {
      result = this.applyPreset(result, this.preset);
    }

    return result;
  }
}
