"use client";

import { useRef, useState, type FormEvent } from "react";
import { submitToWeb3Forms } from "./submit";

export type FormStatus =
  | "idle"
  | "submitting"
  | "success"
  | "error"
  /** Submit was pressed with no connection, so nothing was sent. */
  | "offline";

interface UseWeb3FormOptions {
  /** Default email subject line; a form can override this per-submit via `prepare`. */
  subject: string;
  fromName: string;
  /** Field name -> error message. Return {} when the form is valid. */
  validate: (data: FormData) => Record<string, string>;
  /** Last chance to adjust the outgoing FormData, e.g. a topic-specific subject. */
  prepare?: (data: FormData) => void;
}

/**
 * Shared submission lifecycle for both site forms: idle/submitting/
 * success/error, the honeypot check, and focusing the first invalid field.
 * The form itself stays an uncontrolled DOM form, so a failed submit never
 * has to "restore" typed values — they were never taken out of the DOM.
 */
export function useWeb3Form({
  subject,
  fromName,
  validate,
  prepare,
}: UseWeb3FormOptions) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    // Web3Forms' own honeypot convention: a hidden field named "botcheck"
    // that real visitors never fill. Pretend success without spending a
    // submission against the monthly quota.
    if (data.get("botcheck")) {
      setErrors({});
      setStatus("success");
      form.reset();
      return;
    }

    const fieldErrors = validate(data);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      const firstInvalidName = Object.keys(fieldErrors)[0];
      form
        .querySelector<HTMLElement>(`[name="${firstInvalidName}"]`)
        ?.focus();
      return;
    }

    setErrors({});

    // Checked here, after validation and before anything is sent, so the
    // answer is "this did not send" rather than a request that hangs and
    // then fails. Nothing is queued: a prayer request that quietly goes
    // out hours later, to a team that has stopped expecting it, is worse
    // than one the sender knows did not go.
    if (!navigator.onLine) {
      setStatus("offline");
      return;
    }

    setStatus("submitting");
    data.set("subject", subject);
    data.set("from_name", fromName);
    data.delete("botcheck");
    prepare?.(data);

    const ok = await submitToWeb3Forms(data);
    if (ok) {
      setStatus("success");
      form.reset();
    } else {
      setStatus("error");
    }
  }

  return { status, errors, formRef, handleSubmit };
}
