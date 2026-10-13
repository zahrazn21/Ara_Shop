import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import AuthForm from "@/components/auth/AuthForm";

export default async function Page() {
  if (await getCurrentUser()) redirect("/");
  return <AuthForm mode="register" />;
}