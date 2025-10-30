export type SortDir = 'asc' | 'desc';

export type QuerySort = { key: string; dir: SortDir };
export type QueryOp =
  | 'eq' | 'ne'
  | 'lt' | 'lte' | 'gt' | 'gte'
  | 'contains' | 'startsWith' | 'endsWith'
  | 'between' | 'in';

export type QueryFilter =
  | { key: string; op: Exclude<QueryOp, 'between'|'in'>; value: string | number | boolean }
  | { key: string; op: 'between'; value: [string|number, string|number] }
  | { key: string; op: 'in'; value: Array<string|number> };

export interface ListQuery {
  page?: number;        // 1-based
  limit?: number;       // page size
  sorts?: QuerySort[];  // multi-sort supported
  filters?: QueryFilter[];
}

export function toSearchParams(q: ListQuery = {}): string {
  const sp = new URLSearchParams();
  if (q.page)  sp.set('page', String(q.page));
  if (q.limit) sp.set('limit', String(q.limit));
  q.sorts?.forEach((s, i) => sp.set(`sort[${i}]`, `${s.key}:${s.dir}`));
  q.filters?.forEach((f, i) => {
    if (f.op === 'between') sp.set(`filter[${i}]`, `${f.key}:${f.op}:${f.value[0]}..${f.value[1]}`);
    else if (f.op === 'in') sp.set(`filter[${i}]`, `${f.key}:${f.op}:${f.value.join(',')}`);
    else sp.set(`filter[${i}]`, `${f.key}:${f.op}:${String(f.value)}`);
  });
  return sp.toString();
}

// ---- TanStack Table Integration ----

export type SortSpec = { id: string; desc?: boolean };
export type Between = { from: string | number; to: string | number };
export type InList = Array<string | number | boolean>;

export type FilterOp =
  | "contains"
  | "startsWith"
  | "endsWith"
  | "equals"
  | "in"
  | "betweenNumber"
  | "betweenDate"
  | "gte"
  | "lte"
  | "equalsBoolean"
  | "isEmpty"
  | "notEmpty";

export type FilterSpec = {
  key: string;          // column id
  op: FilterOp;
  value?: string | number | boolean | Between | InList | null;
};

export type QueryArgs = {
  page?: number;        // 1-based
  limit?: number;
  sorts?: SortSpec[];
  filters?: FilterSpec[];
  global?: string;      // optional global text search
};

const toKvp = (k: string, v: string) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`;

const serializeFilter = (idx: number, f: FilterSpec): string[] => {
  const base = `filter[${idx}]`;
  const op = f.op;
  switch (op) {
    case "betweenNumber":
    case "betweenDate": {
      const b = f.value as Between;
      const val = `${b?.from ?? ""}..${b?.to ?? ""}`;
      return [toKvp(base, `${f.key}:${op}:${val}`)];
    }
    case "in": {
      const list = (f.value as InList) ?? [];
      return [toKvp(base, `${f.key}:${op}:${list.join(",")}`)];
    }
    case "isEmpty":
    case "notEmpty":
      return [toKvp(base, `${f.key}:${op}:1`)];
    default:
      return [toKvp(base, `${f.key}:${op}:${String(f.value ?? "")}`)];
  }
};

export function toSearchParamsV2(q: QueryArgs): string {
  const parts: string[] = [];
  if (q.page && q.page > 0) parts.push(toKvp("page", String(q.page)));
  if (q.limit && q.limit > 0) parts.push(toKvp("limit", String(q.limit)));

  (q.sorts ?? []).forEach((s, i) => {
    const dir = s.desc ? "desc" : "asc";
    parts.push(toKvp(`sort[${i}]`, `${s.id}:${dir}`));
  });

  (q.filters ?? []).forEach((f, i) => {
    serializeFilter(i, f).forEach((kv) => parts.push(kv));
  });

  if (q.global) parts.push(toKvp("q", q.global));

  return parts.length ? `?${parts.join("&")}` : "";
}

// ---- Helpers to build QueryArgs from TanStack v8 state ----

export type TanStackSorting = Array<{ id: string; desc: boolean }>;
export type TanStackColumnFilter = { id: string; value: any };
export type TanStackPagination = { pageIndex: number; pageSize: number };

export type ColumnMeta = {
  // Optional hints author can add on columnDef.meta
  op?: FilterOp;            // explicit operator for this column
  type?: "text" | "number" | "date" | "enum" | "boolean";
};

export function inferOp(value: unknown, meta?: ColumnMeta): FilterOp {
  if (meta?.op) return meta.op;
  switch (meta?.type) {
    case "number": return "equals";
    case "date":   return "betweenDate";
    case "enum":   return "in";
    case "boolean":return "equalsBoolean";
  }
  if (Array.isArray(value)) return "in";
  if (typeof value === "object" && value && "from" in (value as any) && "to" in (value as any)) {
    // treat as betweenNumber or betweenDate decided by caller
    return "betweenNumber";
  }
  if (typeof value === "boolean") return "equalsBoolean";
  return "contains";
}

export function buildQueryArgsFromTanStack(opts: {
  pagination?: TanStackPagination;
  sorting?: TanStackSorting;
  columnFilters?: TanStackColumnFilter[];
  // provide a meta lookup if available: id -> ColumnMeta
  getMeta?: (id: string) => ColumnMeta | undefined;
  globalFilter?: string | null;
}): QueryArgs {
  const { pagination, sorting, columnFilters, getMeta, globalFilter } = opts;

  const page = pagination ? pagination.pageIndex + 1 : 1;
  const limit = pagination?.pageSize ?? 25;

  const sorts: SortSpec[] = (sorting ?? []).map((s) => ({ id: s.id, desc: !!s.desc }));

  const filters: FilterSpec[] = (columnFilters ?? [])
    .filter((f) => f.value !== undefined && f.value !== null && f.value !== "")
    .map((f) => {
      const meta = getMeta?.(f.id);
      const op = inferOp(f.value, meta);
      // refine between type if meta says "date"
      const finalOp =
        (op === "betweenNumber" && meta?.type === "date") ? "betweenDate" : op;

      return { key: f.id, op: finalOp, value: f.value } as FilterSpec;
    });

  return {
    page,
    limit,
    sorts,
    filters,
    global: globalFilter ?? undefined,
  };
}