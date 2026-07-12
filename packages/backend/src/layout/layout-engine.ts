import type { Diagram, LayoutOptions } from "@uml-editor/shared";
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

    // For all other diagrams, apply the selected preset
    if (this.preset === "auto") {
      return this.autoLayout(diagram);
    }
    return this.applyPreset(diagram, this.preset);
  }

  private autoLayout(diagram: Diagram): Diagram {
    switch (diagram.type) {
      case "activity":
      case "flowchart":
        return layoutLinear(diagram, this.options);
      case "usecase":
        // Use case works well with force layout
        return layoutForce(diagram, this.options);
      case "state":
        return layoutLayered(diagram, { ...this.options, direction: "LR" });
      case "component":
        return layoutLayered(diagram, this.options);
      case "deployment":
        return layoutLayered(diagram, { ...this.options, rankSpacing: 150 });
      default:
        return layoutLayered(diagram, this.options);
    }
  }

  private applyPreset(diagram: Diagram, preset: LayoutPreset): Diagram {
    switch (preset) {
      case "layered":
        return layoutLayered(diagram, this.options);
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
