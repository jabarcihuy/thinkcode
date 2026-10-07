"use client";

import { useText } from "@/i18n/use-text";

import { useActionState } from "react";
import { startGuest } from "../server/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
export function GuestNameForm() {
  const tx = useText();

  const [state, action, pending] = useActionState(startGuest, {});
  return (
    <form action={action} className="mt-7 space-y-4">
      <div>
        <Label htmlFor="guest-name">{tx("Nama")}</Label>
        <Input
          className="mt-2"
          id="guest-name"
          name="name"
          autoComplete="nickname"
          required
          minLength={2}
          maxLength={60}
          aria-invalid={Boolean(state.error)}
          aria-describedby={state.error ? "guest-name-error" : undefined}
        />
      </div>
      {state.error && (
        <p
          id="guest-name-error"
          role="alert"
          className="text-sm text-destructive"
        >
          {tx(state.error)}
        </p>
      )}
      <Button type="submit" disabled={pending} className="w-full">
        {tx(pending ? "Menyiapkan…" : "Masuk sebagai tamu")}
      </Button>
    </form>
  );
}
