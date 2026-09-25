"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginAction, registerAction, type AuthFormState } from "@/lib/auth/actions";

const initialState: AuthFormState = {};

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isLogin = mode === "login";
  const [state, action, pending] = useActionState(isLogin ? loginAction : registerAction, initialState);

  return (
    <form action={action} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input id="password" name="password" type="password" autoComplete={isLogin ? "current-password" : "new-password"} minLength={isLogin ? undefined : 8} required />
        {!isLogin && <p className="text-sm text-muted-foreground">Minimal 8 karakter.</p>}
      </div>
      {state.error && <p role="alert" className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">{state.error}</p>}
      {state.success && <p role="status" className="rounded-md bg-secondary px-4 py-3 text-sm text-secondary-foreground">{state.success}</p>}
      <Button className="w-full" type="submit" disabled={pending}>{pending ? "Memproses..." : isLogin ? "Masuk" : "Buat akun"}</Button>
      <p className="text-center text-sm text-muted-foreground">
        {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
        <Link className="font-semibold text-foreground underline underline-offset-4 hover:text-primary" href={isLogin ? "/register" : "/login"}>{isLogin ? "Daftar" : "Masuk"}</Link>
      </p>
    </form>
  );
}
