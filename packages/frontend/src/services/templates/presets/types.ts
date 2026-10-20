import type { Diagram } from "@uml-editor/shared";

export interface DiagramTemplate {
  id: string;
  name: string;
  description: string;
  category?: "academic" | "architecture" | "custom";
  tag?: string;
  isBuiltIn?: boolean;
  diagram: Diagram;
  dsl?: string;
  createdAt: string;
}
