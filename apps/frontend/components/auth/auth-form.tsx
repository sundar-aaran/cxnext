"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { Button, Input, Label } from "@cxnext/ui";
import { useMemo, useState } from "react";
import { getDefaultApplicationContext } from "../../features/application-context/infrastructure/application-context-api";
import { login } from "../../features/auth/infrastructure/auth-api";
import { persistStoredAuthSession } from "../../features/auth/infrastructure/session-storage";

interface AuthFormProps {
  readonly mode: "login" | "register" | "reset";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [values, setValues] = useState({
    login: "",
    name: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isRegister = mode === "register";
  const isReset = mode === "reset";
  const passwordSchema = isReset
    ? z.string().optional()
    : z.string().min(8, "Use at least 8 characters");
  const formSchema = useMemo(
    () =>
      z.object({
        login: z.string().min(2, "Enter username or email"),
        name: isRegister ? z.string().min(2, "Enter your name") : z.string().optional(),
        password: passwordSchema,
      }),
    [isRegister, passwordSchema],
  );

  function updateField(key: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [key]: value }));
    setFieldErrors((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setSubmitError(null);
  }

  async function handleSubmit() {
    if (isSubmitting) return;

    setSubmitError(null);
    const result = formSchema.safeParse(values);

    if (!result.success) {
      setFieldErrors(
        Object.fromEntries(
          result.error.issues.map((issue) => [String(issue.path[0] ?? "form"), issue.message]),
        ),
      );
      return;
    }

    if (mode !== "login") return;

    setIsSubmitting(true);
    try {
      const session = await login({
        login: result.data.login,
        password: result.data.password ?? "",
      });
      persistStoredAuthSession(session);
      try {
        const context = await getDefaultApplicationContext();
        persistStoredAuthSession({ ...session, context });
      } catch {
        persistStoredAuthSession(session);
      }
      router.push(searchParams.get("next") ?? "/desk");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Could not sign in.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void handleSubmit();
      }}
    >
      {isRegister ? (
        <AuthField
          autoComplete="name"
          error={fieldErrors.name}
          label="Name"
          name="name"
          placeholder="Your name"
          value={values.name}
          onChange={(value) => updateField("name", value)}
        />
      ) : null}
      <AuthField
        autoComplete="username"
        error={fieldErrors.login}
        label="Username or email"
        name="login"
        placeholder="admin or you@company.com"
        value={values.login}
        onChange={(value) => updateField("login", value)}
      />
      {!isReset ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="password" className="text-sm font-medium text-foreground">
              Password
            </Label>
            {mode === "login" ? (
              <Link
                href="/password-reset"
                className="text-sm font-medium text-foreground underline underline-offset-4"
              >
                Forgot password?
              </Link>
            ) : null}
          </div>
          <AuthFieldInput
            autoComplete={isRegister ? "new-password" : "current-password"}
            name="password"
            placeholder="Enter password"
            type="password"
            value={values.password}
            onChange={(value) => updateField("password", value)}
          />
          {fieldErrors.password ? (
            <p className="text-xs text-destructive">{fieldErrors.password}</p>
          ) : null}
        </div>
      ) : null}
      {submitError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {submitError}
        </div>
      ) : null}
      <Button
        type="submit"
        size="lg"
        className="mt-2 h-11 w-full gap-2 rounded-xl"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Checking..." : isReset ? "Send reset link" : isRegister ? "Create account" : "Login"}
        <ArrowRight className="size-4" />
      </Button>
      <div className="flex flex-wrap justify-between gap-3 text-sm text-muted-foreground">
        <Link href="/login" className="hover:text-foreground">
          Login
        </Link>
        <Link href="/register" className="hover:text-foreground">
          Register
        </Link>
        <Link href="/password-reset" className="hover:text-foreground">
          Reset password
        </Link>
      </div>
    </form>
  );
}

function AuthField({
  autoComplete,
  error,
  label,
  name,
  onChange,
  placeholder,
  value,
}: {
  readonly autoComplete: string;
  readonly error?: string;
  readonly label: string;
  readonly name: "login" | "name";
  readonly onChange: (value: string) => void;
  readonly placeholder: string;
  readonly value: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      <AuthFieldInput
        autoComplete={autoComplete}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

function AuthFieldInput({
  autoComplete,
  name,
  onChange,
  placeholder,
  type = "text",
  value,
}: {
  readonly autoComplete: string;
  readonly name: string;
  readonly onChange: (value: string) => void;
  readonly placeholder: string;
  readonly type?: string;
  readonly value: string;
}) {
  return (
    <Input
      id={name}
      name={name}
      type={type}
      value={value}
      placeholder={placeholder}
      autoComplete={autoComplete}
      className="h-11 rounded-xl border-border/80 bg-background/95 shadow-none"
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
