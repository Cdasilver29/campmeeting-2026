export interface MinistryCopy {
  label: string;
  description: string;
}

/**
 * The ministries with a page of their own: enough sessions across enough
 * days to be a destination rather than a filter result. Everything else
 * (worship, music, prayer, and the rest) stays reachable through
 * ?ministry= on the programme — see /ministries/page.tsx.
 */
export const ministryPages = [
  "children",
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
  children: {
    label: "Children",
    description:
      "Programming and Children's Corner sessions for the youngest campers.",
  },
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
