import { Parser } from "node-sql-parser";

export type Column = {
  name: string;
  type: string;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  references?: {
    table: string;
    column: string;
  };
};

export type Table = {
  name: string;
  columns: Column[];
};

export type KeyNode = {
  id: string;
  table: string;
  column: string;
  type: "PK" | "FK";
  dataType: string;
  isPrimaryKey?: boolean;
  isForeignKey?: boolean;
  references?: {
    table: string;
    column: string;
  };
};

export type Edge = {
  id: string;
  source: string;
  target: string;
  sourceHandle: string;
  targetHandle: string;
  label?: string;
  type?: "fk";
};

export type ParsedSchema = {
  tables: Table[];
  keys: KeyNode[];
  edges: Edge[];
  usedFallback: boolean;
};

const parser = new Parser();

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function normalizeTableName(name: string): string {
  return name.replace(/[`"[\]]/g, "").toLowerCase();
}

function tableNameMatches(a: string, b: string): boolean {
  const left = normalizeTableName(a);
  const right = normalizeTableName(b);
  if (left === right) return true;
  const leftTail = left.split(".").pop();
  const rightTail = right.split(".").pop();
  return Boolean(leftTail && rightTail && leftTail === rightTail);
}

function findTable(tables: Table[], name: string): Table | undefined {
  return tables.find((table) => tableNameMatches(table.name, name));
}

function getTableName(table: unknown): string | undefined {
  if (!table) return undefined;

  if (typeof table === "string") {
    return table;
  }

  if (Array.isArray(table)) {
    return getTableName(table[0]);
  }

  if (isRecord(table) && typeof table.table === "string") {
    const schema = asString(table.schema);
    return schema ? `${schema}.${table.table}` : table.table;
  }

  return undefined;
}

function getColumnName(column: unknown): string | undefined {
  if (!column) return undefined;

  if (typeof column === "string") {
    return column;
  }

  if (!isRecord(column)) {
    return undefined;
  }

  if (typeof column.column === "string") {
    return column.column;
  }

  if (isRecord(column.column)) {
    const nested = getColumnName(column.column);
    if (nested) return nested;
  }

  if (isRecord(column.expr)) {
    if (typeof column.expr.value === "string") {
      return column.expr.value;
    }
    const nested = getColumnName(column.expr);
    if (nested) return nested;
  }

  if (typeof column.value === "string") {
    return column.value;
  }

  return undefined;
}

function getDataType(definition: unknown): string {
  if (!isRecord(definition)) {
    return "UNKNOWN";
  }

  const baseType =
    asString(definition.dataType) ||
    asString(definition.datatype) ||
    asString(definition.type) ||
    "UNKNOWN";

  const length = definition.length;

  if (!length) {
    return String(baseType);
  }

  if (Array.isArray(length)) {
    const values = length
      .map((item) => {
        if (typeof item === "string" || typeof item === "number") {
          return String(item);
        }
        if (!isRecord(item)) return "";
        if (item.value !== undefined) return String(item.value);
        if (isRecord(item.expr) && item.expr.value !== undefined) {
          return String(item.expr.value);
        }
        return typeof item.column === "string" ? item.column : "";
      })
      .filter(Boolean);

    if (values.length > 0) {
      return `${baseType}(${values.join(",")})`;
    }
  }

  const scale =
    typeof definition.scale === "number" || typeof definition.scale === "string"
      ? definition.scale
      : isRecord(definition.scale) && definition.scale.value !== undefined
        ? definition.scale.value
        : undefined;

  if (typeof length === "number" || typeof length === "string") {
    return scale !== undefined
      ? `${baseType}(${length},${scale})`
      : `${baseType}(${length})`;
  }

  if (isRecord(length) && length.value !== undefined) {
    return scale !== undefined
      ? `${baseType}(${String(length.value)},${String(scale)})`
      : `${baseType}(${String(length.value)})`;
  }

  return String(baseType);
}

function getReferenceDefinition(ref: unknown): {
  table?: string;
  columns: string[];
} {
  if (!isRecord(ref)) {
    return { table: undefined, columns: [] };
  }

  const table = getTableName(ref.table);
  const rawColumns = Array.isArray(ref.columns)
    ? ref.columns
    : Array.isArray(ref.definition)
      ? ref.definition
      : [];
  const columns = rawColumns
    .map(getColumnName)
    .filter((name): name is string => Boolean(name));

  return { table, columns };
}

function primaryKeyOf(table: Table): string | undefined {
  return table.columns.find((column) => column.isPrimaryKey)?.name;
}

function resolveReferences(tables: Table[]): void {
  for (const table of tables) {
    for (const col of table.columns) {
      if (!col.references) continue;

      const refTable = findTable(tables, col.references.table);
      if (!refTable) {
        col.references = undefined;
        continue;
      }

      const matchingColumn = refTable.columns.find(
        (column) =>
          column.name.toLowerCase() === col.references!.column.toLowerCase()
      );

      if (matchingColumn) {
        col.references = {
          table: refTable.name,
          column: matchingColumn.name,
        };
        continue;
      }

      const pk = primaryKeyOf(refTable);
      if (pk) {
        col.references = {
          table: refTable.name,
          column: pk,
        };
      } else {
        col.references = undefined;
      }
    }
  }
}

function parseCreateTableStatement(
  stmt: Record<string, unknown>
): Table | undefined {
  const stmtType = asString(stmt.type)?.toLowerCase() ?? "";
  const keyword = asString(stmt.keyword)?.toLowerCase() ?? "";

  if (stmtType !== "create" || (keyword && keyword !== "table")) {
    return undefined;
  }

  const tableName = getTableName(stmt.table);
  if (!tableName) {
    return undefined;
  }

  const columns: Column[] = [];
  const createDefs = Array.isArray(stmt.create_definitions)
    ? stmt.create_definitions
    : [];

  for (const rawDef of createDefs) {
    if (!isRecord(rawDef)) continue;

    const resource = asString(rawDef.resource)?.toLowerCase() ?? "";
    if (resource !== "column") continue;

    const colName = getColumnName(rawDef.column);
    if (!colName) continue;

    const primaryKeyValue = asString(rawDef.primary_key)?.toLowerCase() ?? "";
    const constraintType =
      asString(rawDef.constraint_type)?.toLowerCase() ?? "";

    const isPK =
      primaryKeyValue.includes("primary key") ||
      constraintType.includes("primary");

    columns.push({
      name: colName,
      type: getDataType(rawDef.definition),
      isPrimaryKey: isPK,
      isForeignKey: false,
    });
  }

  for (const rawDef of createDefs) {
    if (!isRecord(rawDef)) continue;

    const resource = asString(rawDef.resource)?.toLowerCase() ?? "";
    const constraintType =
      asString(rawDef.constraint_type)?.toLowerCase() ?? "";

    if (resource !== "constraint" || constraintType !== "primary key") {
      continue;
    }

    const pkCols = Array.isArray(rawDef.definition) ? rawDef.definition : [];

    for (const pk of pkCols) {
      const name = getColumnName(pk);
      if (!name) continue;
      const col = columns.find((column) => column.name === name);
      if (col) col.isPrimaryKey = true;
    }
  }

  for (const rawDef of createDefs) {
    if (!isRecord(rawDef)) continue;

    const resource = asString(rawDef.resource)?.toLowerCase() ?? "";
    if (resource !== "column" || !rawDef.reference_definition) continue;

    const colName = getColumnName(rawDef.column);
    if (!colName) continue;

    const { table: refTable, columns: refCols } = getReferenceDefinition(
      rawDef.reference_definition
    );
    if (!refTable) continue;

    const col = columns.find((column) => column.name === colName);
    if (!col) continue;

    col.isForeignKey = true;
    col.references = {
      table: refTable,
      column: refCols[0] ?? "",
    };
  }

  for (const rawDef of createDefs) {
    if (!isRecord(rawDef)) continue;

    const resource = asString(rawDef.resource)?.toLowerCase() ?? "";
    const constraintType =
      asString(rawDef.constraint_type)?.toLowerCase() ?? "";

    if (resource !== "constraint" || constraintType !== "foreign key") {
      continue;
    }

    const fkCols = Array.isArray(rawDef.definition) ? rawDef.definition : [];
    const { table: refTable, columns: refCols } = getReferenceDefinition(
      rawDef.reference_definition
    );
    if (!refTable) continue;

    fkCols.forEach((fk, index) => {
      const colName = getColumnName(fk);
      if (!colName) return;

      const col = columns.find((column) => column.name === colName);
      if (!col) return;

      col.isForeignKey = true;
      col.references = {
        table: refTable,
        column: refCols[index] ?? refCols[0] ?? "",
      };
    });
  }

  return { name: tableName, columns };
}

export function parseSql(
  sql: string,
  dialect: "MySQL" | "PostgreSQL" | "Sqlite" = "MySQL"
): ParsedSchema {
  if (!sql?.trim()) {
    return { tables: [], keys: [], edges: [], usedFallback: false };
  }

  try {
    const ast: unknown = parser.astify(sql, { database: dialect });
    const statements = Array.isArray(ast) ? ast : [ast];
    const tables: Table[] = [];

    for (const stmt of statements) {
      if (!isRecord(stmt)) continue;
      const table = parseCreateTableStatement(stmt);
      if (table) tables.push(table);
    }

    if (tables.length > 0 && tables.some((table) => table.columns.length > 0)) {
      return buildGraph(tables, false);
    }
  } catch {
    // Fall through to regex when the SQL dialect parser rejects the file.
  }

  return buildGraph(parseSqlRegexTables(sql), true);
}

function buildGraph(tables: Table[], usedFallback: boolean): ParsedSchema {
  resolveReferences(tables);

  const keys: KeyNode[] = [];
  const edges: Edge[] = [];
  const keyIds = new Set<string>();
  const edgeIds = new Set<string>();

  for (const table of tables) {
    for (const col of table.columns) {
      if (!col.isPrimaryKey && !col.isForeignKey) continue;

      const keyId = `${table.name}.${col.name}`;
      if (!keyIds.has(keyId)) {
        keyIds.add(keyId);
        keys.push({
          id: keyId,
          table: table.name,
          column: col.name,
          type: col.isPrimaryKey ? "PK" : "FK",
          dataType: col.type,
          isPrimaryKey: col.isPrimaryKey,
          isForeignKey: col.isForeignKey,
          references: col.references,
        });
      }

      if (!col.isForeignKey || !col.references) continue;

      const targetTable = findTable(tables, col.references.table);
      if (!targetTable) continue;

      const targetColumn = targetTable.columns.find(
        (column) =>
          column.name.toLowerCase() === col.references!.column.toLowerCase()
      );
      if (!targetColumn) continue;

      const fkEdgeId = `${table.name}.${col.name}->${targetTable.name}.${targetColumn.name}`;
      if (edgeIds.has(fkEdgeId)) continue;

      edgeIds.add(fkEdgeId);
      edges.push({
        id: fkEdgeId,
        source: table.name,
        sourceHandle: col.name,
        target: targetTable.name,
        targetHandle: targetColumn.name,
        type: "fk",
        label: "references",
      });
    }
  }

  return { tables, keys, edges, usedFallback };
}

function skipWhitespace(sql: string, index: number): number {
  let i = index;
  while (i < sql.length && /\s/.test(sql[i] ?? "")) i += 1;
  return i;
}

function readSqlName(
  sql: string,
  start: number
): { name: string; end: number } | undefined {
  let i = skipWhitespace(sql, start);
  const parts: string[] = [];

  while (i < sql.length) {
    const char = sql[i];
    if (char === "`" || char === '"' || char === "[") {
      const close = char === "[" ? "]" : char;
      const end = sql.indexOf(close, i + 1);
      if (end < 0) return undefined;
      parts.push(sql.slice(i + 1, end));
      i = end + 1;
    } else if (char && /[A-Za-z_]/.test(char)) {
      const rest = sql.slice(i).match(/^[A-Za-z_]\w*/);
      if (!rest) return undefined;
      parts.push(rest[0]);
      i += rest[0].length;
    } else {
      break;
    }

    i = skipWhitespace(sql, i);
    if (sql[i] === ".") {
      i += 1;
      continue;
    }
    break;
  }

  if (parts.length === 0) return undefined;
  return { name: parts.join("."), end: i };
}

function extractCreateTableBodies(
  sql: string
): { name: string; body: string }[] {
  const tables: { name: string; body: string }[] = [];
  const startRe = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?/gi;
  let match: RegExpExecArray | null;

  while ((match = startRe.exec(sql)) !== null) {
    const nameResult = readSqlName(sql, match.index + match[0].length);
    if (!nameResult) continue;

    let i = skipWhitespace(sql, nameResult.end);
    if (sql[i] !== "(") continue;

    let depth = 0;
    let quote: "'" | '"' | "`" | null = null;
    const open = i;

    for (; i < sql.length; i += 1) {
      const char = sql[i];

      if (quote) {
        if (char === quote && sql[i - 1] !== "\\") {
          quote = null;
        }
        continue;
      }

      if (char === "'" || char === '"' || char === "`") {
        quote = char;
        continue;
      }

      if (char === "(") {
        depth += 1;
        continue;
      }

      if (char === ")") {
        depth -= 1;
        if (depth === 0) {
          tables.push({
            name: nameResult.name,
            body: sql.slice(open + 1, i),
          });
          break;
        }
      }
    }
  }

  return tables;
}

function parseSqlRegexTables(sql: string): Table[] {
  const cleanedSql = sql
    .replace(/--.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "");

  const tables: Table[] = [];

  for (const { name: tableName, body: tableBody } of extractCreateTableBodies(
    cleanedSql
  )) {
    const definitions = splitSqlDefinitions(tableBody);
    const columns: Column[] = [];

    for (const rawDefinition of definitions) {
      const definition = rawDefinition.trim();
      if (!definition) continue;

      if (
        /^(CONSTRAINT\s+\S+\s+)?PRIMARY\s+KEY/i.test(definition) ||
        /^(CONSTRAINT\s+\S+\s+)?FOREIGN\s+KEY/i.test(definition) ||
        /^UNIQUE\b/i.test(definition) ||
        /^CHECK\b/i.test(definition)
      ) {
        continue;
      }

      const columnMatch = definition.match(
        /^[`"[\]]?([\w]+)[`"[\]]?\s+([A-Za-z]+(?:\s+[A-Za-z]+)?(?:\s*\([^)]*\))?)/i
      );
      if (!columnMatch) continue;

      const colName = columnMatch[1];
      const dataType = columnMatch[2].trim();
      const isPrimaryKey = /\bPRIMARY\s+KEY\b/i.test(definition);

      let isForeignKey = false;
      let references: Column["references"];

      const refMatch = definition.match(
        /\bREFERENCES\s+[`"[\]]?([\w.]+)[`"[\]]?\s*\(\s*[`"[\]]?([\w]+)[`"[\]]?\s*\)/i
      );

      if (refMatch) {
        isForeignKey = true;
        references = {
          table: refMatch[1],
          column: refMatch[2],
        };
      }

      columns.push({
        name: colName,
        type: dataType,
        isPrimaryKey,
        isForeignKey,
        references,
      });
    }

    for (const rawDefinition of definitions) {
      const definition = rawDefinition.trim();
      const pkMatch = definition.match(
        /^(?:CONSTRAINT\s+\S+\s+)?PRIMARY\s+KEY\s*\(([^)]+)\)/i
      );
      if (!pkMatch) continue;

      for (const pkColumn of parseColumnList(pkMatch[1])) {
        const col = columns.find((column) => column.name === pkColumn);
        if (col) col.isPrimaryKey = true;
      }
    }

    for (const rawDefinition of definitions) {
      const definition = rawDefinition.trim();
      const fkMatch = definition.match(
        /^(?:CONSTRAINT\s+\S+\s+)?FOREIGN\s+KEY\s*\(([^)]+)\)\s+REFERENCES\s+[`"[\]]?([\w.]+)[`"[\]]?\s*\(([^)]+)\)/i
      );
      if (!fkMatch) continue;

      const fkColumns = parseColumnList(fkMatch[1]);
      const refTable = fkMatch[2];
      const refColumns = parseColumnList(fkMatch[3]);

      fkColumns.forEach((fkColumn, index) => {
        const col = columns.find((column) => column.name === fkColumn);
        if (!col) return;

        col.isForeignKey = true;
        col.references = {
          table: refTable,
          column: refColumns[index] ?? refColumns[0] ?? "",
        };
      });
    }

    tables.push({ name: tableName, columns });
  }

  return tables;
}

function splitSqlDefinitions(body: string): string[] {
  const parts: string[] = [];
  let current = "";
  let depth = 0;
  let quote: "'" | '"' | "`" | null = null;

  for (let i = 0; i < body.length; i += 1) {
    const char = body[i] ?? "";

    if (quote) {
      current += char;
      if (char === quote && body[i - 1] !== "\\") {
        quote = null;
      }
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      quote = char;
      current += char;
      continue;
    }

    if (char === "(") {
      depth += 1;
      current += char;
      continue;
    }

    if (char === ")") {
      depth -= 1;
      if (depth < 0) depth = 0;
      current += char;
      continue;
    }

    if (char === "," && depth === 0) {
      parts.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  if (current.trim()) {
    parts.push(current.trim());
  }

  return parts;
}

function parseColumnList(value: string): string[] {
  return value
    .split(",")
    .map((column) => column.trim().replace(/^[`"[\]]|[`"[\]]$/g, ""))
    .filter(Boolean);
}
