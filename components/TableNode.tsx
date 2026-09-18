"use client";

import { memo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Column } from "@/lib/parseSql";

export type TableNodeData = {
  label: string;
  columns: Column[];
};

export type TableFlowNode = Node<TableNodeData, "table">;

function TableNode({ data }: NodeProps<TableFlowNode>) {
  const { label, columns } = data;

  return (
    <Card className="min-w-[260px] gap-0 py-0 shadow-xl">
      <CardHeader className="rounded-t-xl bg-primary px-4 py-2.5">
        <CardTitle className="text-sm font-semibold text-primary-foreground">
          {label}
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0">
        <div className="divide-y divide-border">
          {columns.map((col) => (
            <div
              key={col.name}
              className="relative flex items-center gap-2 px-3 py-2 text-xs"
            >
              <Handle
                type="target"
                position={Position.Left}
                id={col.name}
                className="!h-2.5 !w-2.5 !rounded-full !border-2 !border-background !bg-emerald-400"
                style={{ left: -6 }}
              />

              <div className="flex flex-1 items-center gap-1.5 overflow-hidden">
                {col.isPrimaryKey && (
                  <Badge
                    variant="outline"
                    className="h-5 shrink-0 border-amber-500/50 bg-amber-500/10 px-1.5 text-[10px] text-amber-400"
                  >
                    PK
                  </Badge>
                )}
                {col.isForeignKey && (
                  <Badge
                    variant="outline"
                    className="h-5 shrink-0 border-sky-500/50 bg-sky-500/10 px-1.5 text-[10px] text-sky-400"
                  >
                    FK
                  </Badge>
                )}
                <span className="truncate font-mono text-foreground">
                  {col.name}
                </span>
              </div>

              <span className="shrink-0 text-[11px] text-muted-foreground">
                {col.type}
              </span>

              <Handle
                type="source"
                position={Position.Right}
                id={col.name}
                className="!h-2.5 !w-2.5 !rounded-full !border-2 !border-background !bg-sky-400"
                style={{ right: -6 }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(TableNode);
