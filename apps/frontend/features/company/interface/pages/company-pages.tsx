"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Eye, MoreHorizontal, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import {
  AnimatedTabs,
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
  Switch,
  buildMasterListShowingLabel,
  useGlobalLoader,
} from "@cxnext/ui";
import { listIndustries } from "../../../industry/application/industry-service";
import type { IndustryRecord } from "../../../industry/domain/industry";
import { listTenants } from "../../../tenant/application/tenant-service";
import type { TenantRecord } from "../../../tenant/domain/tenant";
import {
  buildCompanyColumnOptions,
  filterCompanies,
  formatCompanyDate,
  getCompany,
  listCompanies,
  softDeleteCompany,
  upsertCompany,
} from "../../application/company-service";
import {
  companyStatusFilters,
  defaultCompanyColumnVisibility,
  type CompanyColumnId,
  type CompanyRecord,
  type CompanyStatusFilter,
  type CompanyUpsertInput,
} from "../../domain/company";

const companySchema = z.object({
  tenantId: z.number().int().positive(),
  industryId: z.number().int().positive(),
  name: z.string().trim().min(2, "Enter company name"),
  legalName: z.string().nullable(),
  tagline: z.string().nullable(),
  shortAbout: z.string().nullable(),
  registrationNumber: z.string().nullable(),
  pan: z.string().nullable(),
  financialYearStart: z.string().nullable(),
  booksStart: z.string().nullable(),
  website: z.string().nullable(),
  description: z.string().nullable(),
  primaryEmail: z.string().nullable(),
  primaryPhone: z.string().nullable(),
  isPrimary: z.boolean(),
  isActive: z.boolean(),
});

export function CompanyListPage() {
  const router = useRouter();
  const { show: showGlobalLoader } = useGlobalLoader();
  const [companies, setCompanies] = useState<readonly CompanyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState("");
  const [statusFilter, setStatusFilter] = useState<CompanyStatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [visibleColumns, setVisibleColumns] = useState<Record<CompanyColumnId, boolean>>(
    defaultCompanyColumnVisibility,
  );

  const filteredCompanies = useMemo(
    () => filterCompanies({ companies, searchValue, statusFilter }),
    [companies, searchValue, statusFilter],
  );
  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / rowsPerPage));
  const pageCompanies = filteredCompanies.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );
  const columnOptions = useMemo(
    () =>
      buildCompanyColumnOptions({
        visibleColumns,
        onToggle: (columnId, checked) =>
          setVisibleColumns((currentValue) => ({ ...currentValue, [columnId]: checked })),
      }),
    [visibleColumns],
  );

  useEffect(() => {
    const controller = new AbortController();
    const hideGlobalLoader = showGlobalLoader();

    listCompanies({ signal: controller.signal })
      .then((records) => {
        setCompanies(records);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setCompanies([]);
          setLoadError(getErrorMessage(error));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          hideGlobalLoader();
        }
      });

    return () => {
      controller.abort();
      hideGlobalLoader();
    };
  }, [showGlobalLoader]);

  async function deleteCompany(company: CompanyRecord) {
    const hideGlobalLoader = showGlobalLoader();

    try {
      await softDeleteCompany(company.id);
      setCompanies((currentCompanies) => currentCompanies.filter((item) => item.id !== company.id));
      toast.success("Company deleted", { description: `${company.name} was soft deleted.` });
    } catch (error) {
      toast.error("Could not delete company", { description: getErrorMessage(error) });
    } finally {
      hideGlobalLoader();
    }
  }

  return (
    <MasterListPageFrame
      action={
        <Button asChild className="h-11 rounded-xl px-4">
          <Link href="/desk/company/new">
            <Plus className="size-4" />
            New Company
          </Link>
        </Button>
      }
      description="Create and review tenant and industry specific company records."
      technicalName="page.organisation.companies"
      title="Companies"
    >
      <MasterListToolbarCard
        columns={columnOptions}
        filterOptions={companyStatusFilters}
        filterValue={statusFilter}
        onFilterValueChange={(nextValue) => {
          setStatusFilter(nextValue as CompanyStatusFilter);
          setCurrentPage(1);
        }}
        onSearchValueChange={(nextValue) => {
          setSearchValue(nextValue);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search company, tenant, industry, status, or id"
        searchValue={searchValue}
      />
      {loadError ? <MasterListEmptyState>{loadError}</MasterListEmptyState> : null}
      <MasterListTableCard className="rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] border-collapse text-sm">
            <thead className="bg-muted/55">
              <tr>
                <th className="w-16 border-b border-border/70 px-4 py-2.5 text-left font-medium text-foreground">
                  #
                </th>
                {visibleColumns.name ? <ListHeader>Company</ListHeader> : null}
                {visibleColumns.tenant ? <ListHeader>Tenant</ListHeader> : null}
                {visibleColumns.industry ? <ListHeader>Industry</ListHeader> : null}
                {visibleColumns.status ? <ListHeader>Status</ListHeader> : null}
                {visibleColumns.updated ? <ListHeader>Updated</ListHeader> : null}
                <th className="w-24 border-b border-border/70 px-4 py-2.5 text-right font-medium text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {pageCompanies.map((company, index) => (
                <tr
                  key={company.id}
                  className="border-b border-border/60 last:border-b-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {(currentPage - 1) * rowsPerPage + index + 1}
                  </td>
                  {visibleColumns.name ? (
                    <td className="px-4 py-2.5">
                      <button
                        type="button"
                        className="cursor-pointer text-left font-medium text-foreground hover:underline"
                        onClick={() => {
                          showGlobalLoader();
                          router.push(`/desk/company/${company.id}`);
                        }}
                      >
                        {company.name}
                      </button>
                    </td>
                  ) : null}
                  {visibleColumns.tenant ? (
                    <td className="px-4 py-2.5 text-muted-foreground">{company.tenantName}</td>
                  ) : null}
                  {visibleColumns.industry ? (
                    <td className="px-4 py-2.5 text-muted-foreground">{company.industryName}</td>
                  ) : null}
                  {visibleColumns.status ? (
                    <td className="px-4 py-2.5">
                      <StatusBadge isActive={company.isActive} />
                    </td>
                  ) : null}
                  {visibleColumns.updated ? (
                    <td className="px-4 py-2.5 text-muted-foreground">
                      {formatCompanyDate(company.updatedAt)}
                    </td>
                  ) : null}
                  <td className="px-4 py-2 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          aria-label={`${company.name} actions`}
                          size="icon"
                          variant="ghost"
                          className="size-8 rounded-full border border-transparent hover:border-border/80 hover:bg-background"
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-36 rounded-2xl p-1">
                        <DropdownMenuItem asChild>
                          <Link href={`/desk/company/${company.id}`} className="gap-2.5">
                            <Eye className="size-4" />
                            View company
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/desk/company/${company.id}/edit?returnTo=list`}
                            className="gap-2.5"
                          >
                            <Pencil className="size-4" />
                            Edit company
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="gap-2.5 text-destructive focus:text-destructive"
                          onSelect={() => deleteCompany(company)}
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
        {pageCompanies.length === 0 && !isLoading ? (
          <MasterListEmptyState>No companies found.</MasterListEmptyState>
        ) : null}
      </MasterListTableCard>
      <MasterListPaginationCard
        page={currentPage}
        rowsPerPage={rowsPerPage}
        showingLabel={buildMasterListShowingLabel({
          page: currentPage,
          pageSize: rowsPerPage,
          totalCount: filteredCompanies.length,
        })}
        singularLabel="companies"
        totalCount={filteredCompanies.length}
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

export function CompanyShowPage({ companyId }: { readonly companyId: number }) {
  const router = useRouter();
  const { show: showGlobalLoader } = useGlobalLoader();
  const [company, setCompany] = useState<CompanyRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const hideGlobalLoader = showGlobalLoader();
    setIsLoading(true);
    setCompany(null);
    getCompany(companyId, { signal: controller.signal })
      .then((record) => setCompany(record))
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error(error);
          setCompany(null);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
          hideGlobalLoader();
        }
      });
    return () => {
      controller.abort();
      hideGlobalLoader();
    };
  }, [companyId, showGlobalLoader]);

  if (!company) {
    if (isLoading) {
      return (
        <MasterListPageFrame
          description=""
          technicalName="page.company.show.loading"
          title="Company"
        >
          {null}
        </MasterListPageFrame>
      );
    }
    return (
      <MasterListPageFrame
        description="The requested company record was not found."
        technicalName="page.company.show.missing"
        title="Company not found"
      >
        <MasterListShowCard title="Details">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/desk/company">Back to companies</Link>
          </Button>
        </MasterListShowCard>
      </MasterListPageFrame>
    );
  }

  const currentCompany = company;

  async function handleSoftDelete() {
    const hideGlobalLoader = showGlobalLoader();
    try {
      await softDeleteCompany(currentCompany.id);
      toast.success("Company deleted", { description: `${currentCompany.name} was soft deleted.` });
      router.push("/desk/company");
    } catch (error) {
      hideGlobalLoader();
      toast.error("Could not delete company", { description: getErrorMessage(error) });
    }
  }

  return (
    <MasterListPageFrame
      action={
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/desk/company">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
          <Button asChild className="rounded-xl">
            <Link href={`/desk/company/${currentCompany.id}/edit?returnTo=show`}>
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
      description={`${currentCompany.tenantName} / ${currentCompany.industryName}`}
      technicalName="page.company.show"
      title={currentCompany.name}
    >
      <MasterListShowLayout
        cards={[
          <MasterListShowCard key="detail" title="Details" className="lg:col-span-2">
            <CompanyDetailsTable company={currentCompany} />
          </MasterListShowCard>,
          <MasterListShowCard key="logos" title="Logos">
            <SimpleRows rows={currentCompany.logos.map((logo) => [logo.logoType, logo.logoUrl])} />
          </MasterListShowCard>,
          <MasterListShowCard key="addresses" title="Addresses">
            <SimpleRows
              rows={currentCompany.addresses.map((address) => [
                address.addressType,
                [address.addressLine1, address.city, address.state, address.pincode]
                  .filter(Boolean)
                  .join(", "),
              ])}
            />
          </MasterListShowCard>,
          <MasterListShowCard key="emails" title="Emails">
            <SimpleRows
              rows={currentCompany.emails.map((email) => [email.emailType, email.email])}
            />
          </MasterListShowCard>,
          <MasterListShowCard key="phones" title="Phones">
            <SimpleRows
              rows={currentCompany.phones.map((phone) => [phone.phoneType, phone.phoneNumber])}
            />
          </MasterListShowCard>,
          <MasterListShowCard key="banks" title="Bank accounts">
            <SimpleRows
              rows={currentCompany.bankAccounts.map((bank) => [
                bank.bankName,
                `${bank.accountHolderName} / ${bank.ifsc}`,
              ])}
            />
          </MasterListShowCard>,
        ]}
      />
    </MasterListPageFrame>
  );
}

export function CompanyUpsertPage({
  companyId,
  returnTo = "show",
}: {
  readonly companyId?: number;
  readonly returnTo?: "list" | "show";
}) {
  const router = useRouter();
  const { show: showGlobalLoader } = useGlobalLoader();
  const isEdit = Boolean(companyId);
  const [existingCompany, setExistingCompany] = useState<CompanyRecord | null>(null);
  const [tenants, setTenants] = useState<readonly TenantRecord[]>([]);
  const [industries, setIndustries] = useState<readonly IndustryRecord[]>([]);
  const [isLoaded, setIsLoaded] = useState(!isEdit);
  const [message, setMessage] = useState<string | null>(null);
  const form = useForm({
    defaultValues: defaultCompanyFormValues(existingCompany),
    onSubmit: async ({ value }) => {
      const parsedValue = companySchema.safeParse(value);
      if (!parsedValue.success) {
        setMessage("Resolve validation errors before saving.");
        return;
      }
      const hideGlobalLoader = showGlobalLoader();
      try {
        const company = await upsertCompany(parsedValue.data as CompanyUpsertInput, companyId);
        toast.success(isEdit ? "Company updated" : "Company created", {
          description: `${company.name} was saved.`,
        });
        router.push(
          isEdit && returnTo === "list" ? "/desk/company" : `/desk/company/${company.id}`,
        );
      } catch (error) {
        hideGlobalLoader();
        const errorMessage = getErrorMessage(error);
        setMessage(errorMessage);
        toast.error(isEdit ? "Could not update company" : "Could not create company", {
          description: errorMessage,
        });
      }
    },
  });

  useEffect(() => {
    const controller = new AbortController();
    const hideGlobalLoader = showGlobalLoader();
    const loaders = [
      listTenants({ signal: controller.signal }),
      listIndustries({ signal: controller.signal }),
    ] as const;
    const companyLoader = companyId
      ? getCompany(companyId, { signal: controller.signal })
      : Promise.resolve(null);
    setIsLoaded(false);
    Promise.all([...loaders, companyLoader])
      .then(([tenantRecords, industryRecords, companyRecord]) => {
        setTenants(tenantRecords);
        setIndustries(industryRecords);
        setExistingCompany(companyRecord);
        const values = defaultCompanyFormValues(
          companyRecord,
          tenantRecords[0]?.id,
          industryRecords[0]?.id,
        );
        Object.entries(values).forEach(([key, nextValue]) =>
          form.setFieldValue(key as keyof typeof values, nextValue),
        );
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) console.error(error);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoaded(true);
          hideGlobalLoader();
        }
      });
    return () => {
      controller.abort();
      hideGlobalLoader();
    };
  }, [companyId, form, showGlobalLoader]);

  if (!isLoaded) {
    return (
      <MasterListPageFrame
        description=""
        technicalName="page.company.upsert.loading"
        title="Company"
      >
        {null}
      </MasterListPageFrame>
    );
  }

  if (isEdit && !existingCompany) {
    return (
      <MasterListPageFrame
        description="The requested company record was not found."
        technicalName="page.company.upsert.missing"
        title="Company not found"
      >
        <MasterListUpsertCard title="Company setup">
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/desk/company">Back to companies</Link>
          </Button>
        </MasterListUpsertCard>
      </MasterListPageFrame>
    );
  }

  return (
    <MasterListPageFrame
      action={
        <Button asChild variant="outline" className="rounded-xl">
          <Link href={getCancelPath(companyId, isEdit, returnTo)}>
            <X className="size-4" />
            Cancel
          </Link>
        </Button>
      }
      description={
        isEdit
          ? "Update company identity, tenant, industry, and active status."
          : "Create a tenant and industry specific company record."
      }
      technicalName="page.company.upsert"
      title={isEdit ? "Edit company" : "New company"}
    >
      <MasterListUpsertLayout>
        <MasterListUpsertCard>
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <AnimatedTabs
              tabs={[
                {
                  value: "identity",
                  label: "Identity",
                  content: (
                    <div className="space-y-4 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm md:p-5">
                      <div className="grid gap-4 md:grid-cols-3">
                        <form.Field name="name">
                          {(field) => (
                            <FieldShell label="Company name" error={field.state.meta.errors[0]}>
                              <Input
                                className="h-11 rounded-xl"
                                value={field.state.value}
                                onChange={(event) => field.handleChange(event.target.value)}
                              />
                            </FieldShell>
                          )}
                        </form.Field>
                        <form.Field name="tenantId">
                          {(field) => (
                            <FieldShell label="Tenant" error={field.state.meta.errors[0]}>
                              <select
                                className="h-11 cursor-pointer rounded-xl border border-input bg-background px-3"
                                value={field.state.value}
                                onChange={(event) => field.handleChange(Number(event.target.value))}
                              >
                                {tenants.map((tenant) => (
                                  <option key={tenant.id} value={tenant.id}>
                                    {tenant.name}
                                  </option>
                                ))}
                              </select>
                            </FieldShell>
                          )}
                        </form.Field>
                        <form.Field name="industryId">
                          {(field) => (
                            <FieldShell label="Industry" error={field.state.meta.errors[0]}>
                              <select
                                className="h-11 cursor-pointer rounded-xl border border-input bg-background px-3"
                                value={field.state.value}
                                onChange={(event) => field.handleChange(Number(event.target.value))}
                              >
                                {industries.map((industry) => (
                                  <option key={industry.id} value={industry.id}>
                                    {industry.name}
                                  </option>
                                ))}
                              </select>
                            </FieldShell>
                          )}
                        </form.Field>
                      </div>
                      <div className="grid gap-4 md:grid-cols-2">
                        <TextField form={form} name="legalName" label="Legal name" />
                        <TextField form={form} name="tagline" label="Tagline" />
                      </div>
                      <div className="grid gap-3 md:grid-cols-2">
                        <SwitchField
                          form={form}
                          name="isPrimary"
                          label="Primary"
                          description="Primary company is used for shared suite context."
                        />
                        <SwitchField
                          form={form}
                          name="isActive"
                          label="Active"
                          description="Active companies can be selected in workflows."
                        />
                      </div>
                    </div>
                  ),
                },
                {
                  value: "registration",
                  label: "Registration",
                  content: (
                    <div className="grid gap-4 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm md:grid-cols-3 md:p-5">
                      <TextField form={form} name="primaryEmail" label="Primary email" />
                      <TextField form={form} name="primaryPhone" label="Primary phone" />
                      <TextField form={form} name="website" label="Website" />
                      <TextField
                        form={form}
                        name="registrationNumber"
                        label="Registration number"
                      />
                      <TextField form={form} name="pan" label="PAN" />
                      <TextField
                        form={form}
                        name="financialYearStart"
                        label="Financial year start"
                        type="date"
                      />
                      <TextField form={form} name="booksStart" label="Books start" type="date" />
                    </div>
                  ),
                },
                {
                  value: "notes",
                  label: "Notes",
                  content: (
                    <div className="space-y-4 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm md:p-5">
                      <TextField form={form} name="shortAbout" label="Short about" />
                      <TextField form={form} name="description" label="Description" />
                    </div>
                  ),
                },
              ]}
            />
            {message ? (
              <p className="text-sm font-medium text-muted-foreground">{message}</p>
            ) : null}
            <Separator />
            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit" className="rounded-xl">
                <Save className="size-4" />
                {isEdit ? "Update company" : "Create company"}
              </Button>
              <Button asChild type="button" variant="outline" className="rounded-xl">
                <Link href={getCancelPath(companyId, isEdit, returnTo)}>
                  <X className="size-4" />
                  Cancel
                </Link>
              </Button>
            </div>
          </form>
        </MasterListUpsertCard>
      </MasterListUpsertLayout>
    </MasterListPageFrame>
  );
}

function ListHeader({ children }: { readonly children: ReactNode }) {
  return (
    <th className="border-b border-border/70 px-4 py-2.5 text-left font-medium text-foreground">
      {children}
    </th>
  );
}

function StatusBadge({ isActive }: { readonly isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? "rounded-full border-emerald-200 bg-emerald-50 text-emerald-700"
          : "rounded-full border-border/80 text-muted-foreground"
      }
    >
      {isActive ? "active" : "inactive"}
    </Badge>
  );
}

function CompanyDetailsTable({ company }: { readonly company: CompanyRecord }) {
  const rows: Array<[string, ReactNode]> = [
    ["ID", company.id],
    ["Tenant", company.tenantName],
    ["Industry", company.industryName],
    ["Name", company.name],
    ["Legal name", company.legalName ?? "-"],
    ["Primary email", company.primaryEmail ?? "-"],
    ["Primary phone", company.primaryPhone ?? "-"],
    ["Website", company.website ?? "-"],
    ["Active", <StatusBadge key="active" isActive={company.isActive} />],
    ["Created at", formatCompanyDate(company.createdAt)],
    ["Updated at", formatCompanyDate(company.updatedAt)],
    ["Deleted at", formatCompanyDate(company.deletedAt)],
  ];
  return <SimpleRows rows={rows} />;
}

function SimpleRows({ rows }: { readonly rows: readonly (readonly [ReactNode, ReactNode])[] }) {
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">No records.</p>;
  return (
    <div className="overflow-hidden rounded-md border border-border/70">
      <table className="w-full border-collapse text-sm">
        <tbody>
          {rows.map(([label, value], index) => (
            <tr key={index} className="border-b border-border/60 last:border-b-0">
              <th className="w-52 bg-muted/35 px-4 py-3 text-left font-medium text-muted-foreground">
                {label}
              </th>
              <td className="px-4 py-3 text-foreground">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
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

function TextField({
  form,
  label,
  name,
  type = "text",
}: {
  readonly form: any;
  readonly label: string;
  readonly name: keyof CompanyUpsertInput;
  readonly type?: string;
}) {
  return (
    <form.Field name={name}>
      {(field: any) => (
        <FieldShell label={label} error={field.state.meta.errors[0]}>
          <Input
            type={type}
            className="h-11 rounded-xl"
            value={field.state.value ?? ""}
            onChange={(event) => field.handleChange(event.target.value || null)}
          />
        </FieldShell>
      )}
    </form.Field>
  );
}

function SwitchField({
  description,
  form,
  label,
  name,
}: {
  readonly description: string;
  readonly form: any;
  readonly label: string;
  readonly name: "isPrimary" | "isActive";
}) {
  return (
    <form.Field name={name}>
      {(field: any) => (
        <label
          className={
            field.state.value
              ? "flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-950"
              : "flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-border/70 bg-muted/10 px-4 py-3"
          }
        >
          <span>
            <span className="block text-sm font-medium">{label}</span>
            <span className="block text-xs text-muted-foreground">{description}</span>
          </span>
          <Switch
            checked={field.state.value}
            aria-label={label}
            onCheckedChange={(checked) => field.handleChange(checked)}
          />
        </label>
      )}
    </form.Field>
  );
}

function defaultCompanyFormValues(
  company: CompanyRecord | null,
  tenantId = 1,
  industryId = 1,
): CompanyUpsertInput {
  return {
    tenantId: company?.tenantId ?? tenantId,
    industryId: company?.industryId ?? industryId,
    name: company?.name ?? "",
    legalName: company?.legalName ?? null,
    tagline: company?.tagline ?? null,
    shortAbout: company?.shortAbout ?? null,
    registrationNumber: company?.registrationNumber ?? null,
    pan: company?.pan ?? null,
    financialYearStart: company?.financialYearStart ?? null,
    booksStart: company?.booksStart ?? null,
    website: company?.website ?? null,
    description: company?.description ?? null,
    primaryEmail: company?.primaryEmail ?? null,
    primaryPhone: company?.primaryPhone ?? null,
    isPrimary: company?.isPrimary ?? false,
    isActive: company?.isActive ?? true,
  };
}

function getCancelPath(companyId: number | undefined, isEdit: boolean, returnTo: "list" | "show") {
  if (!isEdit || !companyId || returnTo === "list") return "/desk/company";
  return `/desk/company/${companyId}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}
