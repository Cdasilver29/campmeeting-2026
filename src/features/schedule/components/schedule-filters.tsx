"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { type MinistryTag } from "@/data";
import { cn } from "@/lib/utils";
import { programMinistries } from "../lib/entries";
import { programSpeakers, speakerLabel } from "../lib/presenters";
import { ministryLabels } from "../lib/today";
import { scheduleHref, type ScheduleFilters } from "../lib/url";

const selectClasses =
  "h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 text-sm text-ink transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:w-auto dark:bg-input/30";

/**
 * The filter bar. Nothing here holds the result set: every control
 * writes the query string and the results are read back from it, so a
 * filtered view is a URL a reader can send to someone.
 *
 * Facet changes push a history entry, since each is a deliberate step a
 * reader may want to walk back. The text field replaces instead, because
 * pushing per keystroke would bury the previous page under a dozen
 * entries and make the back button useless.
 */
export function ScheduleFiltersBar({ filters }: { filters: ScheduleFilters }) {
  const router = useRouter();

  // Read at flush time rather than captured, so a debounced search that
  // lands after a facet click keeps that click.
  const latest = useRef(filters);
  useEffect(() => {
    latest.current = filters;
  });

  const [text, setText] = useState(filters.q);
  // The last value this component put in the URL. Anything else arriving
  // in `q` came from outside — back button, clear link, a shared link —
  // and should overwrite the field. Without this the debounced write
  // would echo back and clobber whatever was typed in the meantime.
  const submitted = useRef(filters.q);

  useEffect(() => {
    if (filters.q === submitted.current) return;
    submitted.current = filters.q;
    setText(filters.q);
  }, [filters.q]);

  useEffect(() => {
    if (text === submitted.current) return;
    const id = setTimeout(() => {
      submitted.current = text;
      router.replace(scheduleHref({ ...latest.current, q: text }), {
        scroll: false,
      });
    }, 250);
    return () => clearTimeout(id);
  }, [text, router]);

  const patch = (next: Partial<ScheduleFilters>) => {
    router.push(scheduleHref({ ...filters, ...next }), { scroll: false });
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end">
      <div className="flex flex-1 flex-col gap-1.5">
        <label
          htmlFor="schedule-search"
          className="text-xs font-medium text-ink-muted"
        >
          Search the programme
        </label>
        <div className="relative">
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-muted"
          />
          <Input
            id="schedule-search"
            type="search"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Session, presenter or ministry"
            className="pl-8"
          />
        </div>
      </div>

      <FilterSelect
        id="schedule-ministry"
        label="Ministry"
        value={filters.ministry ?? ""}
        onChange={(value) =>
          patch({ ministry: (value || undefined) as MinistryTag | undefined })
        }
        options={programMinistries.map((tag) => ({
          value: tag,
          label: ministryLabels[tag],
        }))}
        allLabel="All ministries"
      />

      <FilterSelect
        id="schedule-speaker"
        label="Presenter"
        value={filters.speaker ?? ""}
        onChange={(value) => patch({ speaker: value || undefined })}
        options={programSpeakers.map((speaker) => ({
          value: speaker.id,
          label: speakerLabel(speaker),
        }))}
        allLabel="All presenters"
      />
    </div>
  );
}

/**
 * Native select rather than a listbox widget: it is keyboard and screen
 * reader correct without any code of ours, and on a phone it opens the
 * platform picker, which is the right control on the campground.
 */
function FilterSelect({
  id,
  label,
  value,
  onChange,
  options,
  allLabel,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  allLabel: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-ink-muted">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event: ChangeEvent<HTMLSelectElement>) =>
          onChange(event.target.value)
        }
        className={cn(selectClasses)}
      >
        <option value="">{allLabel}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
