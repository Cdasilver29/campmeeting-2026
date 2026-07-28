import type { ReactNode } from "react";
import type { FormStatus } from "../lib/use-web3-form";

/**
 * Announces the submit result without moving focus, so a keyboard user
 * stays exactly where they were (typically the submit button). `role`
 * alone gives screen readers a live region — success is polite, error is
 * assertive, since the person needs to notice and act on it.
 */
export function FormStatusBanner({
  status,
  successMessage,
  errorMessage,
}: {
  status: FormStatus;
  successMessage: ReactNode;
  errorMessage: ReactNode;
}) {
  if (status === "success") {
    return (
      <div
        role="status"
        className="rounded-card bg-surface-muted p-4 text-sm text-ink ring-1 ring-line"
      >
        {successMessage}
      </div>
    );
  }

  if (status === "error") {
    return (
      <div
        role="alert"
        className="rounded-card bg-surface-muted p-4 text-sm text-ink ring-1 ring-line"
      >
        {errorMessage}
      </div>
    );
  }

  return null;
}
