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
  contact: {
    phone: "0795638070",
    email: "info@newlifesdanairobi.org",
    prayerEmail: "requests@newlifesdanairobi.org",
  },
  // Verified from newlifesdanairobi.org, July 2026.
  social: {
    facebook: "https://www.facebook.com/newlifesdanairobi.org",
    youtube: "https://www.youtube.com/c/NewlifeSDAChurchNairobi",
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
