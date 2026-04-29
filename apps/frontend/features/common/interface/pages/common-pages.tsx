"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Edit, MoreHorizontal, Plus, Trash2, X } from "lucide-react";
import {
  Badge,
  Button,
  CommonListEmptyState,
  CommonListPageFrame,
  CommonListPaginationCard,
  CommonListPopupFormCard,
  CommonListPopupLayout,
  CommonListTableCard,
  CommonListToolbarCard,
  type CommonListColumnOption,
  type CommonListFilterOption,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  buildCommonListShowingLabel,
  cn,
  useGlobalLoader,
} from "@cxnext/ui";
import {
  createCommonRecord,
  dropCommonRecord,
  fallbackCommonModules,
  forceDeleteCommonRecord,
  formatCommonDate,
  listCommonReferenceLookups,
  listCommonRecords,
  updateCommonRecord,
  type CommonColumnDefinition,
  type CommonModuleDefinition,
  type CommonReferenceLookupMap,
  type CommonRecord,
} from "../../application/common-service";

type DialogMode = "create" | "edit";
type CommonStatusFilter = "all" | "active" | "inactive";

export function CommonListPage({ moduleKey }: { readonly moduleKey: string }) {
  const { show: showGlobalLoader } = useGlobalLoader();
  const [modules, setModules] = useState<readonly CommonModuleDefinition[]>([]);
  const [records, setRecords] = useState<readonly CommonRecord[]>([]);
  const [referenceLookups, setReferenceLookups] = useState<CommonReferenceLookupMap>({});
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<CommonStatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [dialog, setDialog] = useState<{
    readonly mode: DialogMode;
    readonly record: CommonRecord | null;
  } | null>(null);
  const definition =
    modules.find((item) => item.key === moduleKey) ??
    fallbackCommonModules.find((item) => item.key === moduleKey) ??
    null;

  const filteredRecords = useMemo(() => {
    const normalized = searchValue.trim().toLowerCase();
    return records.filter((record) => {
      const matchesSearch =
        !normalized || JSON.stringify(record).toLowerCase().includes(normalized);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && record.isActive) ||
        (statusFilter === "inactive" && !record.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [records, searchValue, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / rowsPerPage));
  const pageRecords = filteredRecords.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );
  const columnOptions = useMemo(
    () =>
      definition
        ? buildCommonColumnOptions({
            definition,
            visibleColumns,
            onToggle: (columnId, checked) =>
              setVisibleColumns((current) => ({ ...current, [columnId]: checked })),
          })
        : [],
    [definition, visibleColumns],
  );

  useEffect(() => {
    const controller = new AbortController();
    const hideGlobalLoader = showGlobalLoader();
    setModules(fallbackCommonModules);
    loadRecordsAndLookups(moduleKey, definition, { signal: controller.signal })
      .then(({ records: nextRecords, referenceLookups: nextReferenceLookups }) => {
        setRecords(nextRecords);
        setReferenceLookups(nextReferenceLookups);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setRecords([]);
        setReferenceLookups({});
        setLoadError(error instanceof Error ? error.message : "Could not load common module.");
      })
      .finally(() => {
        if (!controller.signal.aborted) hideGlobalLoader();
      });
    return () => {
      controller.abort();
      hideGlobalLoader();
    };
  }, [definition, moduleKey, showGlobalLoader]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!definition) return;
    setVisibleColumns(buildDefaultColumnVisibility(definition));
    setStatusFilter("all");
    setSearchValue("");
    setCurrentPage(1);
  }, [definition]);

  async function reload() {
    if (!definition) return;
    const hideGlobalLoader = showGlobalLoader();
    try {
      const nextData = await loadRecordsAndLookups(moduleKey, definition);
      setRecords(nextData.records);
      setReferenceLookups(nextData.referenceLookups);
    } finally {
      hideGlobalLoader();
    }
  }

  async function handleDrop(record: CommonRecord, force = false) {
    const hideGlobalLoader = showGlobalLoader();
    try {
      if (force) await forceDeleteCommonRecord(moduleKey, record.id);
      else await dropCommonRecord(moduleKey, record.id);
      setMessage(force ? "Record force deleted." : "Record dropped.");
      await reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Delete failed.");
    } finally {
      hideGlobalLoader();
    }
  }

  if (!definition && !loadError) {
    return (
      <CommonListPageFrame title="Common" description="" technicalName="page.common.loading">
        {null}
      </CommonListPageFrame>
    );
  }

  return (
    <CommonListPageFrame
      action={
        definition ? (
          <Button
            type="button"
            className="h-11 rounded-xl px-4"
            onClick={() => setDialog({ mode: "create", record: null })}
          >
            <Plus className="size-4" />
            New {definition.label}
          </Button>
        ) : null
      }
      description={
        definition
          ? getModuleDescription(moduleKey, definition.label)
          : "Common module was not found."
      }
      technicalName={`page.common.${moduleKey}`}
      title={definition?.label ?? "Common module"}
    >
      <CommonListToolbarCard
        columns={columnOptions}
        filterOptions={commonStatusFilters}
        filterValue={statusFilter}
        onShowAllColumns={() => {
          if (definition) setVisibleColumns(buildDefaultColumnVisibility(definition));
        }}
        searchPlaceholder="Search any field, id, or status"
        searchValue={searchValue}
        onFilterValueChange={(value) => {
          setStatusFilter(value as CommonStatusFilter);
          setCurrentPage(1);
        }}
        onSearchValueChange={(value) => {
          setSearchValue(value);
          setCurrentPage(1);
        }}
      />
      {message ? <p className="text-sm font-medium text-muted-foreground">{message}</p> : null}
      {loadError ? <CommonListEmptyState>{loadError}</CommonListEmptyState> : null}
      {definition ? (
        <CommonListTableCard className="rounded-md">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] border-collapse text-sm">
              <thead className="bg-muted/55">
                <tr>
                  <Header>#</Header>
                  {definition.columns.map((column) =>
                    visibleColumns[column.key] ? (
                      <Header key={column.key}>{column.label}</Header>
                    ) : null,
                  )}
                  {visibleColumns.status ? <Header>Status</Header> : null}
                  {visibleColumns.updated ? <Header>Updated</Header> : null}
                  <Header className="sticky right-0 z-10 bg-muted/95 text-right">Action</Header>
                </tr>
              </thead>
              <tbody>
                {pageRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className="border-b border-border/60 last:border-b-0 hover:bg-muted/20"
                  >
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    {definition.columns.map((column) =>
                      visibleColumns[column.key] ? (
                        <td key={column.key} className="px-4 py-2.5">
                          {formatValue(record[toCamelCase(column.key)], column, referenceLookups)}
                        </td>
                      ) : null,
                    )}
                    {visibleColumns.status ? (
                      <td className="px-4 py-2.5">
                        <StatusBadge active={record.isActive} />
                      </td>
                    ) : null}
                    {visibleColumns.updated ? (
                      <td className="px-4 py-2.5 text-muted-foreground">
                        {formatCommonDate(record.updatedAt)}
                      </td>
                    ) : null}
                    <td className="sticky right-0 bg-card/95 px-4 py-2 text-right shadow-[-10px_0_18px_-18px_rgba(15,23,42,0.55)]">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-label={`${record.id} actions`}
                            size="icon"
                            variant="ghost"
                            className="size-8 rounded-full"
                          >
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-2xl p-1">
                          <DropdownMenuItem
                            className="gap-2.5"
                            onSelect={() => setDialog({ mode: "edit", record })}
                          >
                            <Edit className="size-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="gap-2.5" onSelect={() => handleDrop(record)}>
                            <Trash2 className="size-4" />
                            Drop
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="gap-2.5 text-destructive focus:text-destructive"
                            onSelect={() => handleDrop(record, true)}
                          >
                            <X className="size-4" />
                            Force delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pageRecords.length === 0 ? (
            <CommonListEmptyState>No records found.</CommonListEmptyState>
          ) : null}
        </CommonListTableCard>
      ) : null}
      <CommonListPaginationCard
        page={currentPage}
        rowsPerPage={rowsPerPage}
        showingLabel={buildCommonListShowingLabel({
          page: currentPage,
          pageSize: rowsPerPage,
          totalCount: filteredRecords.length,
        })}
        singularLabel="records"
        totalCount={filteredRecords.length}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onNextPage={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
        onPreviousPage={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setCurrentPage(1);
        }}
      />
      {definition && dialog ? (
        <CommonUpsertDialog
          definition={definition}
          mode={dialog.mode}
          record={dialog.record}
          onClose={() => setDialog(null)}
          onSaved={async () => {
            setDialog(null);
            setMessage("Record saved.");
            await reload();
          }}
        />
      ) : null}
    </CommonListPageFrame>
  );
}

function CommonUpsertDialog({
  definition,
  mode,
  record,
  onClose,
  onSaved,
}: {
  readonly definition: CommonModuleDefinition;
  readonly mode: DialogMode;
  readonly record: CommonRecord | null;
  readonly onClose: () => void;
  readonly onSaved: () => void | Promise<void>;
}) {
  const { show: showGlobalLoader } = useGlobalLoader();
  const [draft, setDraft] = useState<Record<string, unknown>>(() => buildDraft(definition, record));
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    const validationError = validateDraft(definition, draft);
    if (validationError) {
      setError(validationError);
      return;
    }
    const hideGlobalLoader = showGlobalLoader();
    try {
      if (mode === "edit" && record) await updateCommonRecord(definition.key, record.id, draft);
      else await createCommonRecord(definition.key, draft);
      await onSaved();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Save failed.");
    } finally {
      hideGlobalLoader();
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-background/55 p-4 backdrop-blur-sm">
      <CommonListPopupLayout>
        <CommonListPopupFormCard
          title={mode === "edit" ? `Edit ${definition.label}` : `New ${definition.label}`}
          description="Update the fields and save directly from this popup."
        >
          <div className="grid max-h-[72vh] w-[min(920px,calc(100vw-2rem))] gap-4 overflow-y-auto p-1 md:grid-cols-2">
            {definition.columns.map((column) => (
              <EditorField key={column.key} column={column} draft={draft} setDraft={setDraft} />
            ))}
            <label
              className={cn(
                "flex cursor-pointer items-center justify-between gap-4 rounded-xl border px-4 py-3",
                draft.isActive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-950"
                  : "border-border/70 bg-muted/10",
              )}
            >
              <span className="text-sm font-medium">Active</span>
              <input
                type="checkbox"
                className="size-4 cursor-pointer"
                checked={Boolean(draft.isActive)}
                onChange={(event) =>
                  setDraft((current) => ({ ...current, isActive: event.target.checked }))
                }
              />
            </label>
          </div>
          {error ? <p className="mt-4 text-sm font-medium text-destructive">{error}</p> : null}
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
            <Button type="button" className="rounded-xl" onClick={submit}>
              {mode === "edit" ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CommonListPopupFormCard>
      </CommonListPopupLayout>
    </div>
  );
}

function EditorField({
  column,
  draft,
  setDraft,
}: {
  readonly column: CommonColumnDefinition;
  readonly draft: Record<string, unknown>;
  readonly setDraft: (
    updater: (current: Record<string, unknown>) => Record<string, unknown>,
  ) => void;
}) {
  const key = toCamelCase(column.key);
  if (column.type === "boolean") {
    return (
      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/10 px-4 py-3">
        <span className="text-sm font-medium">{column.label}</span>
        <input
          type="checkbox"
          className="size-4 cursor-pointer"
          checked={Boolean(draft[key])}
          onChange={(event) => setDraft((current) => ({ ...current, [key]: event.target.checked }))}
        />
      </label>
    );
  }
  return (
    <Field label={column.label}>
      <Input
        className="h-11 rounded-xl"
        type={column.type === "number" ? "number" : "text"}
        value={String(draft[key] ?? "")}
        onChange={(event) => {
          const value =
            column.type === "number" ? Number(event.target.value || 0) : event.target.value;
          setDraft((current) => {
            return { ...current, [key]: value };
          });
        }}
      />
    </Field>
  );
}

function Field({ children, label }: { readonly children: ReactNode; readonly label: string }) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

function Header({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <th
      className={cn(
        "border-b border-border/70 px-4 py-2.5 text-left font-medium text-foreground",
        className,
      )}
    >
      {children}
    </th>
  );
}

function StatusBadge({ active }: { readonly active: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        active
          ? "rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
          : "rounded-full border-border/80 text-muted-foreground"
      }
    >
      {active ? "active" : "inactive"}
    </Badge>
  );
}

const commonStatusFilters: readonly CommonListFilterOption[] = [
  { id: "all", label: "All records" },
  { id: "active", label: "active" },
  { id: "inactive", label: "inactive" },
];

function buildDefaultColumnVisibility(definition: CommonModuleDefinition) {
  return Object.fromEntries([
    ...definition.columns.map((column) => [column.key, true] as const),
    ["status", true] as const,
    ["updated", true] as const,
  ]);
}

function buildCommonColumnOptions(params: {
  readonly definition: CommonModuleDefinition;
  readonly visibleColumns: Record<string, boolean>;
  onToggle(columnId: string, checked: boolean): void;
}): readonly CommonListColumnOption[] {
  const columns = [
    ...params.definition.columns.map((column) => ({ id: column.key, label: column.label })),
    { id: "status", label: "Status" },
    { id: "updated", label: "Updated" },
  ];
  const visibleCount = columns.filter((column) => params.visibleColumns[column.id]).length;

  return columns.map((column) => ({
    id: column.id,
    label: column.label,
    checked: Boolean(params.visibleColumns[column.id]),
    disabled: Boolean(params.visibleColumns[column.id]) && visibleCount === 1,
    onCheckedChange: (checked) => params.onToggle(column.id, checked),
  }));
}

const moduleDescriptions: Record<string, string> = {
  countries: "Maintain countries used across addresses, tax, and dialling defaults.",
  states: "Maintain state and province records used by location workflows.",
  districts: "Maintain district records for city and pincode mapping.",
  cities: "Maintain cities used in address and logistics flows.",
  pincodes: "Maintain postal areas and their location mapping.",
  contactGroups: "Classify contacts into customer, vendor, and related groups.",
  contactTypes: "Maintain contact roles used for communication and follow-up.",
  addressTypes: "Maintain address labels such as billing and shipping.",
  bankNames: "Maintain bank names used in account and payment records.",
  productGroups: "Organise products into high-level catalogue groups.",
  productCategories: "Maintain product categories used for catalogue and storefront behaviour.",
  productTypes: "Maintain product type choices for stock and service items.",
  brands: "Maintain brand names used in product records.",
  colours: "Maintain colour options used by product variants.",
  sizes: "Maintain size options used by product variants.",
  styles: "Maintain style options used by product variants.",
  units: "Maintain measuring units used in product and stock entries.",
  hsnCodes: "Maintain HSN codes used for product tax classification.",
  taxes: "Maintain tax rates and labels used in billing workflows.",
  warehouses: "Maintain warehouse locations used for stock movement.",
  transports: "Maintain transport modes and partners used in dispatch.",
  destinations: "Maintain destination labels used in order routing.",
  orderTypes: "Maintain order type choices used by sales and purchase flows.",
  stockRejectionTypes: "Maintain rejection reasons used in stock quality workflows.",
  currencies: "Maintain currencies used for pricing and accounting.",
  paymentTerms: "Maintain payment terms used in customer and vendor transactions.",
};

function getModuleDescription(moduleKey: string, label: string) {
  return (
    moduleDescriptions[moduleKey] ??
    `Maintain ${label.toLowerCase()} records used across the workspace.`
  );
}

function buildDraft(definition: CommonModuleDefinition, record: CommonRecord | null) {
  const draft: Record<string, unknown> = { isActive: record?.isActive ?? true };
  for (const column of definition.columns) {
    const key = toCamelCase(column.key);
    draft[key] =
      record?.[key] ?? (column.type === "boolean" ? false : column.type === "number" ? 0 : "");
  }
  return draft;
}

function validateDraft(definition: CommonModuleDefinition, draft: Record<string, unknown>) {
  for (const column of definition.columns) {
    const value = draft[toCamelCase(column.key)];
    if (
      (column.required || column.nullable === false) &&
      column.type === "string" &&
      !String(value ?? "").trim()
    )
      return `${column.label} is required.`;
  }
  return null;
}

function formatValue(
  value: unknown,
  column: CommonColumnDefinition,
  referenceLookups: CommonReferenceLookupMap,
) {
  if (column.type === "boolean") return <StatusBadge active={Boolean(value)} />;
  if (value === null || value === undefined || value === "") return "-";
  const referenceValue = referenceLookups[column.key]?.get(String(value));
  if (referenceValue) return referenceValue;
  return String(value);
}

function toCamelCase(value: string) {
  return value.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

async function loadRecordsAndLookups(
  moduleKey: string,
  definition: CommonModuleDefinition | null,
  options?: { readonly signal?: AbortSignal },
) {
  const [records, referenceLookups] = await Promise.all([
    listCommonRecords(moduleKey, options),
    definition ? listCommonReferenceLookups(definition, options) : Promise.resolve({}),
  ]);

  return { records, referenceLookups };
}
