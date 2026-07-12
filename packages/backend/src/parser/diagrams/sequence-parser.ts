import type { SequenceParticipant } from "@uml-editor/shared";
import { BaseDiagramParser } from "../base-parser";

export class SequenceDiagramParser extends BaseDiagramParser {
  parseElement(): void {
    const token = this.currentToken();
    if (!token) return;

    if (
      token.type === "keyword" &&
      (token.value === "participant" || token.value === "actor")
    ) {
      this.parseParticipant();
      return;
    }
    if (token.type === "bracket") {
      this.parseFragment();
      return;
    }
    if (token.type === "identifier") {
      this.parseMessage();
      return;
    }
    this.advance();
  }

  private parseParticipant(): void {
    const typeKw = this.currentToken()!.value;
    this.advance();
    this.skipNewlines();
    const nameToken = this.currentToken();
    if (!nameToken) return;
    const name =
      nameToken.type === "string" ? nameToken.value : nameToken.value;
    this.advance();

    let pType: SequenceParticipant["type"] =
      typeKw === "actor" ? "actor" : "object";
    if (this.currentToken()?.value === "as") {
      this.advance();
      const asType = this.currentToken()?.value;
      if (
        asType &&
        ["actor", "object", "boundary", "control", "entity"].includes(asType)
      ) {
        pType = asType as SequenceParticipant["type"];
      }
      this.advance();
    }

    if (!this.diagram.participants) this.diagram.participants = [];
    this.diagram.participants.push({
      id: `participant_${name}`,
      name,
      type: pType,
      position: { x: this.diagram.participants.length * 180 + 80, y: 60 },
    });
  }

  private parseMessage(): void {
    const fromName = this.currentToken()!.value;
    this.advance();
    this.skipNewlines();
    const relToken = this.currentToken();
    if (!relToken || relToken.type !== "symbol") {
      this.skipToNewline();
      return;
    }
    const msgType =
      relToken.value === "->"
        ? "sync"
        : relToken.value === "-->>"
          ? "return"
          : "async";
    this.advance();
    this.skipNewlines();
    const toToken = this.currentToken();
    if (!toToken) return;
    const toName = toToken.value;
    this.advance();

    let label = "";
    if (this.currentToken()?.value === ":") {
      this.advance();
      label = this.readToEndOfLine();
    }

    if (!this.diagram.messages) this.diagram.messages = [];
    const type = fromName === toName ? "self" : msgType;
    this.diagram.messages.push({
      id: `msg_${this.diagram.messages.length}`,
      from: `participant_${fromName}`,
      to: `participant_${toName}`,
      label,
      type: type as any,
      order: this.diagram.messages.length,
    });
  }

  private parseFragment(): void {
    const fragType = this.currentToken()!.value;
    this.advance();
    this.skipNewlines();
    let label = "";
    if (
      this.currentToken()?.type !== "newline" &&
      this.currentToken()?.type !== "bracket"
    ) {
      label = this.readToEndOfLine();
    }
    if (!this.diagram.fragments) this.diagram.fragments = [];
    if (["alt", "opt", "loop", "par", "break", "critical"].includes(fragType)) {
      this.diagram.fragments.push({
        id: `frag_${this.diagram.fragments.length}`,
        type: fragType as any,
        label,
        startOrder: this.diagram.messages?.length || 0,
        endOrder: -1,
      });
    } else if (fragType === "end") {
      const last = this.diagram.fragments[this.diagram.fragments.length - 1];
      if (last) last.endOrder = (this.diagram.messages?.length || 0) - 1;
    }
  }
}
