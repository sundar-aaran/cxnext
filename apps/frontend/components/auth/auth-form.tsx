"use client";

import Link from "next/link";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import { Button, Input, Label } from "@cxnext/ui";

interface AuthFormProps {
  readonly mode: "login" | "register" | "reset";
}

export function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === "register";
  const isReset = mode === "reset";
  const passwordSchema = isReset ? z.string().optional() : z.string().min(8, "Use at least 8 characters");
  const formSchema = z.object({
    email: z.string().email("Enter a valid email"),
    name: isRegister ? z.string().min(2, "Enter your name") : z.string().optional(),
    password: passwordSchema,
  });
  const form = useForm({
    defaultValues: {
      email: "",
      name: "",
      password: "",
    },
    onSubmit: ({ value }) => {
      formSchema.safeParse(value);
    },
  });

  return (
    <form
      className="grid gap-4"
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
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Name</Label>
              <Input
                id={field.name}
                name={field.name}
                value={field.state.value}
                placeholder="Your name"
                autoComplete="name"
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
        name="email"
        validators={{
          onChange: ({ value }) => {
            const result = z.string().email("Enter a valid email").safeParse(value);
            return result.success ? undefined : result.error.issues[0]?.message;
          },
        }}
      >
        {(field) => (
          <div className="grid gap-2">
            <Label htmlFor={field.name}>Email</Label>
            <Input
              id={field.name}
              name={field.name}
              type="email"
              value={field.state.value}
              placeholder="you@company.com"
              autoComplete="email"
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
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Password</Label>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                value={field.state.value}
                placeholder="Enter password"
                autoComplete={isRegister ? "new-password" : "current-password"}
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
      <Button type="button" className="w-full">
        {isReset ? "Send reset link" : isRegister ? "Create account" : "Sign in"}
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
