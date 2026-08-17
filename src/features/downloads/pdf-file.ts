import fs from "node:fs";
import path from "node:path";

/**
 * The build-time PDF probe, in one place.
 *
 * The whole site is statically generated, so a file in `public/` either
 * shipped before `pnpm build` ran or it did not — there is no request at
 * which a later answer could be given. That makes `statSync` during the
 * render the right check rather than a lazy one: replacing the PDF in
 * `public/downloads/` and rebuilding updates the size shown beside it
 * with no code change, which is the entire point.
 *
 * It is down to one caller again — the single programme download — having
 * been shared with the eight daily sheets while those existed. It stays a
 * module of its own rather than folding back into that component: the
 * size formatting is a decision worth keeping where it can be read, and
 * the next download the committee sends will want the same probe.
 */
export interface PdfFile {
  /** Public URL, e.g. `/downloads/camp-meeting-2026-programme.pdf`. */
  href: string;
  /** Size on disk in bytes. */
  size: number;
}

/**
 * `publicPath` is the URL, i.e. the path under `public/` with a leading
 * slash. Returns undefined when the file has not shipped yet.
 */
export function probePdf(publicPath: string): PdfFile | undefined {
  const filePath = path.join(process.cwd(), "public", publicPath);
  try {
    const stats = fs.statSync(filePath);
    return { href: publicPath, size: stats.size };
  } catch {
    return undefined;
  }
}

/**
 * Sizes are shown because a lot of this week's readers are on mobile data
 * standing in the churchyard, and "3.3 MB" is the difference between
 * tapping and not. Under a megabyte reads as KB: "0.4 MB" tells nobody
 * anything useful.
 */
export function formatSize(bytes: number): string {
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${Math.round(bytes / 1024)} KB`;
  return `${mb.toFixed(1)} MB`;
}
