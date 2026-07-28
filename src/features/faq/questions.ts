import { eventInfo, program } from "@/data";

export interface FaqItem {
  question: string;
  answer: string;
  /**
   * True when the answer is provisional wording written ahead of
   * committee sign-off, not a confirmed fact from event.ts or
   * program.ts. The FAQ page marks these visibly rather than presenting
   * them as settled.
   */
  placeholder?: boolean;
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/**
 * Seeded from what the programme data already answers: dates, venue,
 * session times, livestream and the children's programme. Everything
 * else (parking, meals, accommodation) is not asked here because
 * nothing in src/data speaks to it yet.
 */
export const faqItems: FaqItem[] = [
  {
    question: "When is Camp Meeting 2026?",
    answer: `${eventInfo.edition} runs from ${formatDate(eventInfo.startDate)} to ${formatDate(eventInfo.endDate)}, ${program.length} days in total.`,
  },
  {
    question: "Where is it held?",
    answer: `${eventInfo.church.name}, ${eventInfo.church.address}. See the Contact page for a map and directions.`,
  },
  {
    question: "What time do sessions start each day?",
    answer:
      "There is no single start time: each day has its own timeline of blocks and sessions, in East Africa Time. See the full programme, or that day's own page, for the exact times.",
  },
  {
    question: "Will the sessions be livestreamed?",
    answer: eventInfo.social.youtube
      ? `Yes. Camp Meeting is streamed on the church's YouTube channel, ${eventInfo.social.youtube.replace(/^https?:\/\//, "")}.`
      : "Livestream details have not been confirmed yet.",
  },
  {
    question: "Is there a programme for children?",
    answer:
      "Yes, the Children's Corner runs sessions across the week. What to bring for children (materials, snacks, a change of clothes) has not been confirmed by the organising committee yet — check back closer to the date.",
    placeholder: true,
  },
];
