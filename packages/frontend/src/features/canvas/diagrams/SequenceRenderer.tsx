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
    theme = "dark",
    selectedParticipantId,
    selectedMessageId,
    onParticipantSelect,
    onMessageSelect,
    onParticipantRename,
    onParticipantDragStart,
    onMessageEdit,
    onMessageDelete,
  } = props;

  const isDark = theme === "dark";

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

  // Check destroyed participants and their destruction Y coordinates (UML 2.5 Destruction Occurrence)
  const destructionMap = new Map<string, number>();
  messages.forEach((msg, idx) => {
    if (msg.type === "destroy" || msg.label?.toLowerCase() === "destroy") {
      const targetP = participants.find(
        (p) => p.id === msg.to || p.name === msg.to.replace(/^participant_/, "")
      );
      if (targetP && !destructionMap.has(targetP.id)) {
        destructionMap.set(targetP.id, startY + idx * msgSpacing);
      }
    }
  });

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
          theme={theme}
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

      {/* Lifelines & UML 2.5 Destruction Occurrences */}
      {participants.map((p) => {
        const destY = destructionMap.get(p.id);
        const endY = destY !== undefined ? destY : lifelineEnd;
        return (
          <React.Fragment key={`ll_${p.id}`}>
            <line
              x1={p.position.x}
              y1={startY - 10}
              x2={p.position.x}
              y2={endY}
              stroke={isDark ? "#6366f1" : "#94a3b8"}
              strokeWidth="1.5"
              strokeDasharray="4,4"
              opacity={isDark ? "0.75" : "0.9"}
            />
            {destY !== undefined && (
              <g className="destruction-occurrence">
                <line
                  x1={p.position.x - 9}
                  y1={destY - 9}
                  x2={p.position.x + 9}
                  y2={destY + 9}
                  stroke={isDark ? "#f87171" : "#ef4444"}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <line
                  x1={p.position.x + 9}
                  y1={destY - 9}
                  x2={p.position.x - 9}
                  y2={destY + 9}
                  stroke={isDark ? "#f87171" : "#ef4444"}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </g>
            )}
          </React.Fragment>
        );
      })}

      {/* UML 2.5 Execution Specification (Activation Bars with Nested Offsets) */}
      {(() => {
        const participantBars = new Map<string, Array<{ startY: number; endY: number }>>();
        return messages.map((msg, i) => {
          if (msg.type === "return") return null;
          const toP = participants.find((p) => p.id === msg.to);
          if (!toP) return null;
          const y = startY + i * msgSpacing;
          let actEndY = y + 36;
          for (let k = i + 1; k < messages.length; k++) {
            const nextMsg = messages[k];
            if (nextMsg.from === toP.id && (nextMsg.type === "return" || nextMsg.to === msg.from)) {
              actEndY = startY + k * msgSpacing + 6;
              break;
            }
          }

          if (!participantBars.has(toP.id)) participantBars.set(toP.id, []);
          const activeList = participantBars.get(toP.id)!;
          const nesting = activeList.filter((b) => b.startY <= y && b.endY > y).length;
          activeList.push({ startY: y, endY: actEndY });

          const offsetX = toP.position.x - 6 + nesting * 6;
          const barH = Math.max(24, actEndY - y + 4);
          return (
            <rect
              key={`act_${msg.id}`}
              x={offsetX}
              y={y - 4}
              width={12}
              height={barH}
              rx={2}
              fill={isDark ? "#1e293b" : "#ffffff"}
              stroke={isDark ? "#818cf8" : "#64748b"}
              strokeWidth="1.5"
              className="pointer-events-none shadow-sm"
            />
          );
        });
      })()}

      {/* Fragments */}
      {fragments.map((frag) => (
        <FragmentBox
          key={frag.id}
          fragment={frag}
          theme={theme}
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
            index={i + 1}
            message={msg}
            theme={theme}
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

      {/* Bottom participant boxes (omitted for destroyed participants) */}
      {participants
        .filter((p) => !destructionMap.has(p.id))
        .map((p) => (
          <ParticipantBox
            key={`bottom_${p.id}`}
            participant={{ ...p, position: { ...p.position, y: lifelineEnd } }}
            theme={theme}
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
