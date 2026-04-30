import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const repositoryRoot = fileURLToPath(new URL("../..", import.meta.url));
const deskShellPath = path.join(
  repositoryRoot,
  "apps/frontend/features/desk/interface/shell/desk-shell.tsx",
);

describe("desk master menu boundaries", () => {
  it("keeps master items under the Master group without changing Organisation children", async () => {
    const source = await readFile(deskShellPath, "utf8");

    expect(source).toContain("const masterNavItems");
    expect(source).toContain('id: "master"');
    expect(source).toContain('label: "Master"');
    expect(source).toContain('href: "/desk/contact"');
    expect(source).toContain('href: "/desk/product"');

    const organisationItemsSource = source.slice(
      source.indexOf("const organisationNavItems"),
      source.indexOf("const masterNavItems"),
    );

    expect(organisationItemsSource).toContain('id: "tenant"');
    expect(organisationItemsSource).toContain('id: "industry"');
    expect(organisationItemsSource).toContain('id: "company"');
    expect(organisationItemsSource).not.toContain('id: "contact"');
    expect(organisationItemsSource).not.toContain('id: "product"');
  });
});
