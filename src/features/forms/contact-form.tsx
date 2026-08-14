"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";
import { eventInfo } from "@/data";
import { HoneypotField } from "./components/honeypot-field";
import { FormStatusBanner } from "./components/form-status-banner";
import { OfflineBanner } from "./components/offline-banner";
import { SelectField, TextAreaField, TextField } from "./components/form-fields";
import { SubmitButton } from "./components/submit-button";
import { useOnline } from "./lib/use-online";
import { useWeb3Form } from "./lib/use-web3-form";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * ── "PRAYER REQUEST" IS A TOPIC, NOT A PAGE ──────────────────────────
 *
 * /prayer-requests was removed, and with it the only route a reader had
 * for asking to be prayed for. `eventInfo.contact.prayerEmail` outlived
 * it as a field nothing rendered. Rather than leave a dead field or drop
 * the route entirely, the route comes back here as a topic: the same
 * confirmed address, the same delivery, and a subject line the church can
 * sort on.
 *
 * It is deliberately the LAST option before "Something else", so it does
 * not present itself as the default reason to write.
 */
const PRAYER_TOPIC = "prayer";

const TOPIC_OPTIONS = [
  { value: "general", label: "General enquiry" },
  { value: "accommodation", label: "Accommodation and camping" },
  { value: "programme", label: "Programme and speakers" },
  { value: "giving", label: "Giving and tithes" },
  { value: PRAYER_TOPIC, label: "Prayer request" },
  { value: "other", label: "Something else" },
];

function validateContact(data: FormData): Record<string, string> {
  const errors: Record<string, string> = {};
  const name = String(data.get("name") ?? "").trim();
  const email = String(data.get("email") ?? "").trim();
  const topic = String(data.get("topic") ?? "").trim();
  const message = String(data.get("message") ?? "").trim();

  if (!name) errors.name = "Enter your name.";
  if (!email) {
    errors.email = "Enter your email address.";
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!topic) errors.topic = "Choose a topic.";
  if (!message) errors.message = "Enter a message.";

  return errors;
}

export function ContactForm() {
  const online = useOnline();
  // The chosen topic, held only to decide whether the confidentiality
  // note is showing. Nothing here is written to localStorage and nothing
  // is persisted between visits — CLAUDE.md's rule about prayer requests
  // holds wherever they are typed, and this site carries no analytics on
  // any page to begin with.
  const [topic, setTopic] = useState("");
  const { status, errors, formRef, handleSubmit } = useWeb3Form({
    subject: `Contact form — ${eventInfo.edition}`,
    fromName: `${eventInfo.edition} website — contact form`,
    validate: validateContact,
    // Subject line reflects the chosen topic so replies route usefully.
    prepare: (data) => {
      const topic = TOPIC_OPTIONS.find((o) => o.value === data.get("topic"));
      if (topic) data.set("subject", `Contact form — ${topic.label}`);
    },
  });

  /*
   * The topic is the one field React holds rather than the DOM, so the
   * `form.reset()` that empties every other field on a successful send
   * leaves this one showing the last choice. On the prayer topic that is
   * not just untidy: the confidentiality note stays under a form whose
   * message has already gone, which reads as though something is still
   * waiting to be sent.
   */
  useEffect(() => {
    if (status === "success") setTopic("");
  }, [status]);

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      className="field-column flex flex-col gap-5"
    >
      <HoneypotField />

      <TextField
        id="contact-name"
        name="name"
        label="Name"
        required
        error={errors.name}
        autoComplete="name"
      />
      <TextField
        id="contact-email"
        name="email"
        label="Email"
        type="email"
        required
        error={errors.email}
        autoComplete="email"
      />
      <SelectField
        id="contact-topic"
        name="topic"
        label="What is this about"
        required
        error={errors.topic}
        placeholder="Choose a topic"
        options={TOPIC_OPTIONS}
        value={topic}
        onChange={(event) => setTopic(event.currentTarget.value)}
      />

      {/* Shown only on the prayer topic, and it is the church's own
          existing promise rather than a new one this site invents. An
          icon and a heading-weight opening carry it independently of the
          tint, so it is not colour alone. */}
      {topic === PRAYER_TOPIC ? (
        <p className="field-control flex items-start gap-2 rounded-card bg-surface-muted p-3 text-sm text-ink-muted ring-1 ring-line">
          <Lock aria-hidden className="mt-0.5 size-4 shrink-0 text-ink" />
          <span>
            <span className="font-medium text-ink">In confidence.</span> What
            you write goes to the pastoral team and is not published, shared
            or stored on this site.
          </span>
        </p>
      ) : null}

      <TextAreaField
        id="contact-message"
        name="message"
        label="Message"
        required
        error={errors.message}
      />

      {!online || status === "offline" ? (
        <OfflineBanner
          attempted={status === "offline"}
          noun="message"
          fallbackEmail={eventInfo.contact.email}
        />
      ) : null}

      <FormStatusBanner
        status={status}
        successMessage="Thanks — your message is on its way. We'll get back to you soon."
        errorMessage={
          <>
            Your message could not be sent right now. Please email us
            directly at{" "}
            <a
              href={`mailto:${eventInfo.contact.email}`}
              className="underline underline-offset-4"
            >
              {eventInfo.contact.email}
            </a>
            . What you typed is still here below if you would like to copy
            it across.
          </>
        }
      />

      <SubmitButton status={status} idleLabel="Send message" submittingLabel="Sending…" />
    </form>
  );
}
