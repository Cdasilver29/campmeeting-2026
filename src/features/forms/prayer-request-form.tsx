"use client";

import { useState } from "react";
import { eventInfo } from "@/data";
import { HoneypotField } from "./components/honeypot-field";
import { FormStatusBanner } from "./components/form-status-banner";
import { OfflineBanner } from "./components/offline-banner";
import { TextAreaField, TextField } from "./components/form-fields";
import { SubmitButton } from "./components/submit-button";
import { useOnline } from "./lib/use-online";
import { useWeb3Form } from "./lib/use-web3-form";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validatePrayerRequest(data: FormData): Record<string, string> {
  const errors: Record<string, string> = {};
  const message = String(data.get("message") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();

  if (!message) errors.message = "Enter your prayer request.";
  if (email && !EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address, or leave it blank.";
  }

  return errors;
}

const fallbackEmail = eventInfo.contact.prayerEmail ?? eventInfo.contact.email;

export function PrayerRequestForm() {
  // In-memory only — this choice is never written to any client storage.
  const [shareIdentity, setShareIdentity] = useState(false);
  const online = useOnline();

  const { status, errors, formRef, handleSubmit } = useWeb3Form({
    subject: `Prayer request — ${eventInfo.edition}`,
    fromName: `${eventInfo.edition} website — prayer request form`,
    validate: validatePrayerRequest,
    prepare: (data) => {
      if (data.get("identity") !== "share") {
        data.set("from_name", `Anonymous — ${eventInfo.edition} prayer request form`);
      }
    },
  });

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <HoneypotField />

      <fieldset className="flex flex-col gap-3">
        <legend className="text-xs font-medium text-ink-muted">
          How should we receive this?
        </legend>
        <label className="flex min-h-11 items-start gap-2 py-1 text-sm text-ink">
          <input
            type="radio"
            name="identity"
            value="anonymous"
            defaultChecked
            onChange={() => setShareIdentity(false)}
            className="mt-1 size-4 shrink-0 accent-accent-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          />
          <span>
            <span className="block font-medium">Submit anonymously</span>
            <span className="block text-ink-muted">
              No name or email is sent with your request.
            </span>
          </span>
        </label>
        <label className="flex min-h-11 items-start gap-2 py-1 text-sm text-ink">
          <input
            type="radio"
            name="identity"
            value="share"
            onChange={() => setShareIdentity(true)}
            className="mt-1 size-4 shrink-0 accent-accent-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-500"
          />
          <span>
            <span className="block font-medium">Share my name</span>
            <span className="block text-ink-muted">
              Add your name and/or email below, if you would like a reply.
            </span>
          </span>
        </label>
      </fieldset>

      {shareIdentity ? (
        <>
          <TextField
            id="prayer-name"
            name="name"
            label="Name"
            error={errors.name}
            autoComplete="name"
          />
          <TextField
            id="prayer-email"
            name="email"
            label="Email"
            type="email"
            error={errors.email}
            autoComplete="email"
            hint="So the pastoral team can follow up, if you would like that."
          />
        </>
      ) : null}

      <TextAreaField
        id="prayer-message"
        name="message"
        label="Your prayer request"
        required
        error={errors.message}
      />

      {/*
        TODO(committee): Web3Forms' FAQ says submissions are not stored,
        but their pricing pages describe a retention window, and that
        contradiction hasn't been resolved with them directly. Tighten
        this wording once we get a straight answer — for now it only
        claims what we've actually verified: where the request goes.
      */}
      <p className="text-xs text-ink-muted">
        This form sends your request directly to our pastoral team by
        email. We can&apos;t promise that no copy exists anywhere else, but
        it will be held in the same confidence the church promises for
        every prayer request brought to it.
      </p>

      {!online || status === "offline" ? (
        <OfflineBanner
          attempted={status === "offline"}
          noun="prayer request"
          fallbackEmail={fallbackEmail}
        />
      ) : null}

      <FormStatusBanner
        status={status}
        successMessage="Your request has been received. Someone from our pastoral team will be holding this with you in prayer. Thank you for trusting us with it."
        errorMessage={
          <>
            Your request could not be sent right now. Please email us
            directly at{" "}
            <a
              href={`mailto:${fallbackEmail}`}
              className="underline underline-offset-4"
            >
              {fallbackEmail}
            </a>
            . What you typed is still here below if you would like to copy
            it across.
          </>
        }
      />

      <SubmitButton status={status} idleLabel="Send request" submittingLabel="Sending…" />
    </form>
  );
}
