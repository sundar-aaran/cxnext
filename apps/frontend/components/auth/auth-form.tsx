import Link from "next/link";
import { Button, Input, Label } from "@cxnext/ui";

interface AuthFormProps {
  readonly mode: "login" | "register" | "reset";
}

export function AuthForm({ mode }: AuthFormProps) {
  const isRegister = mode === "register";
  const isReset = mode === "reset";

  return (
    <form className="grid gap-4">
      {isRegister ? (
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" placeholder="Your name" autoComplete="name" />
        </div>
      ) : null}
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" placeholder="you@company.com" autoComplete="email" />
      </div>
      {!isReset ? (
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="Enter password"
            autoComplete={isRegister ? "new-password" : "current-password"}
          />
        </div>
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
