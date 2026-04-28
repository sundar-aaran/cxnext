"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Label,
  MasterListEmptyState,
  MasterListPageFrame,
  MasterListPaginationCard,
  MasterListShowCard,
  MasterListShowLayout,
  MasterListTableCard,
  MasterListToolbarCard,
  MasterListUpsertCard,
  MasterListUpsertLayout,
  Separator,
  buildMasterListShowingLabel,
} from "@cxnext/ui";
import {
  buildTenantColumnOptions,
  createTenantSlug,
  filterTenants,
  formatTenantDate,
  getTenant,
  listTenants,
  softDeleteTenant,
  upsertTenant,
} from "../../application/tenant-service";
import {
  TENANTS_TABLE_NAME,
  defaultTenantColumnVisibility,
  tenantStatusFilters,
  type TenantColumnId,
  type TenantRecord,
  type TenantStatusFilter,
} from "../../domain/tenant";

const tenantSchema = z.object({
  name: z.string().min(2, "Enter tenant name"),
  slug: z
    .string()
    .min(2, "Enter tenant slug")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Use lowercase letters, numbers, and hyphens",
    }),
  isActive: z.boolean(),
});

type TenantSortKey = Exclude<TenantColumnId, "status"> | "status";
type TenantSortDirection = "asc" | "desc";

export function TenantListPage() {
  const router = useRouter();
  const [tenants, setTenants] = useState(() => listTenants({ source: "seed" }));
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<TenantStatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [sortState, setSortState] = useState<{
    readonly key: TenantSortKey;
    readonly direction: TenantSortDirection;
  }>({
    key: "name",
    direction: "asc",
  });
  const [visibleColumns, setVisibleColumns] = useState<Record<TenantColumnId, boolean>>(
    defaultTenantColumnVisibility,
  );

  const filteredTenants = useMemo(() => {
    const matchingTenants = filterTenants({
      tenants,
      searchValue,
      statusFilter,
    });

    return [...matchingTenants].sort((left, right) =>
      compareTenantRecords(left, right, sortState.key, sortState.direction),
    );
  }, [searchValue, sortState.direction, sortState.key, statusFilter, tenants]);

  const totalPages = Math.max(1, Math.ceil(filteredTenants.length / rowsPerPage));

  useEffect(() => {
    setTenants(listTenants());
  }, []);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const pageTenants = filteredTenants.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  const columnOptions = useMemo(
    () =>
      buildTenantColumnOptions({
        visibleColumns,
        onToggle: (columnId, checked) => {
          setVisibleColumns((currentValue) => ({
            ...currentValue,
            [columnId]: checked,
          }));
        },
      }),
    [visibleColumns],
  );

  function deleteTenant(tenant: TenantRecord) {
    softDeleteTenant(tenant.id);
    setTenants(listTenants());
  }

  function showAllColumns() {
    setVisibleColumns(defaultTenantColumnVisibility);
  }

  function toggleSort(nextKey: TenantSortKey) {
    setSortState((currentValue) => {
      if (currentValue.key === nextKey) {
        return {
          key: nextKey,
          direction: currentValue.direction === "asc" ? "desc" : "asc",
        };
      }

      return {
        key: nextKey,
        direction: "asc",
      };
    });
  }

  return (
    <MasterListPageFrame
      action={
        <Button asChild className="h-11 rounded-xl px-4">
          <Link href="/desk/tenant/new">
            <Plus className="size-4" />
            New Tenant
          </Link>
        </Button>
      }
      description="Create and review organisation tenant records."
      technicalName="page.tenant.list"
      title="Tenants"
    >
      <MasterListToolbarCard
        columns={columnOptions}
        filterOptions={tenantStatusFilters}
        filterValue={statusFilter}
        onFilterValueChange={(nextValue) => {
          setStatusFilter(nextValue as TenantStatusFilter);
          setCurrentPage(1);
        }}
        onSearchValueChange={(nextValue) => {
          setSearchValue(nextValue);
          setCurrentPage(1);
        }}
        onShowAllColumns={showAllColumns}
        searchPlaceholder="Search tenant, slug, status, or id"
        searchValue={searchValue}
      />

      <MasterListTableCard className="rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-sm">
            <thead className="bg-muted/55">
              <tr>
                <th className="w-16 border-b border-border/70 px-4 py-2.5 text-left text-sm font-medium text-foreground">
                  #
                </th>
                {visibleColumns.name ? (
                  <TableHeaderCell
                    label="Tenant"
                    sortDirection={sortState.key === "name" ? sortState.direction : null}
                    onSort={() => toggleSort("name")}
                  />
                ) : null}
                {visibleColumns.slug ? (
                  <TableHeaderCell
                    label="Slug"
                    sortDirection={sortState.key === "slug" ? sortState.direction : null}
                    onSort={() => toggleSort("slug")}
                  />
                ) : null}
                {visibleColumns.status ? (
                  <TableHeaderCell
                    label="Status"
                    sortDirection={sortState.key === "status" ? sortState.direction : null}
                    onSort={() => toggleSort("status")}
                  />
                ) : null}
                {visibleColumns.updated ? (
                  <TableHeaderCell
                    label="Updated"
                    sortDirection={sortState.key === "updated" ? sortState.direction : null}
                    onSort={() => toggleSort("updated")}
                  />
                ) : null}
                <th className="w-24 border-b border-border/70 px-4 py-2.5 text-right text-sm font-medium text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {pageTenants.map((tenant, index) => (
                <tr
                  key={tenant.id}
                  className="border-b border-border/60 last:border-b-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-2.5 text-sm text-muted-foreground">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>
                  {visibleColumns.name ? (
                    <td className="px-4 py-2.5">
                      <button
                        type="button"
                        className="text-left font-medium text-foreground hover:underline"
                        onClick={() => router.push(`/desk/tenant/${tenant.id}`)}
                      >
                        {tenant.name}
                      </button>
                    </td>
                  ) : null}
                  {visibleColumns.slug ? (
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                      {tenant.slug}
                    </td>
                  ) : null}
                  {visibleColumns.status ? (
                    <td className="px-4 py-2.5">
                      <TenantStatusBadge isActive={tenant.isActive} />
                    </td>
                  ) : null}
                  {visibleColumns.updated ? (
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {formatTenantDate(tenant.updatedAt)}
                    </td>
                  ) : null}
                  <td className="px-4 py-2 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-8 rounded-full border border-transparent hover:border-border/80 hover:bg-background data-[state=open]:border-border/80 data-[state=open]:bg-muted/70"
                          aria-label="Tenant actions"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 rounded-2xl p-1">
                        <DropdownMenuItem asChild>
                          <Link href={`/desk/tenant/${tenant.id}`} className="gap-2.5">
                            <Eye className="size-4" />
                            View tenant
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/desk/tenant/${tenant.id}/edit`} className="gap-2.5">
                            <Pencil className="size-4" />
                            Edit tenant
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2.5 text-destructive focus:text-destructive"
                          onSelect={() => deleteTenant(tenant)}
                        >
                          <Trash2 className="size-4" />
                          Soft delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {pageTenants.length === 0 ? (
          <MasterListEmptyState>No tenants found.</MasterListEmptyState>
        ) : null}
      </MasterListTableCard>

      <MasterListPaginationCard
        page={currentPage}
        rowsPerPage={rowsPerPage}
        showingLabel={buildMasterListShowingLabel({
          page: currentPage,
          pageSize: rowsPerPage,
          totalCount: filteredTenants.length,
        })}
        singularLabel="tenants"
        totalCount={filteredTenants.length}
        totalPages={totalPages}
        onPageChange={(nextPage) => setCurrentPage(nextPage)}
        onNextPage={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
        onPreviousPage={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onRowsPerPageChange={(nextValue) => {
          setRowsPerPage(nextValue);
          setCurrentPage(1);
        }}
      />
    </MasterListPageFrame>
  );
}

export function TenantShowPage({ tenantId }: { readonly tenantId: number }) {
  const router = useRouter();
  const [tenant, setTenant] = useState(() => getTenant(tenantId, { source: "seed" }));

  useEffect(() => {
    setTenant(getTenant(tenantId));
  }, [tenantId]);

  if (!tenant) {
    return (
      <MasterListPageFrame
        description="The requested tenant record was not found."
        technicalName="page.tenant.show.missing"
        title="Tenant not found"
      >
        <MasterListShowCard title="Tenant detail">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Return to the tenant list.</p>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/desk/tenant">Back to tenants</Link>
            </Button>
          </div>
        </MasterListShowCard>
      </MasterListPageFrame>
    );
  }

  const currentTenant = tenant;

  function handleSoftDelete() {
    softDeleteTenant(currentTenant.id);
    setTenant(null);
    router.push("/desk/tenant");
  }

  return (
    <MasterListPageFrame
      action={
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/desk/tenant">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <Button asChild className="rounded-xl">
            <Link href={`/desk/tenant/${currentTenant.id}/edit`}>
              <Pencil className="size-4" />
              Edit
            </Link>
          </Button>
          <Button type="button" variant="outline" className="rounded-xl" onClick={handleSoftDelete}>
            <Trash2 className="size-4" />
            Soft delete
          </Button>
        </div>
      }
      description="Review tenant identity, status, and audit timestamps."
      technicalName="page.tenant.show"
      title={currentTenant.name}
    >
      <MasterListShowLayout
        cards={[
          <MasterListShowCard
            key="detail"
            description={`Record from table ${TENANTS_TABLE_NAME}.`}
            title="Tenant detail"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TenantDetailField label="ID" value={String(currentTenant.id)} />
              <TenantDetailField label="Name" value={currentTenant.name} />
              <TenantDetailField label="Slug" value={currentTenant.slug} monospace />
              <div className="grid gap-1">
                <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                  Active
                </span>
                <TenantStatusBadge isActive={currentTenant.isActive} />
              </div>
            </div>
          </MasterListShowCard>,
          <MasterListShowCard
            key="audit"
            description="Timestamp and soft delete fields."
            title="Audit"
          >
            <div className="grid gap-4">
              <TenantDetailField
                label="Created at"
                value={formatTenantDate(currentTenant.createdAt)}
              />
              <TenantDetailField
                label="Updated at"
                value={formatTenantDate(currentTenant.updatedAt)}
              />
              <TenantDetailField
                label="Deleted at"
                value={formatTenantDate(currentTenant.deletedAt)}
              />
            </div>
          </MasterListShowCard>,
        ]}
      />
    </MasterListPageFrame>
  );
}

export function TenantUpsertPage({ tenantId }: { readonly tenantId?: number }) {
  const router = useRouter();
  const existingTenant = tenantId ? getTenant(tenantId) : null;
  const isEdit = Boolean(tenantId);
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {
      name: existingTenant?.name ?? "",
      slug: existingTenant?.slug ?? "",
      isActive: existingTenant?.isActive ?? true,
    },
    onSubmit: ({ value }) => {
      const parsedValue = tenantSchema.safeParse(value);
      if (!parsedValue.success) {
        setMessage("Resolve validation errors before saving.");
        return;
      }

      const tenant = upsertTenant(parsedValue.data, tenantId);
      setMessage(`Saved tenant ${tenant.name}.`);
      router.push(`/desk/tenant/${tenant.id}`);
    },
  });

  if (isEdit && !existingTenant) {
    return (
      <MasterListPageFrame
        description="The requested tenant record was not found."
        technicalName="page.tenant.upsert.missing"
        title="Tenant not found"
      >
        <MasterListUpsertCard title="Tenant setup">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Return to the tenant list.</p>
            <Button asChild variant="outline" className="rounded-xl">
              <Link href="/desk/tenant">Back to tenants</Link>
            </Button>
          </div>
        </MasterListUpsertCard>
      </MasterListPageFrame>
    );
  }

  return (
    <MasterListPageFrame
      action={
        <Button asChild variant="outline" className="rounded-xl">
          <Link href="/desk/tenant">Cancel</Link>
        </Button>
      }
      description={
        isEdit
          ? "Update tenant identity and active status."
          : "Create a tenant record with an auto-numbered integer id."
      }
      technicalName="page.tenant.upsert"
      title={isEdit ? "Edit tenant" : "New tenant"}
    >
      <MasterListUpsertLayout>
        <MasterListUpsertCard
          description="Fields map to id, name, slug, active status, timestamps, and soft delete."
          title={isEdit ? (existingTenant?.name ?? "Tenant setup") : "Tenant setup"}
        >
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <form.Field
                name="name"
                validators={{
                  onChange: ({ value }) => {
                    const result = tenantSchema.shape.name.safeParse(value);
                    return result.success ? undefined : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <FieldShell error={field.state.meta.errors[0]} label="Tenant name">
                    <Input
                      name={field.name}
                      value={field.state.value}
                      placeholder="Acme Inc"
                      className="h-11 rounded-xl"
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        const nextName = event.target.value;
                        field.handleChange(nextName);
                        if (!isEdit) {
                          form.setFieldValue("slug", createTenantSlug(nextName));
                        }
                      }}
                    />
                  </FieldShell>
                )}
              </form.Field>
              <form.Field
                name="slug"
                validators={{
                  onChange: ({ value }) => {
                    const result = tenantSchema.shape.slug.safeParse(value);
                    return result.success ? undefined : result.error.issues[0]?.message;
                  },
                }}
              >
                {(field) => (
                  <FieldShell error={field.state.meta.errors[0]} label="Slug">
                    <Input
                      name={field.name}
                      value={field.state.value}
                      placeholder="acme-inc"
                      className="h-11 rounded-xl"
                      onBlur={field.handleBlur}
                      onChange={(event) => field.handleChange(createTenantSlug(event.target.value))}
                    />
                  </FieldShell>
                )}
              </form.Field>
            </div>
            <form.Field name="isActive">
              {(field) => (
                <label className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl border border-border/70 bg-muted/10 px-4 py-3">
                  <span>
                    <span className="block text-sm font-medium text-foreground">Is active</span>
                    <span className="block text-xs text-muted-foreground">
                      Active tenants can be selected in organisation workflows.
                    </span>
                  </span>
                  <input
                    checked={field.state.value}
                    className="size-4 accent-current"
                    type="checkbox"
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.checked)}
                  />
                </label>
              )}
            </form.Field>
            {message ? (
              <p className="text-sm font-medium text-muted-foreground">{message}</p>
            ) : null}
            <Separator />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" className="rounded-xl">
                {isEdit ? "Update tenant" : "Create tenant"}
              </Button>
              <Button asChild type="button" variant="outline" className="rounded-xl">
                <Link href="/desk/tenant">Cancel</Link>
              </Button>
            </div>
          </form>
        </MasterListUpsertCard>
      </MasterListUpsertLayout>
    </MasterListPageFrame>
  );
}

function TableHeaderCell({
  label,
  onSort,
  sortDirection,
}: {
  readonly label: string;
  readonly onSort: () => void;
  readonly sortDirection: TenantSortDirection | null;
}) {
  return (
    <th className="border-b border-border/70 px-4 py-2.5 text-left text-sm font-medium text-foreground">
      <div className="flex items-center gap-2">
        <span>{label}</span>
        <button
          type="button"
          className="inline-flex size-5 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`Sort ${label}`}
          onClick={onSort}
        >
          {sortDirection === "asc" ? (
            <ArrowUp className="size-4" />
          ) : sortDirection === "desc" ? (
            <ArrowDown className="size-4" />
          ) : (
            <ArrowUpDown className="size-4" />
          )}
        </button>
      </div>
    </th>
  );
}

function compareTenantRecords(
  left: TenantRecord,
  right: TenantRecord,
  key: TenantSortKey,
  direction: TenantSortDirection,
) {
  const multiplier = direction === "asc" ? 1 : -1;

  if (key === "updated") {
    return (new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime()) * multiplier;
  }

  if (key === "status") {
    return String(left.isActive).localeCompare(String(right.isActive)) * multiplier;
  }

  return left[key].localeCompare(right[key]) * multiplier;
}

function TenantStatusBadge({ isActive }: { readonly isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? "rounded-full border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/70 dark:bg-emerald-950/30 dark:text-emerald-300"
          : "rounded-full border-border/80 bg-background text-muted-foreground"
      }
    >
      {isActive ? "active" : "inactive"}
    </Badge>
  );
}

function TenantDetailField({
  label,
  monospace = false,
  value,
}: {
  readonly label: string;
  readonly monospace?: boolean;
  readonly value: string;
}) {
  return (
    <div className="grid gap-1">
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </span>
      <span className={monospace ? "font-mono text-sm text-foreground" : "text-sm text-foreground"}>
        {value}
      </span>
    </div>
  );
}

function FieldShell({
  children,
  error,
  label,
}: {
  readonly children: ReactNode;
  readonly error: unknown;
  readonly label: string;
}) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{String(error)}</p> : null}
    </div>
  );
}
