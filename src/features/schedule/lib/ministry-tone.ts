import type { MinistryTag } from "@/data";

/**
 * Which of the four ministry families a tag belongs to.
 *
 * The programme carries seventeen ministry tags. Giving each its own
 * colour would be a rainbow and would say nothing, because seventeen hues
 * are not distinguishable from one another at chip size. So the tags are
 * grouped by what they are for, and the group is what carries a hue.
 *
 *   devotion   the service itself: worship, music, prayer, and the
 *              Spirit of Prophecy readings that sit inside it
 *   word       teaching and telling: study, prophecy, discipleship,
 *              Christian education, publishing, evangelism
 *   care       the body: health, the medical camp, possibility ministry
 *   community  the congregation: family life, children, fellowship,
 *              stewardship
 *
 * The four hues are declared in globals.css as one lightness and one
 * chroma with the hue rotated, so they read as a set. The measured
 * contrast of each ink on its own tint is 7.2:1 to 7.9:1 in both modes.
 */
export type MinistryFamily = "devotion" | "word" | "care" | "community";

const familyByTag: Record<MinistryTag, MinistryFamily> = {
  worship: "devotion",
  music: "devotion",
  prayer: "devotion",
  "spirit-of-prophecy": "devotion",

  "bible-study": "word",
  prophecy: "word",
  discipleship: "word",
  "christian-education": "word",
  publishing: "word",
  evangelism: "word",

  health: "care",
  medical: "care",
  "possibility-ministry": "care",

  "family-life": "community",
  children: "community",
  fellowship: "community",
  stewardship: "community",
};

/**
 * The chip's classes, per family.
 *
 * Written out as complete literal strings rather than assembled from the
 * family name. Tailwind finds class names by scanning source text, so
 * `bg-tag-${family}-tint` is a name it never generates and the rule would
 * silently not exist.
 */
const chipByFamily: Record<MinistryFamily, string> = {
  devotion: "bg-tag-devotion-tint text-tag-devotion",
  word: "bg-tag-word-tint text-tag-word",
  care: "bg-tag-care-tint text-tag-care",
  community: "bg-tag-community-tint text-tag-community",
};

export function ministryChipClasses(tag: MinistryTag): string {
  return chipByFamily[familyByTag[tag]];
}
