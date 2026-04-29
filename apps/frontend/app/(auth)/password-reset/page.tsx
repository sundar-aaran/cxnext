import { AuthCard } from "../../../components/auth/auth-card";
import { AuthForm } from "../../../components/auth/auth-form";

export default function PasswordResetPage() {
  return (
    <AuthCard
      title="Reset password"
      description="Request a password reset when auth is implemented."
    >
      <AuthForm mode="reset" />
    </AuthCard>
  );
}
