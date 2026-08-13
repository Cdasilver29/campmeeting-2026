export interface MinistryCopy {
  label: string;
  description: string;
}

/**
 * The ministries with a page of their own under /ministries: enough
 * sessions across enough days to be a destination rather than a filter
 * result. Everything else (worship, music, prayer, and the rest) stays
 * reachable through ?ministry= on the programme — see /ministries/page.tsx.
 *
 * ── CHILDREN IS NOT ON THIS LIST, AND IS NOT GONE ───────────────────
 *
 * It has a top-level route, `/children`, and a place in the main nav.
 * The ministry TAG still exists and still tags the Children's Corner on
 * all seven days that have one, so `?ministry=children` on the programme
 * works exactly as it did; what moved is the destination. It earned the
 * move by having content no other ministry has — its own timetable, its
 * own eleven classes and its own coordinators, none of which is in
 * program.ts — and a page like that sitting two levels down behind a
 * grid of four cards was the wrong shape for it.
 *
 * /ministries/children redirects to /children (src/middleware.ts), so
 * every link, bookmark and precached URL that pointed at the old address
 * still arrives.
 */
export const ministryPages = [
  "family-life",
  "health",
  "christian-education",
] as const;

export type MinistryPageTag = (typeof ministryPages)[number];

/**
 * Human label and short description for each page, kept separate from
 * the components so the committee can revise wording without touching
 * JSX.
 */
export const ministryCopy: Record<MinistryPageTag, MinistryCopy> = {
  "family-life": {
    label: "Family Life",
    description: "Marriage, parenting and the life of the home.",
  },
  health: {
    label: "Health",
    description: "Whole-person health, from nutrition to the Medical Camp.",
  },
  "christian-education": {
    label: "Christian Education",
    description: "Adventist education, from the classroom to lifelong learning.",
  },
};
