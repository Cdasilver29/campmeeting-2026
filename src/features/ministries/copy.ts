import type { MinistryTag } from "@/data";

export interface MinistryCopy {
  label: string;
  description: string;
}

/**
 * Human label and short description for each ministry, kept separate
 * from the components so the committee can revise wording without
 * touching JSX. Every MinistryTag has an entry; the ministries pages
 * only generate routes for the ones that actually have sessions
 * (programMinistries in features/schedule/lib/entries.ts).
 */
export const ministryCopy: Record<MinistryTag, MinistryCopy> = {
  worship: {
    label: "Worship",
    description:
      "Praise, prayer and the theme song that opens and closes each day.",
  },
  music: {
    label: "Music",
    description: "Choirs, special items and hymns woven through the programme.",
  },
  "bible-study": {
    label: "Bible Study",
    description: "Structured study of Scripture, led session by session.",
  },
  "spirit-of-prophecy": {
    label: "Spirit of Prophecy",
    description:
      "Readings and reflection drawn from the writings of Ellen G. White.",
  },
  prophecy: {
    label: "Prophecy",
    description: "Sessions on Bible prophecy and its meaning for today.",
  },
  "possibility-ministry": {
    label: "Possibility Ministry",
    description: "Ministry to and with members living with disability.",
  },
  evangelism: {
    label: "Evangelism",
    description: "Sharing the gospel and preparing members to share it.",
  },
  discipleship: {
    label: "Discipleship",
    description: "Growing in faith and in the practice of following Christ.",
  },
  publishing: {
    label: "Publishing",
    description: "Literature ministry and the printed word in mission.",
  },
  stewardship: {
    label: "Stewardship",
    description: "Faithful use of time, talent and resource.",
  },
  health: {
    label: "Health",
    description: "Whole-person health, from nutrition to the Medical Camp.",
  },
  "family-life": {
    label: "Family Life",
    description: "Marriage, parenting and the life of the home.",
  },
  children: {
    label: "Children",
    description:
      "Programming and Children's Corner sessions for the youngest campers.",
  },
  "christian-education": {
    label: "Christian Education",
    description: "Adventist education, from the classroom to lifelong learning.",
  },
  prayer: {
    label: "Prayer",
    description: "Corporate and personal prayer through the day.",
  },
  medical: {
    label: "Medical",
    description: "The Medical Camp and other health services offered on site.",
  },
  fellowship: {
    label: "Fellowship",
    description: "Meals, hospitality and the life shared between sessions.",
  },
};
