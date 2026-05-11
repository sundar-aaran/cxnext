"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Edit, MoreHorizontal, Plus, Trash2, X } from "lucide-react";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  MasterListEmptyState,
  MasterListPageFrame,
  MasterListTableCard,
  MasterListToolbarCard,
  Input,
  Label,
  Switch,
  buildCommonListShowingLabel,
  useGlobalLoader,
} from "@cxnext/ui";
import type { AuthGate, AuthPermission, AuthPolicy, AuthRole, AuthRoleInput } from "../../domain/auth";
import {
  listAuthGates,
  listAuthPermissions,
  listAuthPolicies,
  listAuthRoles,
  deleteAuthRole,
  upsertAuthRole,
} from "../../infrastructure/auth-api";
import { readStoredAuthSession } from "../../infrastructure/session-storage";

type AuthAdminPageKind = "roles" | "permissions" | "policy" | "gate";
type RoleDialogMode = "create" | "edit";

const pageCopy: Record<AuthAdminPageKind, { readonly title: string; readonly description: string }> = {
  roles: {
    title: "Roles",
    description: "Maintain simple role master records for user assignment.",
  },
  permissions: {
    title: "Permissions",
    description: "Review the generated permission catalog used by guards and policies.",
  },
  policy: {
    title: "Policy",
    description: "Review bounded contexts and the actions each context exposes.",
  },
  gate: {
    title: "Gate",
    description: "Inspect effective access for every user after role expansion.",
  },
};

export function RolesPage() {
  const { show: showGlobalLoader } = useGlobalLoader();
  const [roles, setRoles] = useState<readonly AuthRole[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dialog, setDialog] = useState<{
    readonly mode: RoleDialogMode;
    readonly role: AuthRole | null;
  } | null>(null);

  useAuthAdminSession("/desk/admin/roles");

  async function reload() {
    const records = await listAuthRoles();
    setRoles(records);
    setError(null);
  }

  useEffect(() => {
    void reload()
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Could not load roles."),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const filteredRoles = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return roles.filter((role) =>
      (statusFilter === "all" ||
        (statusFilter === "active" && role.isActive) ||
        (statusFilter === "inactive" && !role.isActive)) &&
      (!normalized ||
        [role.name, role.key, role.description ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalized)),
    );
  }, [query, roles, statusFilter]);
  const totalPages = Math.max(1, Math.ceil(filteredRoles.length / rowsPerPage));
  const pageRoles = filteredRoles.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  async function handleDelete(role: AuthRole) {
    if (role.isSystem) {
      setError("System roles cannot be deleted.");
      return;
    }

    if (!window.confirm(`Delete role "${role.name}"?`)) {
      return;
    }

    const hideGlobalLoader = showGlobalLoader();
    try {
      await deleteAuthRole(role.id);
      setRoles((current) => current.filter((item) => item.id !== role.id));
      setError(null);
      toast.success("Role deleted", { description: role.name });
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete role.");
    } finally {
      hideGlobalLoader();
    }
  }

  return (
    <CommonListPageFrame
      action={
        <Button
          type="button"
          className="h-11 rounded-xl px-4"
          onClick={() => setDialog({ mode: "create", role: null })}
        >
          <Plus className="size-4" />
          New Role
        </Button>
      }
      description="Maintain simple role master records for user assignment."
      technicalName="page.auth.roles"
      title="Roles"
    >
      <CommonListToolbarCard
        filterOptions={[
          { id: "all", label: "All records" },
          { id: "active", label: "Active only" },
          { id: "inactive", label: "Inactive only" },
        ]}
        filterValue={statusFilter}
        searchPlaceholder="Search role, key, or description"
        searchValue={query}
        onFilterValueChange={(value) => {
          setStatusFilter(value as "all" | "active" | "inactive");
          setCurrentPage(1);
        }}
        onSearchValueChange={(value) => {
          setQuery(value);
          setCurrentPage(1);
        }}
      />
      {error ? <CommonListEmptyState>{error}</CommonListEmptyState> : null}
      <CommonListTableCard className="rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead className="bg-muted/55">
              <tr>
                <HeaderCell>#</HeaderCell>
                <HeaderCell>Role</HeaderCell>
                <HeaderCell>Key</HeaderCell>
                <HeaderCell>Status</HeaderCell>
                <HeaderCell className="sticky right-0 z-10 bg-muted/95 text-right">Action</HeaderCell>
              </tr>
            </thead>
            <tbody>
              {pageRoles.map((role, index) => (
                <tr key={role.id} className="border-b border-border/60 last:border-b-0 hover:bg-muted/20">
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{role.name}</div>
                    <div className="mt-1 text-xs text-muted-foreground">{role.description}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{role.key}</td>
                  <td className="px-4 py-3">
                    <AccessBadges isActive={role.isActive} isSystem={role.isSystem} />
                  </td>
                  <td className="sticky right-0 bg-card/95 px-4 py-2 text-right shadow-[-10px_0_18px_-18px_rgba(15,23,42,0.55)]">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-label={`${role.name} actions`}
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
                          onSelect={() => setDialog({ mode: "edit", role })}
                        >
                          <Edit className="size-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2.5 text-destructive focus:text-destructive"
                          disabled={role.isSystem}
                          onSelect={() => void handleDelete(role)}
                        >
                          <Trash2 className="size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && pageRoles.length === 0 ? (
          <CommonListEmptyState>No roles found.</CommonListEmptyState>
        ) : null}
        {isLoading ? <CommonListEmptyState>Loading roles...</CommonListEmptyState> : null}
      </CommonListTableCard>
      <CommonListPaginationCard
        page={currentPage}
        rowsPerPage={rowsPerPage}
        showingLabel={buildCommonListShowingLabel({
          page: currentPage,
          pageSize: rowsPerPage,
          totalCount: filteredRoles.length,
        })}
        singularLabel="roles"
        totalCount={filteredRoles.length}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onNextPage={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
        onPreviousPage={() => setCurrentPage((page) => Math.max(1, page - 1))}
        onRowsPerPageChange={(value) => {
          setRowsPerPage(value);
          setCurrentPage(1);
        }}
      />
      {dialog ? (
        <RoleUpsertDialog
          mode={dialog.mode}
          role={dialog.role}
          onClose={() => setDialog(null)}
          onSaved={async () => {
            const savedAction = dialog.mode === "edit" ? "updated" : "created";
            setDialog(null);
            toast.success(`Role ${savedAction}`, {
              description: "Changes are ready in the list.",
            });
            await reload();
          }}
        />
      ) : null}
    </CommonListPageFrame>
  );
}

function RoleUpsertDialog({
  mode,
  role,
  onClose,
  onSaved,
}: {
  readonly mode: RoleDialogMode;
  readonly role: AuthRole | null;
  readonly onClose: () => void;
  readonly onSaved: () => void | Promise<void>;
}) {
  const { show: showGlobalLoader } = useGlobalLoader();
  const [form, setForm] = useState<AuthRoleInput>(() => ({
    key: role?.key ?? "",
    name: role?.name ?? "",
    description: role?.description ?? "",
    isActive: role?.isActive ?? true,
  }));
  const [error, setError] = useState<string | null>(null);
  const isSystemRole = Boolean(role?.isSystem);

  async function submit() {
    if (!form.name.trim()) {
      setError("Role name is required.");
      return;
    }

    if (!form.key.trim()) {
      setError("Role key is required.");
      return;
    }

    const hideGlobalLoader = showGlobalLoader();
    try {
      await upsertAuthRole(form, role?.id);
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
          title={mode === "edit" ? "Edit Role" : "New Role"}
          description="Keep roles simple. Permissions are reviewed from the user access pages."
        >
          <div className="grid w-[min(720px,calc(100vw-2rem))] gap-4 p-1 md:grid-cols-2">
            <RoleField label="Role name">
              <Input
                className="h-11 rounded-xl"
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({ ...current, name: event.target.value }))
                }
              />
            </RoleField>
            <RoleField label="Role key">
              <Input
                className="h-11 rounded-xl font-mono"
                disabled={isSystemRole}
                value={form.key}
                onChange={(event) =>
                  setForm((current) => ({ ...current, key: event.target.value }))
                }
              />
            </RoleField>
            <div className="md:col-span-2">
              <RoleField label="Description">
                <textarea
                  className="min-h-24 rounded-xl border border-input bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  value={form.description ?? ""}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, description: event.target.value }))
                  }
                />
              </RoleField>
            </div>
            <label
              className={
                form.isActive
                  ? "flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-emerald-300 bg-emerald-50/90 px-4 py-3 text-emerald-950 shadow-sm shadow-emerald-100/80 ring-1 ring-emerald-100"
                  : "flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/10 px-4 py-3"
              }
            >
              <span>
                <span className="block text-sm font-medium">Active</span>
                <span className="block text-xs text-muted-foreground">
                  Active roles can be assigned to users.
                </span>
              </span>
              <Switch
                checked={form.isActive}
                aria-label="Active"
                onCheckedChange={(checked) =>
                  setForm((current) => ({ ...current, isActive: checked }))
                }
              />
            </label>
          </div>
          {error ? <p className="mt-4 text-sm font-medium text-destructive">{error}</p> : null}
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-border/70 pt-4">
            <Button type="button" className="rounded-xl" onClick={() => void submit()}>
              {mode === "edit" ? "Update" : "Create"}
            </Button>
            <Button type="button" variant="outline" className="rounded-xl" onClick={onClose}>
              <X className="size-4" />
              Cancel
            </Button>
          </div>
        </CommonListPopupFormCard>
      </CommonListPopupLayout>
    </div>
  );
}

function RoleField({ children, label }: { readonly children: ReactNode; readonly label: string }) {
  return (
    <div className="grid gap-2">
      <Label className="text-sm font-medium">{label}</Label>
      {children}
    </div>
  );
}

export function PermissionsPage() {
  const [permissions, setPermissions] = useState<readonly AuthPermission[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useAuthAdminSession("/desk/admin/permissions");

  useEffect(() => {
    void listAuthPermissions()
      .then((records) => {
        setPermissions(records);
        setError(null);
      })
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Could not load permissions."),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const filteredPermissions = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return permissions;
    return permissions.filter((permission) =>
      [permission.name, permission.key, permission.moduleKey, permission.action]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [permissions, query]);

  const groupedPermissions = useMemo(() => {
    const groups = new Map<string, AuthPermission[]>();
    for (const permission of filteredPermissions) {
      groups.set(permission.moduleKey, [...(groups.get(permission.moduleKey) ?? []), permission]);
    }

    return [...groups.entries()].sort(([left], [right]) => left.localeCompare(right));
  }, [filteredPermissions]);

  return (
    <AuthAdminFrame kind="permissions">
      <SearchToolbar value={query} onChange={setQuery} placeholder="Search permission or module" />
      <ErrorState error={error} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {groupedPermissions.map(([moduleKey, modulePermissions]) => (
          <MasterListTableCard key={moduleKey} className="rounded-md">
            <div className="border-b border-border/70 bg-muted/45 px-4 py-3">
              <div className="text-sm font-semibold capitalize text-foreground">{moduleKey}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {modulePermissions.length} permissions
              </div>
            </div>
            <div className="divide-y divide-border/60">
              {modulePermissions.map((permission) => (
                <div key={permission.key} className="px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-foreground">{permission.name}</div>
                    <Badge variant="outline">{permission.action}</Badge>
                  </div>
                  <div className="mt-1 font-mono text-xs text-muted-foreground">{permission.key}</div>
                </div>
              ))}
            </div>
          </MasterListTableCard>
        ))}
      </div>
      {!isLoading && groupedPermissions.length === 0 ? (
        <MasterListEmptyState>No permissions found.</MasterListEmptyState>
      ) : null}
      {isLoading ? <MasterListEmptyState>Loading permissions...</MasterListEmptyState> : null}
    </AuthAdminFrame>
  );
}

export function PolicyPage() {
  const [policies, setPolicies] = useState<readonly AuthPolicy[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useAuthAdminSession("/desk/admin/policy");

  useEffect(() => {
    void listAuthPolicies()
      .then((records) => {
        setPolicies(records);
        setError(null);
      })
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Could not load policies."),
      )
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AuthAdminFrame kind="policy">
      <ErrorState error={error} />
      <MasterListTableCard className="rounded-md">
        <div className="grid gap-4 md:grid-cols-2">
          {policies.map((policy) => (
            <div key={policy.key} className="rounded-md border border-border/70 bg-background p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">{policy.name}</div>
                  <div className="mt-1 font-mono text-xs text-muted-foreground">{policy.key}</div>
                </div>
                <Badge variant="outline">{policy.boundedContext}</Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{policy.description}</p>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {policy.actions.map((action) => (
                  <Badge key={action} variant="secondary">
                    {action}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
        {!isLoading && policies.length === 0 ? (
          <MasterListEmptyState>No policies found.</MasterListEmptyState>
        ) : null}
        {isLoading ? <MasterListEmptyState>Loading policies...</MasterListEmptyState> : null}
      </MasterListTableCard>
    </AuthAdminFrame>
  );
}

export function GatePage() {
  const [gates, setGates] = useState<readonly AuthGate[]>([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useAuthAdminSession("/desk/admin/gate");

  useEffect(() => {
    void listAuthGates()
      .then((records) => {
        setGates(records);
        setError(null);
      })
      .catch((loadError) =>
        setError(loadError instanceof Error ? loadError.message : "Could not load gates."),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const filteredGates = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return gates;
    return gates.filter((gate) =>
      [gate.displayName, gate.username, gate.email, gate.tenant.name, gate.roleKeys.join(" ")]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [gates, query]);

  return (
    <AuthAdminFrame kind="gate">
      <SearchToolbar value={query} onChange={setQuery} placeholder="Search user or role" />
      <ErrorState error={error} />
      <MasterListTableCard className="rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead className="bg-muted/55">
              <tr>
                <HeaderCell>User</HeaderCell>
                <HeaderCell>Tenant</HeaderCell>
                <HeaderCell>Roles</HeaderCell>
                <HeaderCell>Status</HeaderCell>
                <HeaderCell className="text-right">Action</HeaderCell>
              </tr>
            </thead>
            <tbody>
              {filteredGates.map((gate) => (
                <tr key={gate.userId} className="border-b border-border/60 last:border-b-0 hover:bg-muted/20">
                  <td className="px-4 py-3">
                    <Link
                      href={`/desk/admin/users/${gate.userId}`}
                      className="font-medium text-foreground transition hover:underline"
                    >
                      {gate.displayName}
                    </Link>
                    <div className="mt-1 text-xs text-muted-foreground">{gate.email}</div>
                  </td>
                  <td className="px-4 py-3">{gate.tenant.name}</td>
                  <td className="px-4 py-3">{gate.roleKeys.join(", ")}</td>
                  <td className="px-4 py-3">
                    <AccessBadges isActive={gate.isActive} />
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button asChild variant="outline" size="sm" className="rounded-xl">
                      <Link href={`/desk/admin/users/${gate.userId}`}>
                        View
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!isLoading && filteredGates.length === 0 ? (
          <MasterListEmptyState>No gate records found.</MasterListEmptyState>
        ) : null}
        {isLoading ? <MasterListEmptyState>Loading gates...</MasterListEmptyState> : null}
      </MasterListTableCard>
    </AuthAdminFrame>
  );
}

function AuthAdminFrame({
  action,
  children,
  kind,
}: {
  readonly action?: ReactNode;
  readonly children: ReactNode;
  readonly kind: AuthAdminPageKind;
}) {
  return (
    <MasterListPageFrame
      action={action}
      description={pageCopy[kind].description}
      technicalName={`page.auth.${kind}`}
      title={pageCopy[kind].title}
    >
      {children}
    </MasterListPageFrame>
  );
}

function SearchToolbar({
  onChange,
  placeholder,
  value,
}: {
  readonly onChange: (value: string) => void;
  readonly placeholder: string;
  readonly value: string;
}) {
  return (
    <MasterListToolbarCard
      searchPlaceholder={placeholder}
      searchValue={value}
      onSearchValueChange={onChange}
    />
  );
}

function HeaderCell({
  children,
  className = "",
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <th className={`border-b border-border/70 px-4 py-2.5 text-left font-medium text-foreground ${className}`}>
      {children}
    </th>
  );
}

function AccessBadges({
  isActive,
  isSystem,
}: {
  readonly isActive: boolean;
  readonly isSystem?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Badge variant="outline" className={isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : ""}>
        {isActive ? "active" : "inactive"}
      </Badge>
      {isSystem ? <Badge variant="secondary">system</Badge> : null}
    </div>
  );
}

function ErrorState({ error }: { readonly error: string | null }) {
  return error ? (
    <MasterListEmptyState className="rounded-2xl border border-destructive/20 bg-destructive/5 text-destructive">
      {error}
    </MasterListEmptyState>
  ) : null;
}

function useAuthAdminSession(nextPath: string) {
  useEffect(() => {
    if (!readStoredAuthSession()) {
      window.location.href = `/login?next=${encodeURIComponent(nextPath)}`;
    }
  }, [nextPath]);
}
