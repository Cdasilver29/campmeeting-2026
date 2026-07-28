"use client";

import { eventInfo } from "@/data";
import { HoneypotField } from "./components/honeypot-field";
import { FormStatusBanner } from "./components/form-status-banner";
import { OfflineBanner } from "./components/offline-banner";
import { SelectField, TextAreaField, TextField } from "./components/form-fields";
import { SubmitButton } from "./components/submit-button";
import { useOnline } from "./lib/use-online";
import { useWeb3Form } from "./lib/use-web3-form";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TOPIC_OPTIONS = [
  { value: "general", label: "General enquiry" },
  { value: "accommodation", label: "Accommodation and camping" },
  { value: "programme", label: "Programme and speakers" },
  { value: "giving", label: "Giving and tithes" },
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

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
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
      />
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
