"use client";

import { useMemo, useState } from "react";
import { MoreHorizontal, Plus } from "lucide-react";
import {
  Badge,
  Button,
  MasterListPageFrame,
  MasterListPaginationCard,
  MasterListTableCard,
  MasterListToolbarCard,
  buildMasterListShowingLabel,
} from "@cxnext/ui";

const companies = [
  {
    id: "codexsun-commerce",
    name: "Codexsun Commerce",
    code: "codexsun-commerce",
    status: "active",
    updatedAt: "29 Apr 2026, 11:10 am",
  },
  {
    id: "acme-enterprise",
    name: "Acme Enterprise",
    code: "acme-enterprise",
    status: "active",
    updatedAt: "29 Apr 2026, 10:50 am",
  },
  {
    id: "northwind-trial",
    name: "Northwind Trial",
    code: "northwind-trial",
    status: "inactive",
    updatedAt: "28 Apr 2026, 6:15 pm",
  },
] as const;

export function CompanyListPage() {
  const [searchValue, setSearchValue] = useState("");
  const rowsPerPage = 20;
  const currentPage = 1;

  const filteredCompanies = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) {
      return companies;
    }

    return companies.filter((company) =>
      [company.name, company.code, company.status].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [searchValue]);

  return (
    <MasterListPageFrame
      action={
        <Button className="rounded-xl bg-foreground px-4 text-background hover:bg-foreground/90">
          <Plus className="size-4" />
          New Company
        </Button>
      }
      description="Create and review organisation company records."
      technicalName="page.organisation.companies"
      title="Companies"
    >
      <MasterListToolbarCard
        onSearchValueChange={setSearchValue}
        searchPlaceholder="Search company, code, status, or id"
        searchValue={searchValue}
      />

      <MasterListTableCard className="rounded-md">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead className="bg-muted/55">
              <tr>
                <th className="w-16 border-b border-border/70 px-4 py-2.5 text-left font-medium text-foreground">
                  #
                </th>
                <th className="border-b border-border/70 px-4 py-2.5 text-left font-medium text-foreground">
                  Company
                </th>
                <th className="border-b border-border/70 px-4 py-2.5 text-left font-medium text-foreground">
                  Code
                </th>
                <th className="border-b border-border/70 px-4 py-2.5 text-left font-medium text-foreground">
                  Status
                </th>
                <th className="border-b border-border/70 px-4 py-2.5 text-left font-medium text-foreground">
                  Updated
                </th>
                <th className="w-24 border-b border-border/70 px-4 py-2.5 text-right font-medium text-foreground">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map((company, index) => (
                <tr
                  key={company.id}
                  className="border-b border-border/60 last:border-b-0 hover:bg-muted/20"
                >
                  <td className="px-4 py-2.5 text-muted-foreground">{index + 1}</td>
                  <td className="px-4 py-2.5 font-medium text-foreground">{company.name}</td>
                  <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">
                    {company.code}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge
                      variant="outline"
                      className={
                        company.status === "active"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-border/80 text-muted-foreground"
                      }
                    >
                      {company.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{company.updatedAt}</td>
                  <td className="px-4 py-2 text-right text-muted-foreground">
                    <Button
                      aria-label={`${company.name} actions`}
                      size="icon"
                      variant="ghost"
                      className="size-8 rounded-full border border-transparent hover:border-border/80 hover:bg-background"
                    >
                      <MoreHorizontal className="size-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
        totalPages={1}
      />
    </MasterListPageFrame>
  );
}
