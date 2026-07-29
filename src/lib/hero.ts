/**
 * The home hero's photographic treatment, behind one switch.
 *
 * Set HERO_IMAGE to undefined and the whole photograph goes away: the
 * image, the overlay, the preload. The hero falls back to a solid navy
 * band that is a deliberate treatment in its own right, not a broken-
 * looking gap. That is the point of the constant. The church has not
 * signed off on using a photograph of the building in the hero, and if
 * they decide against it the change has to be one line here rather than
 * an unpicking of the hero component.
 *
 * `overlayOpacity` is not a taste setting. It was measured: the composited
 * pixels behind the hero text were sampled at the rendered size and the
 * lightest one checked against white. See the comment on the value.
 */
export type HeroImage = {
  src: string;
  /** Intrinsic size of the file, for next/image. */
  width: number;
  height: number;
  /** Navy overlay alpha, 0-1. */
  overlayOpacity: number;
};

export const HERO_IMAGE: HeroImage | undefined = {
  src: "/hero/church.webp",
  // 1634x962, converted from the supplied PNG at WebP q90 (2,674,440 ->
  // 420,772 bytes). The photograph is rendered sharp, so the band is kept
  // to a moderate height rather than full-viewport: at 1634 wide it has
  // the pixels for a 448px band on a 1920 viewport and not much more.
  width: 1634,
  height: 962,
  // Measured, not chosen, and re-measured after the blur came off. There
  // is no blur left to soften the sky, so the worst pixel behind the text
  // is now bare cloud at 255,255,255 and the average brightness is beside
  // the point.
  //
  // Method: object-cover crop at the rendered band size, navy painted over
  // at this alpha, then the LIGHTEST single pixel in the text column read
  // back and checked against white. All six viewports sampled (390, 640,
  // 1023, 1024, 1440, 1920) land within 0.02 of each other, because the
  // clipping cloud is in frame at every one of them:
  //   0.55 -> 3.72:1  fail
  //   0.60 -> 4.33:1  fail
  //   0.65 -> 5.07:1  pass  <- this, the lightest overlay with real margin
  //   0.70 -> 5.97:1  pass, photograph noticeably flatter
  //   0.80 -> 8.36:1  pass, photograph gone
  overlayOpacity: 0.65,
};
