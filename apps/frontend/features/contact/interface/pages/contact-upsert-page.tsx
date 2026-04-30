"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { Save, X } from "lucide-react";
import {
  AnimatedTabs,
  Button,
  Input,
  MasterListPageFrame,
  MasterListUpsertCard,
  MasterListUpsertLayout,
  Separator,
  useGlobalLoader,
} from "@cxnext/ui";
import { getContact, upsertContact } from "../../application/contact-upsert.service";
import { prepareContactForSave } from "../../application/contact-upsert.service";
import type { ContactUpsertInput } from "../../domain/contact";
import { createDefaultContactFormValues, toContactFormValues } from "../../domain/contact-form";
import {
  AddRowButton,
  ContactField,
  ContactSection,
  ContactStatusSwitch,
  ContactTextInput,
  RemoveRowButton,
} from "../components/contact-form-sections";

type ContactEditReturnTo = "list" | "show";

export function ContactUpsertPage({
  contactId,
  returnTo = "show",
}: {
  readonly contactId?: number;
  readonly returnTo?: ContactEditReturnTo;
}) {
  const router = useRouter();
  const { show: showGlobalLoader } = useGlobalLoader();
  const isEdit = Boolean(contactId);
  const [form, setForm] = useState<ContactUpsertInput>(createDefaultContactFormValues());
  const [isLoaded, setIsLoaded] = useState(!isEdit);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!contactId) {
      setForm(createDefaultContactFormValues());
      setIsLoaded(true);
      return;
    }

    const controller = new AbortController();
    const hideGlobalLoader = showGlobalLoader();

    setIsLoaded(false);
    getContact(contactId, { signal: controller.signal })
      .then((record) => {
        if (record) {
          setForm(toContactFormValues(record));
        }
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          console.error(error);
        }
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
  }, [contactId, showGlobalLoader]);

  async function saveContact() {
    if (form.name.trim().length < 2) {
      setMessage("Enter contact name.");
      return;
    }

    const hideGlobalLoader = showGlobalLoader();

    try {
      const contact = await upsertContact(prepareContactForSave(form), contactId);
      toast.success(isEdit ? "Contact updated" : "Contact created", {
        description: `${contact.name} was saved.`,
      });
      router.push(isEdit && returnTo === "list" ? "/desk/contact" : `/desk/contact/${contact.id}`);
    } catch (error) {
      hideGlobalLoader();
      const errorMessage = getErrorMessage(error);
      setMessage(errorMessage);
      toast.error("Could not save contact", { description: errorMessage });
    }
  }

  if (isEdit && !isLoaded) {
    return (
      <MasterListPageFrame
        description="Loading contact record."
        technicalName="page.contact.upsert.loading"
        title="Contact"
      >
        <ContactSection title="Contact setup">
          <p className="text-sm text-muted-foreground">Loading contact.</p>
        </ContactSection>
      </MasterListPageFrame>
    );
  }

  return (
    <MasterListPageFrame
      action={
        <Button asChild variant="outline" className="rounded-xl">
          <Link
            href={contactId && returnTo === "show" ? `/desk/contact/${contactId}` : "/desk/contact"}
          >
            <X className="size-4" />
            Cancel
          </Link>
        </Button>
      }
      description={
        isEdit
          ? "Update contact identity, tax, communication, and finance details."
          : "Create a structured contact record."
      }
      technicalName="page.contact.upsert"
      title={isEdit ? "Edit contact" : "New contact"}
    >
      <MasterListUpsertLayout>
        <MasterListUpsertCard>
          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              void saveContact();
            }}
          >
            <AnimatedTabs
              tabs={[
                {
                  value: "details",
                  label: "Details",
                  content: (
                    <ContactTabPanel>
                      <div className="grid gap-4 md:grid-cols-2">
                        <ContactField label="Name">
                          <ContactTextInput
                            value={form.name}
                            onChange={(event) => setForm({ ...form, name: event.target.value })}
                          />
                        </ContactField>
                        <ContactField label="Code">
                          <ContactTextInput
                            value={form.code}
                            placeholder="Auto generated"
                            onChange={(event) =>
                              setForm({ ...form, code: event.target.value.toUpperCase() })
                            }
                          />
                        </ContactField>
                        <ContactField label="Legal name">
                          <ContactTextInput
                            value={form.legalName ?? ""}
                            onChange={(event) =>
                              setForm({ ...form, legalName: event.target.value })
                            }
                          />
                        </ContactField>
                        <ContactField label="Ledger name">
                          <ContactTextInput
                            value={form.ledgerName ?? ""}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                ledgerName: event.target.value,
                                ledgerId: event.target.value ? "ledger:manual" : null,
                              })
                            }
                          />
                        </ContactField>
                        <ContactField label="GSTIN">
                          <ContactTextInput
                            value={form.gstin ?? ""}
                            onChange={(event) =>
                              setForm({ ...form, gstin: event.target.value.toUpperCase() })
                            }
                          />
                        </ContactField>
                        <ContactField label="PAN">
                          <ContactTextInput
                            value={form.pan ?? ""}
                            onChange={(event) =>
                              setForm({ ...form, pan: event.target.value.toUpperCase() })
                            }
                          />
                        </ContactField>
                        <ContactField label="Opening balance">
                          <Input
                            type="number"
                            className="h-11 rounded-xl"
                            value={form.openingBalance}
                            onChange={(event) =>
                              setForm({ ...form, openingBalance: Number(event.target.value || 0) })
                            }
                          />
                        </ContactField>
                        <ContactField label="Credit limit">
                          <Input
                            type="number"
                            className="h-11 rounded-xl"
                            value={form.creditLimit}
                            onChange={(event) =>
                              setForm({ ...form, creditLimit: Number(event.target.value || 0) })
                            }
                          />
                        </ContactField>
                        <div className="md:col-span-2">
                          <ContactStatusSwitch
                            checked={form.isActive}
                            onCheckedChange={(checked) => setForm({ ...form, isActive: checked })}
                          />
                        </div>
                        <ContactField label="Description">
                          <textarea
                            value={form.description ?? ""}
                            className="min-h-28 rounded-xl border border-input bg-background px-3 py-2 text-sm"
                            onChange={(event) =>
                              setForm({ ...form, description: event.target.value })
                            }
                          />
                        </ContactField>
                      </div>
                    </ContactTabPanel>
                  ),
                },
                {
                  value: "communication",
                  label: "Communication",
                  content: (
                    <ContactTabPanel>
                      <div className="grid gap-4 md:grid-cols-2">
                        <ContactField label="Primary email">
                          <ContactTextInput
                            type="email"
                            value={form.emails[0]?.email ?? ""}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                emails: [
                                  {
                                    email: event.target.value,
                                    emailType: "primary",
                                    isPrimary: true,
                                  },
                                ],
                              })
                            }
                          />
                        </ContactField>
                        <ContactField label="Primary phone">
                          <ContactTextInput
                            value={form.phones[0]?.phoneNumber ?? ""}
                            onChange={(event) =>
                              setForm({
                                ...form,
                                phones: [
                                  {
                                    phoneNumber: event.target.value,
                                    phoneType: "mobile",
                                    isPrimary: true,
                                  },
                                ],
                              })
                            }
                          />
                        </ContactField>
                      </div>
                    </ContactTabPanel>
                  ),
                },
                {
                  value: "addresses",
                  label: "Addresses",
                  content: (
                    <ContactTabPanel>
                      <div className="mb-4 flex justify-end">
                        <AddRowButton
                          onClick={() =>
                            setForm({
                              ...form,
                              addresses: [
                                ...form.addresses,
                                createDefaultContactFormValues().addresses[0]!,
                              ],
                            })
                          }
                        />
                      </div>
                      <div className="space-y-4">
                        {form.addresses.map((address, index) => (
                          <div key={index} className="rounded-md border border-border/70 p-4">
                            <div className="mb-3 flex justify-end">
                              <RemoveRowButton
                                onClick={() =>
                                  setForm({
                                    ...form,
                                    addresses: form.addresses.filter(
                                      (_, itemIndex) => itemIndex !== index,
                                    ),
                                  })
                                }
                              />
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                              <ContactField label="Address line 1">
                                <ContactTextInput
                                  value={address.addressLine1}
                                  onChange={(event) =>
                                    setForm({
                                      ...form,
                                      addresses: updateAddress(form, index, {
                                        addressLine1: event.target.value,
                                      }),
                                    })
                                  }
                                />
                              </ContactField>
                              <ContactField label="Address line 2">
                                <ContactTextInput
                                  value={address.addressLine2 ?? ""}
                                  onChange={(event) =>
                                    setForm({
                                      ...form,
                                      addresses: updateAddress(form, index, {
                                        addressLine2: event.target.value,
                                      }),
                                    })
                                  }
                                />
                              </ContactField>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ContactTabPanel>
                  ),
                },
              ]}
            />
            {message ? (
              <p className="text-sm font-medium text-muted-foreground">{message}</p>
            ) : null}
            <Separator />
            <Button type="submit" className="rounded-xl">
              <Save className="size-4" />
              {isEdit ? "Update contact" : "Create contact"}
            </Button>
          </form>
        </MasterListUpsertCard>
      </MasterListUpsertLayout>
    </MasterListPageFrame>
  );
}

function ContactTabPanel({ children }: { readonly children: ReactNode }) {
  return (
    <div className="space-y-4 rounded-2xl border border-border/70 bg-card/80 p-4 shadow-sm md:p-5">
      {children}
    </div>
  );
}

function updateAddress(
  form: ContactUpsertInput,
  index: number,
  patch: Partial<ContactUpsertInput["addresses"][number]>,
) {
  return form.addresses.map((address, itemIndex) =>
    itemIndex === index ? { ...address, ...patch } : address,
  );
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Please try again.";
}
