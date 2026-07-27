# Program Data — Source Notes

Transcribed from `Draft_Program_v2_CAMPMEETING_2026_JULY.pdf`. The data is 1:1 with the PDF except where noted. These are issues in the source document that the program committee should confirm before launch. None were silently "fixed" in the data beyond obvious typo normalization.

## Normalizations applied
- All times converted to 24h `HH:MM` (`"11.00 – 11,10am"` → `11:00–11:10`).
- "Theme song" / "Theme Song" casing unified.
- Sabbath 15th Divine Service "Hymn of Praise" has no presenter in the PDF; on the 22nd it's credited to Choristers. Left as printed for each day.

## Issues to confirm with the committee
1. **Friday 21st page header reads "CAMP MEETING 2025"** — every other page says 2026. Assumed typo; data uses 2026-08-21.
2. **Friday has no benediction and no evening service** — Mid Morning ends at 12:30 with the theme song, then Sabbath Preparation. If a vespers/sundown service exists, it's not in this draft.
3. **Sunday 16th morning is just "Medical camp"** with no times. Modeled as an untimed all-block activity. If registration times exist, add them.
4. **Sabbath 22nd afternoon has a gap** — Music ends 15:00, Hand of Fellowship starts 16:00. Nothing scheduled 15:00–16:00. As printed.
5. **Sabbath 15th afternoon ends 16:00 and evening starts 16:00**; on all other days evening starts 16:30. As printed, but worth confirming.
6. **Speaker names**: "Pr. Kennedy Mfune", "Eld. Ken Ochuka", "Allan Okoth", "Dr. Priskillah Munda" transcribed exactly as printed. Confirm spellings before publishing profiles.
7. **Social links**: cover shows Facebook and YouTube icons but no URLs. `event.ts` has empty strings to fill in.
8. **Sunday 16th Special Item credits both choirs; Monday–Thursday evening Special Items also credit both choirs** — as printed.

## For future years
Replace `src/data/program.ts` and update `src/data/event.ts`. Do not touch `types.ts` or `index.ts`.
