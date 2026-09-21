"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "./actions";
import { BUSINESS } from "@/lib/constants";
import Spinner from "@/components/site/Spinner";

const initialState: LoginState = { error: null };

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gold/20 bg-cream p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <p className="font-serif text-3xl text-ink">{BUSINESS.name}</p>
          <p className="mt-1 text-xs uppercase tracking-[0.25em] text-gold-dark">
            Admin Panel
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-soft">
              Username
            </label>
            <input
              name="username"
              type="text"
              required
              autoComplete="username"
              className="w-full rounded-lg border border-gold-light/60 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-soft">
              Password
            </label>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-lg border border-gold-light/60 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </div>

          {state.error && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="flex w-full items-center justify-center rounded-lg bg-ink py-2.5 text-sm font-semibold uppercase tracking-wide text-cream transition hover:bg-gold-dark disabled:opacity-60"
          >
            {pending ? <Spinner label="Signing in..." /> : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
