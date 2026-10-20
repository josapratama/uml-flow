import React, { useState } from "react";
import type {
  Diagram,
  SequenceParticipant,
  SequenceMessage,
  SequenceFragment,
} from "@uml-editor/shared";

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
    onParticipantMove,
    onParticipantRename,
    onParticipantDragStart,
    onMessageEdit,
    onMessageDelete,
  } = props;
  const theme = props.theme || "light";

  const participants = diagram.participants || [];
  const messages = diagram.messages || [];
  const fragments = diagram.fragments || [];

  // Theme-aware colors
  const c =
    theme === "dark"
      ? {
          text: "#e2e8f0",
          stroke: "#94a3b8",
          lifeline: "#475569",
          boxFill: "#1e293b",
          boxSelected: "#312e81",
          fragBg: "rgba(100,100,100,0.1)",
          fragStroke: "#64748b",
        }
      : {
          text: "#333",
          stroke: "#444",
          lifeline: "#999",
          boxFill: "#E3F2FD",
          boxSelected: "#EDE9FE",
          fragBg: "rgba(200,200,200,0.05)",
          fragStroke: "#888",
        };
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

// --- Inline text editor for SVG ---
function SvgInlineInput({
  x,
  y,
  width,
  value,
  onChange,
  onCommit,
  onCancel,
}: {
  x: number;
  y: number;
  width: number;
  value: string;
  onChange: (v: string) => void;
  onCommit: () => void;
  onCancel: () => void;
}) {
  return (
    <foreignObject x={x} y={y - 12} width={width} height={24}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit();
          if (e.key === "Escape") onCancel();
        }}
        onBlur={onCommit}
        autoFocus
        style={{
          width: "100%",
          height: "100%",
          fontSize: "11px",
          textAlign: "center",
          border: "1px solid #6366f1",
          borderRadius: "3px",
          outline: "none",
          padding: "0 4px",
          background: "white",
          color: "#333",
        }}
      />
    </foreignObject>
  );
}

function ParticipantBox({
  participant,
  isSelected,
  isEditing,
  editValue,
  onEditChange,
  onEditCommit,
  onEditCancel,
  onMouseDown,
  onDoubleClick,
}: {
  participant: SequenceParticipant;
  isSelected?: boolean;
  isEditing: boolean;
  editValue: string;
  onEditChange: (v: string) => void;
  onEditCommit: () => void;
  onEditCancel: () => void;
  onMouseDown?: (e: React.MouseEvent) => void;
  onDoubleClick?: () => void;
}) {
  const { position, name, type } = participant;
  const boxW = Math.max(80, name.length * 8 + 20);
  const stroke = isSelected ? "#6366f1" : "#444";
  const sw = isSelected ? 2.5 : 1.5;

  if (type === "actor") {
    return (
      <g
        style={{ cursor: onMouseDown ? "move" : "default" }}
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
      >
        {isSelected && (
          <rect
            x={position.x - 25}
            y={position.y - 30}
            width={50}
            height={75}
            rx={4}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2"
            strokeDasharray="4,2"
            opacity="0.5"
          />
        )}
        <circle
          cx={position.x}
          cy={position.y - 20}
          r={10}
          fill="none"
          stroke={stroke}
          strokeWidth={sw}
        />
        <line
          x1={position.x}
          y1={position.y - 10}
          x2={position.x}
          y2={position.y + 10}
          stroke={stroke}
          strokeWidth={sw}
        />
        <line
          x1={position.x - 12}
          y1={position.y - 2}
          x2={position.x + 12}
          y2={position.y - 2}
          stroke={stroke}
          strokeWidth={sw}
        />
        <line
          x1={position.x}
          y1={position.y + 10}
          x2={position.x - 8}
          y2={position.y + 22}
          stroke={stroke}
          strokeWidth={sw}
        />
        <line
          x1={position.x}
          y1={position.y + 10}
          x2={position.x + 8}
          y2={position.y + 22}
          stroke={stroke}
          strokeWidth={sw}
        />
        {isEditing ? (
          <SvgInlineInput
            x={position.x - 40}
            y={position.y + 36}
            width={80}
            value={editValue}
            onChange={onEditChange}
            onCommit={onEditCommit}
            onCancel={onEditCancel}
          />
        ) : (
          <text
            x={position.x}
            y={position.y + 36}
            textAnchor="middle"
            fontSize="11"
            fill="#333"
          >
            {name}
          </text>
        )}
      </g>
    );
  }

  return (
    <g
      style={{ cursor: onMouseDown ? "move" : "default" }}
      onMouseDown={onMouseDown}
      onDoubleClick={onDoubleClick}
    >
      {type === "boundary" ? (
        <>
          <circle
            cx={position.x}
            cy={position.y}
            r={14}
            fill={isSelected ? "#EDE9FE" : "white"}
            stroke={stroke}
            strokeWidth={sw}
          />
          <line
            x1={position.x - 22}
            y1={position.y - 14}
            x2={position.x - 22}
            y2={position.y + 14}
            stroke={stroke}
            strokeWidth={sw}
          />
          <line
            x1={position.x - 22}
            y1={position.y}
            x2={position.x - 14}
            y2={position.y}
            stroke={stroke}
            strokeWidth={sw}
          />
          {isEditing ? (
            <SvgInlineInput
              x={position.x - 40}
              y={position.y + 22}
              width={80}
              value={editValue}
              onChange={onEditChange}
              onCommit={onEditCommit}
              onCancel={onEditCancel}
            />
          ) : (
            <text
              x={position.x}
              y={position.y + 28}
              textAnchor="middle"
              fontSize="11"
              fill="#333"
            >
              {name}
            </text>
          )}
        </>
      ) : type === "entity" ? (
        <>
          <circle
            cx={position.x}
            cy={position.y}
            r={14}
            fill={isSelected ? "#EDE9FE" : "white"}
            stroke={stroke}
            strokeWidth={sw}
          />
          <line
            x1={position.x - 14}
            y1={position.y + 15}
            x2={position.x + 14}
            y2={position.y + 15}
            stroke={stroke}
            strokeWidth={sw + 0.5}
          />
          {isEditing ? (
            <SvgInlineInput
              x={position.x - 40}
              y={position.y + 24}
              width={80}
              value={editValue}
              onChange={onEditChange}
              onCommit={onEditCommit}
              onCancel={onEditCancel}
            />
          ) : (
            <text
              x={position.x}
              y={position.y + 32}
              textAnchor="middle"
              fontSize="11"
              fill="#333"
            >
              {name}
            </text>
          )}
        </>
      ) : (
        <>
          <rect
            x={position.x - boxW / 2}
            y={position.y - 15}
            width={boxW}
            height="30"
            rx="3"
            fill={isSelected ? "#EDE9FE" : "#E3F2FD"}
            stroke={stroke}
            strokeWidth={sw}
          />
          {isEditing ? (
            <SvgInlineInput
              x={position.x - boxW / 2 + 4}
              y={position.y}
              width={boxW - 8}
              value={editValue}
              onChange={onEditChange}
              onCommit={onEditCommit}
              onCancel={onEditCancel}
            />
          ) : (
            <text
              x={position.x}
              y={position.y + 4}
              textAnchor="middle"
              fontSize="12"
              fill="#333"
              fontWeight={isSelected ? "600" : "normal"}
            >
              {name}
            </text>
          )}
        </>
      )}
    </g>
  );
}

function MessageArrow({
  message,
  fromX,
  toX,
  y,
  isSelected,
  isHovered,
  isEditing,
  editValue,
  onEditChange,
  onEditCommit,
  onEditCancel,
  onClick,
  onDoubleClick,
  onMouseEnter,
  onMouseLeave,
  onContextMenu,
}: {
  message: SequenceMessage;
  fromX: number;
  toX: number;
  y: number;
  isSelected: boolean;
  isHovered: boolean;
  isEditing: boolean;
  editValue: string;
  onEditChange: (v: string) => void;
  onEditCommit: () => void;
  onEditCancel: () => void;
  onClick: (e: React.MouseEvent) => void;
  onDoubleClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  const isSelf = message.type === "self" || fromX === toX;
  const isReturn = message.type === "return" || message.type === "async";
  const color = isSelected ? "#6366f1" : isHovered ? "#818cf8" : "#555";
  const sw = isSelected ? 2 : 1.5;
  const midX = (fromX + toX) / 2;

  if (isSelf) {
    const loopW = 30;
    return (
      <g
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{ cursor: "pointer" }}
      >
        <rect
          x={fromX - 5}
          y={y - 5}
          width={loopW + 15}
          height={30}
          fill="transparent"
          onClick={onClick}
          onDoubleClick={onDoubleClick}
          onContextMenu={onContextMenu}
        />
        <path
          d={`M ${fromX} ${y} H ${fromX + loopW} V ${y + 20} H ${fromX}`}
          fill="none"
          stroke={color}
          strokeWidth={sw}
          markerEnd="url(#arrow-flow)"
        />
        {isEditing ? (
          <SvgInlineInput
            x={fromX + loopW + 2}
            y={y + 10}
            width={100}
            value={editValue}
            onChange={onEditChange}
            onCommit={onEditCommit}
            onCancel={onEditCancel}
          />
        ) : (
          <text
            x={fromX + loopW + 5}
            y={y + 10}
            fontSize="11"
            fill={color}
            fontWeight={isSelected ? "600" : "normal"}
            style={{ cursor: "pointer" }}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
          >
            {message.label}
          </text>
        )}
      </g>
    );
  }

  const dir = toX > fromX ? 1 : -1;
  const dashArray = isReturn ? "5,3" : undefined;

  return (
    <g
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: "pointer" }}
    >
      <line
        x1={fromX}
        y1={y}
        x2={toX}
        y2={y}
        stroke="transparent"
        strokeWidth="14"
        onClick={onClick}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
      />
      <line
        x1={fromX}
        y1={y}
        x2={toX - dir * 8}
        y2={y}
        stroke={color}
        strokeWidth={sw}
        strokeDasharray={dashArray}
        markerEnd="url(#arrow-flow)"
      />
      {isEditing ? (
        <SvgInlineInput
          x={midX - 60}
          y={y - 8}
          width={120}
          value={editValue}
          onChange={onEditChange}
          onCommit={onEditCommit}
          onCancel={onEditCancel}
        />
      ) : (
        <text
          x={midX}
          y={y - 8}
          textAnchor="middle"
          fontSize="11"
          fill={color}
          fontWeight={isSelected ? "600" : "normal"}
          style={{ cursor: "pointer" }}
          onClick={onClick}
          onDoubleClick={onDoubleClick}
        >
          {message.label}
        </text>
      )}
      {isSelected && (
        <>
          <circle
            cx={fromX}
            cy={y}
            r={4}
            fill="#6366f1"
            stroke="white"
            strokeWidth="1.5"
          />
          <circle
            cx={toX - dir * 8}
            cy={y}
            r={4}
            fill="#6366f1"
            stroke="white"
            strokeWidth="1.5"
          />
        </>
      )}
    </g>
  );
}

function FragmentBox({
  fragment,
  participants,
  messages,
  startY,
  msgSpacing,
}: {
  fragment: SequenceFragment;
  participants: SequenceParticipant[];
  messages: SequenceMessage[];
  startY: number;
  msgSpacing: number;
}) {
  const y1 = startY + fragment.startOrder * msgSpacing - 10;
  const y2 =
    startY +
    (fragment.endOrder >= 0 ? fragment.endOrder + 1 : messages.length) *
      msgSpacing +
    10;
  const minX = Math.min(...participants.map((p) => p.position.x)) - 30;
  const maxX = Math.max(...participants.map((p) => p.position.x)) + 30;
  return (
    <g>
      <rect
        x={minX}
        y={y1}
        width={maxX - minX}
        height={y2 - y1}
        fill="rgba(200,200,200,0.05)"
        stroke="#888"
        strokeWidth="1"
        rx="2"
      />
      <rect
        x={minX}
        y={y1}
        width="50"
        height="18"
        fill="#f0f0f0"
        stroke="#888"
        strokeWidth="1"
      />
      <text
        x={minX + 25}
        y={y1 + 13}
        textAnchor="middle"
        fontSize="10"
        fontWeight="bold"
        fill="#555"
      >
        {fragment.type}
      </text>
      {fragment.label && (
        <text x={minX + 56} y={y1 + 13} fontSize="10" fill="#666">
          [{fragment.label}]
        </text>
      )}
      {fragment.conditions?.map((cond, i) => {
        const condY =
          y1 + ((y2 - y1) / (fragment.conditions!.length + 1)) * (i + 1);
        return (
          <g key={`cond_${i}`}>
            <line
              x1={minX}
              y1={condY}
              x2={maxX}
              y2={condY}
              stroke="#888"
              strokeWidth="0.5"
              strokeDasharray="3,3"
            />
            <text
              x={minX + 8}
              y={condY + 12}
              fontSize="9"
              fill="#666"
              fontStyle="italic"
            >
              [{cond}]
            </text>
          </g>
        );
      })}
    </g>
  );
}
