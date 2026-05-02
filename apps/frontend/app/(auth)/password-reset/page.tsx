import { Suspense } from "react";
import { AuthCard } from "../../../components/auth/auth-card";
import { AuthForm } from "../../../components/auth/auth-form";

export default function PasswordResetPage() {
  return (
    <AuthCard
      title="Reset password"
      description="Request a password reset when auth is implemented."
    >
      <Suspense fallback={null}>
        <AuthForm mode="reset" />
      </Suspense>
    </AuthCard>
  );
}
