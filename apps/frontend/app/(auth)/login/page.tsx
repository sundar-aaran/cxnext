import { Suspense } from "react";
import { AuthCard } from "../../../components/auth/auth-card";
import { AuthForm } from "../../../components/auth/auth-form";

export default function LoginPage() {
  return (
    <AuthCard
      title="Welcome"
      description="Use one sign in for tenant access, workspace routing, and administrator controls."
    >
      <Suspense fallback={null}>
        <AuthForm mode="login" />
      </Suspense>
    </AuthCard>
  );
}
