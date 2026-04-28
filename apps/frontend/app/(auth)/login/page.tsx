import { AuthCard } from "../../../components/auth/auth-card";
import { AuthForm } from "../../../components/auth/auth-form";

export default function LoginPage() {
  return (
    <AuthCard title="Login" description="Enter the platform workspace.">
      <AuthForm mode="login" />
    </AuthCard>
  );
}
