import type { ContactUpsertInput } from "../domain/contact";
export { getContact, upsertContact } from "../infrastructure/contact-api";

export function normalizeOptionalText(value: string | null | undefined) {
  const trimmedValue = value?.trim() ?? "";
  return trimmedValue.length > 0 ? trimmedValue : null;
}

export function prepareContactForSave(input: ContactUpsertInput): ContactUpsertInput {
  return {
    ...input,
    code: input.code.trim().toUpperCase(),
    name: input.name.trim(),
    legalName: normalizeOptionalText(input.legalName),
    pan: normalizeOptionalText(input.pan)?.toUpperCase() ?? null,
    gstin: normalizeOptionalText(input.gstin)?.toUpperCase() ?? null,
    msmeType: normalizeOptionalText(input.msmeType),
    msmeNo: normalizeOptionalText(input.msmeNo),
    balanceType: normalizeOptionalText(input.balanceType),
    website: normalizeOptionalText(input.website),
    description: normalizeOptionalText(input.description),
  };
}
