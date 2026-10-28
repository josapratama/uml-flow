import type { ClassNode, UMLMethod } from "@uml-editor/shared";
import { BaseDiagramParser } from "../base-parser";

export class ClassDiagramParser extends BaseDiagramParser {
  parseElement(): void {
    const token = this.currentToken();
    if (!token) return;

    if (token.type === "keyword") {
      switch (token.value) {
        case "class":
          this.parseClass("class");
          return;
        case "interface":
          this.parseClass("interface");
          return;
        case "abstract":
          this.advance();
          this.skipNewlines();
          if (this.currentToken()?.value === "class")
            this.parseClass("abstract");
          return;
        case "enum":
          this.parseEnum();
          return;
      }
    }
    if (token.type === "identifier" || token.type === "string") {
      this.parseRelation();
      return;
    }
    this.advance();
  }

  private parseClass(classType: "class" | "interface" | "abstract"): void {
    this.advance();
    this.skipNewlines();
    const nameToken = this.currentToken();
    if (
      !nameToken ||
      (nameToken.type !== "identifier" && nameToken.type !== "string")
    ) {
      this.addError("Expected class name");
      return;
    }
    const name = nameToken.value;
    this.advance();
    this.skipNewlines();

    const existingNode = this.diagram.nodes.find(
      (n) => n.name === name && n.type === classType,
    ) as ClassNode | undefined;

    const node: ClassNode = existingNode || {
      id: `node_${name}_${this.diagram.nodes.length}`,
      type: classType,
      name,
      position: { x: 0, y: 0 },
      size: { width: 200, height: 100 },
      attributes: [],
      methods: [],
    };

    if (this.currentToken()?.value === "{") {
      this.advance();
      this.skipNewlines();
      while (
        this.pos < this.tokens.length &&
        this.currentToken()?.value !== "}"
      ) {
        this.skipNewlines();
        if (this.currentToken()?.value === "}") break;
        if (this.currentToken()?.type === "visibility") {
          this.parseMember(node);
        } else if (
          this.currentToken()?.type === "identifier" ||
          this.currentToken()?.type === "keyword"
        ) {
          this.parseMemberNoVis(node, classType === "interface" ? "+" : "-");
        } else {
          this.advance();
        }
        this.skipNewlines();
      }
      if (this.currentToken()?.value === "}") this.advance();
    }

    this.calculateSize(node);
    if (!existingNode) {
      this.diagram.nodes.push(node);
    }
  }

  private parseMember(node: ClassNode): void {
    const vis = this.currentToken()!.value as "+" | "-" | "#" | "~";
    this.advance();
    let isStatic = false;
    if (this.currentToken()?.value === "static") {
      isStatic = true;
      this.advance();
    }
    const nameToken = this.currentToken();
    if (
      !nameToken ||
      (nameToken.type !== "identifier" && nameToken.type !== "keyword")
    ) {
      this.skipToNewline();
      return;
    }
    const name = nameToken.value;
    this.advance();

    if (this.currentToken()?.value === "(") {
      node.methods.push(this.parseMethodSig(vis, name, isStatic));
    } else {
      let type = "any";
      if (this.currentToken()?.value === ":") {
        this.advance();
        type = this.readType();
      }
      node.attributes.push({ visibility: vis, name, type, isStatic });
    }
  }

  private parseMemberNoVis(
    node: ClassNode,
    defaultVis: "+" | "-" | "#" | "~",
  ): void {
    const nameToken = this.currentToken();
    if (
      !nameToken ||
      (nameToken.type !== "identifier" && nameToken.type !== "keyword")
    ) {
      this.skipToNewline();
      return;
    }
    const name = nameToken.value;
    this.advance();
    if (this.currentToken()?.value === "(") {
      node.methods.push(this.parseMethodSig(defaultVis, name, false));
    } else {
      let type = "any";
      if (this.currentToken()?.value === ":") {
        this.advance();
        type = this.readType();
      }
      node.attributes.push({ visibility: defaultVis, name, type });
    }
  }

  private parseMethodSig(
    vis: "+" | "-" | "#" | "~",
    name: string,
    isStatic: boolean,
  ): UMLMethod {
    this.advance(); // skip (
    const params: { name: string; type: string }[] = [];
    while (
      this.pos < this.tokens.length &&
      this.currentToken()?.value !== ")"
    ) {
      if (this.currentToken()?.value === ",") {
        this.advance();
        continue;
      }
      const pName = this.currentToken()?.value || "arg";
      this.advance();
      let pType = "any";
      if (this.currentToken()?.value === ":") {
        this.advance();
        pType = this.readType();
      }
      params.push({ name: pName, type: pType });
    }
    if (this.currentToken()?.value === ")") this.advance();
    let returnType = "void";
    if (this.currentToken()?.value === ":") {
      this.advance();
      returnType = this.readType();
    }
    return { visibility: vis, name, params, returnType, isStatic };
  }

  private parseEnum(): void {
    this.advance();
    this.skipNewlines();
    const nameToken = this.currentToken();
    if (!nameToken) {
      this.addError("Expected enum name");
      return;
    }
    const name = nameToken.value;
    this.advance();
    this.skipNewlines();

    const node: ClassNode = {
      id: `node_enum_${name}_${this.diagram.nodes.length}`,
      type: "enum",
      name,
      position: { x: 0, y: 0 },
      size: { width: 160, height: 80 },
      attributes: [],
      methods: [],
      stereotypes: ["enumeration"],
    };

    if (this.currentToken()?.value === "{") {
      this.advance();
      this.skipNewlines();
      while (
        this.pos < this.tokens.length &&
        this.currentToken()?.value !== "}"
      ) {
        this.skipNewlines();
        if (this.currentToken()?.value === "}") break;
        if (this.currentToken()?.type === "identifier") {
          node.attributes.push({
            visibility: "+",
            name: this.currentToken()!.value,
            type: "",
          });
          this.advance();
        } else {
          this.advance();
        }
        this.skipNewlines();
      }
      if (this.currentToken()?.value === "}") this.advance();
    }
    this.calculateSize(node);
    this.diagram.nodes.push(node);
  }

  private calculateSize(node: ClassNode): void {
    const charW = 7.5,
      padding = 24;
    let maxLen = node.name.length;
    for (const a of node.attributes)
      maxLen = Math.max(maxLen, `${a.visibility}${a.name}: ${a.type}`.length);
    for (const m of node.methods) {
      const p = m.params.map((x) => `${x.name}: ${x.type}`).join(", ");
      maxLen = Math.max(
        maxLen,
        `${m.visibility}${m.name}(${p}): ${m.returnType}`.length,
      );
    }
    node.size.width = Math.max(180, maxLen * charW + padding);
    const hH = node.type === "class" ? 35 : 45;
    const aH = node.attributes.length * 20;
    const mH = node.methods.length * 20;
    node.size.height = Math.max(60, hH + aH + (mH > 0 ? mH + 8 : 0) + 12);
  }
}
