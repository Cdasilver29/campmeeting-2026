/**
 * The home hero's photographic treatment, behind one switch.
 *
 * Set HERO_IMAGE to undefined and the whole photograph goes away: the
 * image, the blur, the overlay, the preload. The hero falls back to a
 * solid navy band that is a deliberate treatment in its own right, not a
 * broken-looking gap. That is the point of the constant. The church has
 * not signed off on using a photograph of the building in the hero, and
 * if they decide against it the change has to be one line here rather
 * than an unpicking of the hero component.
 *
 * `overlayOpacity` is not a taste setting. It was measured: the composited
 * pixels behind the hero text were sampled at the rendered size, with the
 * blur applied, and the lightest one checked against white. See the
 * comment on the value itself.
 */
export type HeroImage = {
  src: string;
  /** Intrinsic size of the file, for next/image. */
  width: number;
  height: number;
  /** CSS blur radius in px. Matches the `blur` filter on the image. */
  blurPx: number;
  /** Navy overlay alpha, 0-1. */
  overlayOpacity: number;
};

export const HERO_IMAGE: HeroImage | undefined = {
  src: "/hero/church.webp",
  // The source is 1535x1024, which is under half the pixels a full-bleed
  // desktop hero would normally want. The blur makes the shortfall mostly
  // academic, but the band is deliberately kept to a moderate height
  // rather than full-viewport so the file is never asked to stretch
  // further than it can.
  width: 1535,
  height: 1024,
  blurPx: 24,
  // Measured, not chosen. The photograph has a sun flare in the upper
  // right, so the average brightness is useless here — the flare survives
  // a 24px blur nearly intact (lightest source pixel inside the text
  // column is still 255,251,235).
  //
  // Method: object-cover crop at the rendered band size, blur applied,
  // navy painted over at this alpha, then the LIGHTEST single pixel in
  // the text column read back and checked against white. Worst viewport
  // of the four sampled is 1440x448:
  //   0.55 -> 3.82:1  fail
  //   0.60 -> 4.45:1  fail
  //   0.63 -> 4.88:1  pass, no margin
  //   0.66 -> 5.36:1  pass  <- this
  //   0.70 -> 6.10:1  pass, photo too far gone
  // 1920w, 1024w and 390w all measured lighter than 1440w at every alpha.
  overlayOpacity: 0.66,
};
