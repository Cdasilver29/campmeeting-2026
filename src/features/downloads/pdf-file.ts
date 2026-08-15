import fs from "node:fs";
import path from "node:path";

/**
 * The build-time PDF probe, in one place.
 *
 * The whole site is statically generated, so a file in `public/` either
 * shipped before `pnpm build` ran or it did not — there is no request at
 * which a later answer could be given. That makes `statSync` during the
 * render the right check rather than a lazy one: dropping a PDF into
 * `public/downloads/` and rebuilding turns a pending row into a real
 * download with no code change, which is the entire point.
 *
 * This was the full programme's private helper. The daily programmes need
 * exactly the same probe eight times over, so it moved here rather than
 * being written a second time — one mechanism, one place it can be wrong.
 */
export interface PdfFile {
  /** Public URL, e.g. `/downloads/camp-meeting-day-1.pdf`. */
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
