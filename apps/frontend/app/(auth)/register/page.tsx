import { AuthCard } from "../../../components/auth/auth-card";
import { AuthForm } from "../../../components/auth/auth-form";

export default function RegisterPage() {
  return (
    <AuthCard title="Register" description="Create an account shell for future auth wiring.">
      <AuthForm mode="register" />
    </AuthCard>
  );
}
