/**
 * The printed programme PDF. One file, for the whole week.
 *
 * ── WHAT WAS HERE, AND WHY IT IS NOT ─────────────────────────────────
 *
 * A `dailyProgrammes` array of up to eight entries, one per day, because
 * the committee was printing each day's sheet the evening before and the
 * page rendered all eight days with the unprinted ones marked pending.
 * That is over: the committee has issued ONE programme covering all eight
 * days, so there is nothing left to be pending about. The eight-entry
 * array, the `dailyProgrammeFor` lookup, the day-by-day list and the
 * per-day PDFs in `public/downloads/` all went with it.
 *
 * A single file needs no lookup and no schedule of arrivals, so this is a
 * filename and the directory it sits in. Everything else about the row is
 * still derived rather than written down: the SIZE is read off disk at
 * build time by `probePdf` (src/features/downloads/pdf-file.ts), and the
 * number of days it covers comes from `program`, so a future year that
 * swaps the data files cannot end up with a caption that miscounts its
 * own week.
 *
 * ── REPLACING IT ─────────────────────────────────────────────────────
 *
 * Overwrite `public/downloads/camp-meeting-2026-programme.pdf` and
 * rebuild. The name is deliberately plain and stable: it is a public URL
 * that people paste into WhatsApp, and the committee's own export names
 * ("... Program FV.pdf") carry version marks and spaces that would be
 * percent-encoded in every link.
 *
 * If the file is missing at build time the download section does not
 * render at all — see the component. A page with no PDF on it is honest;
 * a link to a 404 is not.
 */

/** Where these live in `public/`, and therefore the URL prefix. */
export const DOWNLOADS_DIR = "/downloads";

/** Filename inside `public/downloads/`. */
export const PROGRAMME_PDF_FILE = "camp-meeting-2026-programme.pdf";

/** The public URL of the programme PDF. */
export const programmePdfPath = `${DOWNLOADS_DIR}/${PROGRAMME_PDF_FILE}`;
