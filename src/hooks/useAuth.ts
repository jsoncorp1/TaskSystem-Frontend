import { useState } from "react";
import { login, LoginPayload } from "@/services/auth.service";
import { useRouter } from "next/navigation";

export function useAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (data: LoginPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await login(data);
      localStorage.setItem("token", res.token);
      router.push("/"); // redirige al dashboard
    } catch (e: any) {
      setError("Credenciales inválidas");
    } finally {
      setLoading(false);
    }
  };

  return { handleLogin, loading, error };
}