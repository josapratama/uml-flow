import type { DiagramNode } from "@uml-editor/shared";
import { BaseDiagramParser } from "../base-parser";

/**
 * Parser for Deployment diagrams.
 *
 * DSL syntax:
 *   node "NodeName"
 *   node "NodeName" <<stereotype>>
 *   device "DeviceName"
 *   artifact "ArtifactName"
 *   component "ComponentName"
 *
 * Relations:
 *   NodeA --> NodeB : deploy
 *   NodeA ..> ArtifactA : manifest
 */
export class DeploymentDiagramParser extends BaseDiagramParser {
  parseElement(): void {
    const token = this.currentToken();
    if (!token) return;

    if (token.type === "keyword") {
      switch (token.value) {
        case "node":
          this.parseDeployNode("node");
          return;
        case "device":
          this.parseDeployNode("device");
          return;
        case "artifact":
          this.parseDeployNode("artifact");
          return;
        case "component":
          this.parseDeployNode("component");
          return;
      }
    }

    if (token.type === "identifier" || token.type === "string") {
      this.parseRelation();
      return;
    }
    this.advance();
  }

  private parseDeployNode(nodeType: string): void {
    this.advance();
    this.skipNewlines();

    const name =
      this.currentToken()?.type === "string"
        ? this.currentToken()!.value
        : this.currentToken()?.value ||
          nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
    this.advance();

    // Optional stereotype: <<stereotype>>
    let stereotype: string | undefined;
    if (
      this.currentToken()?.type === "symbol" &&
      this.currentToken()?.value?.startsWith("<<")
    ) {
      const raw = this.currentToken()!.value;
      stereotype = raw.replace(/^<<|>>$/g, "").trim();
      this.advance();
    }

    // Skip optional block
    if (this.currentToken()?.value === "{") this.advance();

    const id = `node_${nodeType}_${name.replace(/\s+/g, "_")}`;
    if (!this.diagram.nodes.find((n) => n.id === id)) {
      const sizeMap: Record<string, { w: number; h: number }> = {
        node: { w: 160, h: 70 },
        device: { w: 160, h: 70 },
        artifact: { w: 130, h: 50 },
        component: { w: 140, h: 55 },
      };
      const sz = sizeMap[nodeType] || { w: 140, h: 60 };
      const node: DiagramNode = {
        id,
        type: nodeType as any,
        name,
        position: { x: 0, y: 0 },
        size: { width: Math.max(sz.w, name.length * 9 + 40), height: sz.h },
      } as any;
      if (stereotype) (node as any).stereotype = stereotype;
      this.diagram.nodes.push(node);
    }
  }
}
