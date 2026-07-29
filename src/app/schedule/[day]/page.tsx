import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { eventInfo, getDay, program } from "@/data";
import { ScheduleProgramme } from "@/features/schedule/components/schedule-programme";
import {
  dayNumber,
  fullDayLabel,
  scheduleScope,
} from "@/features/schedule/lib/entries";
import { dayPath } from "@/features/schedule/lib/url";
import { pageMetadata } from "@/lib/metadata";
import { dayEventDocument } from "@/lib/structured-data";

/** One page per programme day, and nothing else: an unknown day is a 404. */
export const dynamicParams = false;

export function generateStaticParams() {
  return program.map((day) => ({ day: day.id }));
}

/**
 * The day's own title and description, so a link shared in a WhatsApp
 * thread previews as that day rather than as the site.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ day: string }>;
}): Promise<Metadata> {
  const day = getDay((await params).day);
  if (!day) return {};

  const label = fullDayLabel(day);
  const { total } = scheduleScope(day.id);

  return pageMetadata({
    title: label,
    description: `${total} programme entries for ${label}, day ${dayNumber(day.id)} of ${program.length} at ${eventInfo.edition}, ${eventInfo.church.name}, ${eventInfo.church.address}. Times are East Africa Time.`,
    path: dayPath(day.id),
  });
}

export default async function ScheduleDayPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const day = getDay((await params).day);
  // Unreachable while dynamicParams is false, but the data lookup can
  // still fail and this is what makes that a 404 rather than a crash.
  if (!day) notFound();

  const { total } = scheduleScope(day.id);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-16">
      {/* This day as an Event, with every session and untimed activity
          nested as a subEvent. */}
      <JsonLd data={dayEventDocument(day)} />

      <header className="flex flex-col gap-3">
        <p className="text-sm tracking-wide text-ink-muted uppercase">
          Day {dayNumber(day.id)} of {program.length}
        </p>
        <h1 className="font-display text-4xl text-balance">
          {fullDayLabel(day)}
        </h1>
        <p className="text-lg text-ink-muted">
          {total} programme entries, as printed. Times are East Africa Time.
        </p>
      </header>

      <ScheduleProgramme day={day} />
    </div>
  );
}
