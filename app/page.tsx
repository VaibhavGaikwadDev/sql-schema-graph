"use client";

import { useState } from "react";
import FileUpload from "@/components/FileUpload";
import SchemaGraph from "@/components/SchemaGraph";
import { ParsedSchema } from "@/lib/parseSql";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function Home() {
  const [schema, setSchema] = useState<ParsedSchema | null>(null);
  const [graphKey, setGraphKey] = useState(0);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="flex h-screen flex-col bg-background text-foreground">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            SQL Schema Graph
          </h1>
          <p className="text-sm text-muted-foreground">
            Tables as nodes · Foreign keys as edges
          </p>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 shrink-0 border-r p-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Schema Source</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileUpload
                onSchema={(s) => {
                  setSchema(s);
                  setGraphKey((key) => key + 1);
                  setError(null);
                }}
                onError={(msg) => {
                  setError(msg);
                  setSchema(null);
                }}
              />

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {schema?.usedFallback && (
                <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  Strict SQL parsing failed, so a fallback parser was used.
                  Some constraints may be missing.
                </div>
              )}

              {schema && (
                <>
                  <Separator />
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Tables</span>
                      <Badge variant="secondary">{schema.tables.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Keys (PK + FK)
                      </span>
                      <Badge variant="secondary">{schema.keys.length}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        Relationships
                      </span>
                      <Badge variant="secondary">{schema.edges.length}</Badge>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </aside>

        <div className="relative flex-1">
          {schema ? (
            <SchemaGraph key={graphKey} schema={schema} />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Upload a .sql file to visualize the schema
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
