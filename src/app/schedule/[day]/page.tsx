import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Band } from "@/components/band";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { getDay, program } from "@/data";
import { ScheduleProgramme } from "@/features/schedule/components/schedule-programme";
import { DaySundown } from "@/features/schedule/components/sundown";
import { pageMetadata } from "@/lib/metadata";
import { dayPageDefinition } from "@/lib/page-identity";
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

  return pageMetadata(dayPageDefinition(day));
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

  return (
    <>
      {/* This day as an Event, with every session and untimed activity
          nested as a subEvent. */}
      <JsonLd data={dayEventDocument(day)} />

      <PageHeader {...dayPageDefinition(day)} />

      {/* NO REVEAL HERE, AND THAT IS DELIBERATE. DO NOT "FIX" IT. This is
          programme content and it follows the same rule as /schedule: it
          server-renders so it reads offline and before hydration, and there
          is no granularity at which an entrance would be section-sized
          rather than per-row. The full reasoning is in
          src/app/schedule/page.tsx. */}
      <Band drift={false}>
        {/* Above the programme, not inside it. Sundown is a fact about the
            whole day rather than an entry in it, and on Friday it is the
            thing the afternoon is organised around — the block below is
            Sabbath Preparation and this is what it is preparing for. Both
            Sabbaths get the card too, for the end of the day; every other
            day gets one muted line. See DaySundown. */}
        <DaySundown day={day} days={program} className="mb-(--space-item)" />
        <ScheduleProgramme day={day} />
      </Band>
    </>
  );
}
