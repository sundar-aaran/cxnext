"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { ArrowRight } from "lucide-react";
import { Button, Input, Label } from "@cxnext/ui";
import { useState } from "react";
import { getDefaultApplicationContext } from "../../features/application-context/infrastructure/application-context-api";
import { login } from "../../features/auth/infrastructure/auth-api";
import { persistStoredAuthSession } from "../../features/auth/infrastructure/session-storage";

interface AuthFormProps {
  readonly mode: "login" | "register" | "reset";
}

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isRegister = mode === "register";
  const isReset = mode === "reset";
  const passwordSchema = isReset
    ? z.string().optional()
    : z.string().min(8, "Use at least 8 characters");
  const formSchema = z.object({
    login: z.string().min(2, "Enter username or email"),
    name: isRegister ? z.string().min(2, "Enter your name") : z.string().optional(),
    password: passwordSchema,
  });
  const form = useForm({
    defaultValues: {
      login: "",
      name: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setSubmitError(null);
      const result = formSchema.safeParse(value);
      if (!result.success) return;

      if (mode === "login") {
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
        }
      }
    },
  });

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        void form.handleSubmit();
      }}
    >
      {isRegister ? (
        <form.Field
          name="name"
          validators={{
            onChange: ({ value }) => {
              const result = z.string().min(2, "Enter your name").safeParse(value);
              return result.success ? undefined : result.error.issues[0]?.message;
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-sm font-medium text-foreground">
                Name
              </Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                placeholder="Your name"
                autoComplete="name"
                className="h-11 rounded-xl border-border/80 bg-background/95 shadow-none"
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {field.state.meta.errors[0] ? (
                <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
              ) : null}
            </div>
          )}
        </form.Field>
      ) : null}
      <form.Field
        name="login"
        validators={{
          onChange: ({ value }) => {
            const result = z.string().min(2, "Enter username or email").safeParse(value);
            return result.success ? undefined : result.error.issues[0]?.message;
          },
        }}
      >
        {(field) => (
          <div className="space-y-2">
            <Label htmlFor={field.name} className="text-sm font-medium text-foreground">
              Username or email
            </Label>
            <Input
              id={field.name}
              name={field.name}
              value={field.state.value}
              placeholder="admin or you@company.com"
              autoComplete="username"
              className="h-11 rounded-xl border-border/80 bg-background/95 shadow-none"
              onBlur={field.handleBlur}
              onChange={(event) => field.handleChange(event.target.value)}
            />
            {field.state.meta.errors[0] ? (
              <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
            ) : null}
          </div>
        )}
      </form.Field>
      {!isReset ? (
        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) => {
              const result = z.string().min(8, "Use at least 8 characters").safeParse(value);
              return result.success ? undefined : result.error.issues[0]?.message;
            },
          }}
        >
          {(field) => (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor={field.name} className="text-sm font-medium text-foreground">
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
              <Input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                placeholder="Enter password"
                autoComplete={isRegister ? "new-password" : "current-password"}
                className="h-11 rounded-xl border-border/80 bg-background/95 shadow-none"
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {field.state.meta.errors[0] ? (
                <p className="text-xs text-destructive">{String(field.state.meta.errors[0])}</p>
              ) : null}
            </div>
          )}
        </form.Field>
      ) : null}
      {submitError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {submitError}
        </div>
      ) : null}
      <Button type="submit" size="lg" className="mt-2 h-11 w-full gap-2 rounded-xl">
        {isReset ? "Send reset link" : isRegister ? "Create account" : "Login"}
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
