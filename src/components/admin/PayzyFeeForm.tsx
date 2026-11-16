"use client";

import { useActionState } from "react";
import {
  updatePayzyFeeAction,
  type SettingsState,
} from "@/app/admin/(dashboard)/settings/actions";
import Spinner from "@/components/site/Spinner";

const initialState: SettingsState = { error: null, saved: false };

export default function PayzyFeeForm({ currentPercent }: { currentPercent: number }) {
  const [state, formAction, pending] = useActionState(
    updatePayzyFeeAction,
    initialState
  );

  return (
    <form action={formAction} className="rounded-2xl border border-gold-light/50 bg-white p-6">
      <h2 className="font-serif text-xl text-ink">Payzy Fee</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Payzy&apos;s commission, added to orders paid online. Update this if they
        change their rate. Cash-on-delivery orders are unaffected, and orders
        already placed keep the fee they were charged.
      </p>

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="block text-sm">
          <span className="mb-1 block font-medium text-ink-soft">Rate (%)</span>
          <input
            name="payzyFeePercent"
            type="number"
            min={0}
            max={100}
            step="0.01"
            defaultValue={currentPercent}
            required
            className="w-40 rounded-lg border border-gold-light/60 bg-white px-3 py-2 text-sm outline-none focus:border-gold"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="flex items-center justify-center rounded-lg bg-ink px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-cream transition hover:bg-gold-dark disabled:opacity-60"
        >
          {pending ? <Spinner label="Saving..." /> : "Save"}
        </button>
      </div>

      <p className="mt-3 text-xs text-ink-soft">
        Set to 0 to absorb the fee yourself instead of passing it to customers.
      </p>

      {state.error && (
        <p className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state.saved && !state.error && (
        <p className="mt-3 rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">
          Payzy fee updated.
        </p>
      )}
    </form>
  );
}
