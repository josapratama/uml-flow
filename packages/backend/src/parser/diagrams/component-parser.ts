import type { DiagramNode } from "@uml-editor/shared";
import { BaseDiagramParser } from "../base-parser";

/**
 * Parser for Component diagrams.
 *
 * DSL syntax:
 *   component "ComponentName"
 *   component "ComponentName" <<stereotype>>
 *   component "ComponentName" as alias
 *   interface "InterfaceName" provided
 *   interface "InterfaceName" required
 *   package "PackageName" { ... }
 *
 * Relations:
 *   ComponentA --> ComponentB
 *   ComponentA ..> ComponentB : dependency
 */
export class ComponentDiagramParser extends BaseDiagramParser {
  parseElement(): void {
    const token = this.currentToken();
    if (!token) return;

    if (token.type === "keyword") {
      switch (token.value) {
        case "component":
          this.parseComponent();
          return;
        case "interface":
          this.parseInterface();
          return;
        case "package":
          this.parsePackage();
          return;
      }
    }

    if (token.type === "identifier" || token.type === "string") {
      this.parseRelation();
      return;
    }
    this.advance();
  }

  private parseComponent(): void {
    this.advance();
    this.skipNewlines();

    const name =
      this.currentToken()?.type === "string"
        ? this.currentToken()!.value
        : this.currentToken()?.value || "Component";
    this.advance();
    this.skipNewlines();

    // Optional stereotype: <<stereotype>>
    let stereotype: string | undefined;
    if (
      this.currentToken()?.type === "symbol" &&
      this.currentToken()?.value?.startsWith("<<")
    ) {
      const raw = this.currentToken()!.value;
      stereotype = raw.replace(/^<<|>>$/g, "").trim();
      this.advance();
      this.skipNewlines();
    }

    // Optional alias: as aliasName
    let alias: string | undefined;
    if (this.currentToken()?.value === "as") {
      this.advance();
      this.skipNewlines();
      alias = this.currentToken()?.value;
      this.advance();
    }

    const id = `node_component_${name.replace(/\s+/g, "_")}`;
    let node = this.diagram.nodes.find((n) => n.id === id);
    if (!node) {
      node = {
        id,
        type: "component" as any,
        name,
        position: { x: 0, y: 0 },
        size: { width: Math.max(140, name.length * 9 + 40), height: 60 },
      } as any;
      if (stereotype) (node as any).stereotype = stereotype;
      this.diagram.nodes.push(node);
    }
    if (alias) {
      (node as any).alias = alias;
      this.aliasMap.set(alias, id);
    }
  }

  private parseInterface(): void {
    this.advance();
    this.skipNewlines();

    const name =
      this.currentToken()?.type === "string"
        ? this.currentToken()!.value
        : this.currentToken()?.value || "Interface";
    this.advance();
    this.skipNewlines();

    // Optional provided/required keyword
    let ifaceType: "interface-provided" | "interface-required" =
      "interface-provided";
    const kw = this.currentToken();
    if (kw?.type === "keyword" || kw?.type === "identifier") {
      if (kw.value === "required") {
        ifaceType = "interface-required";
        this.advance();
        this.skipNewlines();
      } else if (kw.value === "provided") {
        this.advance();
        this.skipNewlines();
      }
    }

    // Optional alias: as aliasName
    let alias: string | undefined;
    if (this.currentToken()?.value === "as") {
      this.advance();
      this.skipNewlines();
      alias = this.currentToken()?.value;
      this.advance();
    }

    const id = `node_iface_${name.replace(/\s+/g, "_")}`;
    let node = this.diagram.nodes.find((n) => n.id === id);
    if (!node) {
      node = {
        id,
        type: ifaceType as any,
        name,
        position: { x: 0, y: 0 },
        size: { width: 40, height: 40 },
      } as DiagramNode;
      this.diagram.nodes.push(node);
    }
    if (alias) {
      (node as any).alias = alias;
      this.aliasMap.set(alias, id);
    }
  }

  private parsePackage(): void {
    this.advance();
    this.skipNewlines();
    const _name =
      this.currentToken()?.type === "string"
        ? this.currentToken()!.value
        : this.currentToken()?.value || "Package";
    this.advance();
    // Skip into the block — just parse contents normally
    if (this.currentToken()?.value === "{") this.advance();
  }
}
