"use client";

import { useEffect, useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  MarkerType,
  BackgroundVariant,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import TableNode, { type TableNodeData } from "./TableNode";
import { ParsedSchema } from "@/lib/parseSql";

const nodeTypes = {
  table: TableNode,
};

type Props = {
  schema: ParsedSchema;
};

export default function SchemaGraph({ schema }: Props) {
  const initialNodes: Node<TableNodeData>[] = useMemo(() => {
    return schema.tables.map((table, i) => ({
      id: table.name,
      type: "table",
      position: {
        x: (i % 4) * 340 + 40,
        y: Math.floor(i / 4) * 340 + 40,
      },
      data: {
        label: table.name,
        columns: table.columns,
      },
    }));
  }, [schema]);

  const initialEdges: Edge[] = useMemo(() => {
    return schema.edges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: e.sourceHandle,
      targetHandle: e.targetHandle,
      label: e.label,
      type: "smoothstep",
      animated: true,
      style: { stroke: "var(--color-primary)", strokeWidth: 2 },
      labelStyle: { fill: "var(--color-muted-foreground)", fontSize: 11 },
      labelBgStyle: { fill: "var(--color-card)", fillOpacity: 0.9 },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 18,
        height: 18,
        color: "var(--color-primary)",
      },
    }));
  }, [schema]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.15}
        maxZoom={1.8}
        defaultEdgeOptions={{ type: "smoothstep" }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={18}
          size={1}
          color="var(--color-border)"
        />
        <Controls />
        <MiniMap
          nodeColor="var(--color-primary)"
          maskColor="color-mix(in oklch, var(--color-background) 75%, transparent)"
        />
      </ReactFlow>
    </div>
  );
}
