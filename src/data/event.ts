import type { EventInfo, Speaker } from "./types";

export const eventInfo: EventInfo = {
  name: "Camp Meeting",
  year: 2026,
  edition: "Camp Meeting 2026",
  startDate: "2026-08-15",
  endDate: "2026-08-22",
  timezone: "Africa/Nairobi",
  church: {
    name: "Seventh-day Adventist Church Newlife",
    address: "5th Ngong Avenue, Nairobi",
    website: "https://www.newlifesdanairobi.org",
  },
  // Phone and email are confirmed against the church's own 2025 bulletin.
  contact: {
    phone: "0795638070",
    email: "info@newlifesdanairobi.org",
    // ── COMMITTEE OWES THIS ──────────────────────────────────────────
    // This was requests@newlifesdanairobi.org, which could not be
    // verified against any church source and is probably wrong, so
    // prayer requests fall back to the confirmed info@ address. Restore
    // a dedicated prayer address only once the church confirms it
    // exists and is monitored.
    prayerEmail: "info@newlifesdanairobi.org",
  },
  // Verified from newlifesdanairobi.org, July 2026.
  social: {
    facebook: "https://www.facebook.com/newlifesdanairobi.org",
    // Handle form. The /c/NewlifeSDAChurchNairobi form is legacy.
    youtube: "https://www.youtube.com/@NewlifeSDAChurchNairobi",
    instagram: "https://www.instagram.com/newlifesdachurchnairobi/",
    twitter: "https://twitter.com/NewlifechurchKE",
    linkedin: "https://www.linkedin.com/in/newlife-sda-church-nairobi-1415b3137/",
  },
  giving: {
    paybill: { number: "861200", account: "Tithe or Offerings" },
    bank: {
      name: "Standard Chartered Bank",
      branch: "Kenyatta Ave",
      account: "0102022990600",
    },
  },
};

export const speakers: Speaker[] = [
  {
    id: "kennedy-mfune",
    name: "Kennedy Mfune",
    title: "Pr.",
    role: "Main Speaker",
  },
  {
    id: "ken-ochuka",
    name: "Ken Ochuka",
    title: "Eld.",
  },
  {
    id: "allan-okoth",
    name: "Allan Okoth",
    role: "Children's Corner",
  },
  {
    id: "priskillah-munda",
    name: "Priskillah Munda",
    title: "Dr.",
    role: "Health Presenter",
  },
];

export const speakerById = Object.fromEntries(
  speakers.map((s) => [s.id, s]),
) as Record<string, Speaker>;
