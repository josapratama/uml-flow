import React, { useState } from "react";
import type { Diagram } from "@uml-editor/shared";
import {
  ParticipantBox,
  MessageArrow,
  FragmentBox,
} from "./sequence";

interface Props {
  diagram: Diagram;
  theme?: "light" | "dark";
  selectedParticipantId?: string | null;
  selectedMessageId?: string | null;
  onParticipantSelect?: (id: string | null) => void;
  onMessageSelect?: (id: string | null) => void;
  onParticipantMove?: (id: string, x: number) => void;
  onParticipantRename?: (id: string, name: string) => void;
  onParticipantDragStart?: (id: string, e: React.MouseEvent) => void;
  onMessageEdit?: (id: string, label: string) => void;
  onMessageDelete?: (id: string) => void;
  onMessageReorder?: (id: string, newOrder: number) => void;
  onAddMessage?: (
    from: string,
    to: string,
    label: string,
    type: string,
  ) => void;
}

export function SequenceRenderer(props: Props) {
  const {
    diagram,
    selectedParticipantId,
    selectedMessageId,
    onParticipantSelect,
    onMessageSelect,
    onParticipantRename,
    onParticipantDragStart,
    onMessageEdit,
    onMessageDelete,
  } = props;

  const participants = diagram.participants || [];
  const messages = diagram.messages || [];
  const fragments = diagram.fragments || [];

  const [hoveredMsgId, setHoveredMsgId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editType, setEditType] = useState<"participant" | "message">(
    "participant",
  );

  const msgSpacing = 50;
  const startY = 100;
  const lifelineEnd = startY + (messages.length + 2) * msgSpacing + 40;

  const startEdit = (
    id: string,
    value: string,
    type: "participant" | "message",
  ) => {
    setEditingId(id);
    setEditValue(value);
    setEditType(type);
  };

  const commitEdit = () => {
    if (editingId && editValue.trim()) {
      if (editType === "participant")
        onParticipantRename?.(editingId, editValue.trim());
      else onMessageEdit?.(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <g>
      {/* Participants (top) */}
      {participants.map((p) => (
        <ParticipantBox
          key={p.id}
          participant={p}
          isSelected={p.id === selectedParticipantId}
          isEditing={editingId === p.id}
          editValue={editingId === p.id ? editValue : ""}
          onEditChange={setEditValue}
          onEditCommit={commitEdit}
          onEditCancel={() => setEditingId(null)}
          onMouseDown={(e) => {
            e.stopPropagation();
            onParticipantSelect?.(p.id);
            onMessageSelect?.(null);
            onParticipantDragStart?.(p.id, e);
          }}
          onDoubleClick={() => startEdit(p.id, p.name, "participant")}
        />
      ))}

      {/* Lifelines */}
      {participants.map((p) => (
        <line
          key={`ll_${p.id}`}
          x1={p.position.x}
          y1={startY - 10}
          x2={p.position.x}
          y2={lifelineEnd}
          stroke="#999"
          strokeWidth="1"
          strokeDasharray="4,4"
        />
      ))}

      {/* Fragments */}
      {fragments.map((frag) => (
        <FragmentBox
          key={frag.id}
          fragment={frag}
          participants={participants}
          messages={messages}
          startY={startY}
          msgSpacing={msgSpacing}
        />
      ))}

      {/* Messages */}
      {messages.map((msg, i) => {
        const fromP = participants.find((p) => p.id === msg.from);
        const toP = participants.find((p) => p.id === msg.to);
        if (!fromP || !toP) return null;
        const y = startY + i * msgSpacing;
        const isSelected = msg.id === selectedMessageId;
        const isHovered = msg.id === hoveredMsgId;
        const isEditing = editingId === msg.id;
        return (
          <MessageArrow
            key={msg.id}
            message={msg}
            fromX={fromP.position.x}
            toX={toP.position.x}
            y={y}
            isSelected={isSelected}
            isHovered={isHovered}
            isEditing={isEditing}
            editValue={isEditing ? editValue : ""}
            onEditChange={setEditValue}
            onEditCommit={commitEdit}
            onEditCancel={() => setEditingId(null)}
            onMouseEnter={() => setHoveredMsgId(msg.id)}
            onMouseLeave={() => setHoveredMsgId(null)}
            onClick={(e) => {
              e.stopPropagation();
              onMessageSelect?.(msg.id);
              onParticipantSelect?.(null);
            }}
            onDoubleClick={() => startEdit(msg.id, msg.label, "message")}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onMessageDelete?.(msg.id);
            }}
          />
        );
      })}

      {/* Bottom participant boxes */}
      {participants.map((p) => (
        <ParticipantBox
          key={`bottom_${p.id}`}
          participant={{ ...p, position: { ...p.position, y: lifelineEnd } }}
          isSelected={false}
          isEditing={false}
          editValue=""
          onEditChange={() => {}}
          onEditCommit={() => {}}
          onEditCancel={() => {}}
        />
      ))}
    </g>
  );
}
