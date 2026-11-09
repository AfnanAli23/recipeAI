import AuthForm from '@/components/AuthForm';

// STATIC route "/login" -> the folder name IS the URL.
export default function LoginPage() {
  return <AuthForm mode="login" />;
}
