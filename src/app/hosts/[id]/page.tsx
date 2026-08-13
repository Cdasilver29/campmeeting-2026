import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Band } from "@/components/band";
import { PageHeader } from "@/components/page-header";
import { Reveal } from "@/components/reveal";
import { hostById, hostLetter, hosts, speakerById } from "@/data";
import { HostLetterBody } from "@/features/speakers/components/host-letter";
import { SpeakerPortrait } from "@/features/speakers/components/speaker-avatar";
import { ACTION_LINK } from "@/lib/link-styles";
import { pageMetadata } from "@/lib/metadata";
import { hostPageDefinition } from "@/lib/page-identity";

/**
 * ── ONE PAGE PER WELCOME LETTER ──────────────────────────────────────
 *
 * A route of its own rather than a reuse of /speakers/[id], because four
 * of the five hosts are not speakers and have no record there. Building
 * this on the speaker route would have meant either inventing four
 * speaker records for people who present nothing — which would then have
 * to be filtered back out of the presenter grid, the presenter filter and
 * every session count — or giving one host a page and the other four
 * nothing.
 *
 * Eld. Ken Ochuka is on both lists and now has two pages, and that is the
 * right answer rather than a duplicate: /speakers/ken-ochuka is what he
 * presents, /hosts/ken-ochuka is what he wrote. Each links to the other.
 *
 * `generateStaticParams` is derived from the LETTERS, not from `hosts`,
 * so a host who has not written has no route rather than a page with a
 * heading and nothing under it.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return hosts
    .filter((host) => Boolean(hostLetter(host.id)))
    .map((host) => ({ id: host.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const host = hostById[(await params).id];
  if (!host) return {};

  return pageMetadata(hostPageDefinition(host));
}

export default async function HostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const host = hostById[(await params).id];
  const letter = host ? hostLetter(host.id) : undefined;
  // Unreachable while dynamicParams is false, but the two lookups can
  // still fail and this is what makes that a 404 rather than a crash.
  if (!host || !letter) notFound();

  /* The same read HostCard does: Eld. Ken Ochuka's portrait lives on his
     SPEAKER record, so one photograph is held once rather than the same
     file named in two arrays that drift the first time one is re-cropped.
     `?? host` falls back to the monogram if a speakerId ever points at a
     profile that does not exist. */
  const sitter = (host.speakerId ? speakerById[host.speakerId] : undefined) ?? host;

  return (
    <>
      <PageHeader
        {...hostPageDefinition(host)}
        media={<SpeakerPortrait speaker={sitter} />}
      />

      <Band innerClassName="flex flex-col gap-(--space-section)">
        <Reveal>
          <article aria-label={`Welcome letter from ${host.name}`}>
            <HostLetterBody letter={letter} />
          </article>
        </Reveal>

        <Reveal>
          <p className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/speakers" className={ACTION_LINK}>
              All hosts and speakers
            </Link>
            {/* Only for the one host who also presents. The two pages are
                the same person seen from two angles and each says so. */}
            {host.speakerId ? (
              <Link href={`/speakers/${host.speakerId}`} className={ACTION_LINK}>
                {host.name} on the programme
              </Link>
            ) : null}
          </p>
        </Reveal>
      </Band>
    </>
  );
}
