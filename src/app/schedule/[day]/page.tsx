import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Band } from "@/components/band";
import { JsonLd } from "@/components/json-ld";
import { PageHeader } from "@/components/page-header";
import { getDay, program } from "@/data";
import { ScheduleProgramme } from "@/features/schedule/components/schedule-programme";
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

      <Band>
        <ScheduleProgramme day={day} />
      </Band>
    </>
  );
}
