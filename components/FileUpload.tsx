"use client";

import { useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { parseSql, ParsedSchema } from "@/lib/parseSql";
import { Upload } from "lucide-react";

type Props = {
  onSchema: (schema: ParsedSchema) => void;
  onError: (msg: string) => void;
};

export default function FileUpload({ onSchema, onError }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.name.toLowerCase().endsWith(".sql")) {
        onError("Please upload a .sql file");
        return;
      }

      try {
        const text = await file.text();
        let schema = parseSql(text, "MySQL");
        if (schema.tables.length === 0) {
          schema = parseSql(text, "PostgreSQL");
        }
        if (schema.tables.length === 0) {
          onError("No CREATE TABLE statements found");
          return;
        }
        onSchema(schema);
      } catch (e) {
        onError(e instanceof Error ? e.message : "Failed to parse SQL");
      }
    },
    [onSchema, onError]
  );

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept=".sql"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (file) void handleFile(file);
        }}
      />

      <Button className="w-full" onClick={() => inputRef.current?.click()}>
        <Upload className="mr-2 h-4 w-4" />
        Upload .sql file
      </Button>

      <p className="text-xs text-muted-foreground">
        Supports MySQL / PostgreSQL CREATE TABLE with PRIMARY KEY & FOREIGN KEY
      </p>
    </div>
  );
}
