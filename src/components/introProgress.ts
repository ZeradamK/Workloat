"use client";

import { motionValue } from "motion/react";

/**
 * Shared intro-act scroll progress (0 → 1). IntroZoom writes it; NavDock
 * reads it to choreograph its own reveal (dock blurs in as the phone's
 * screen fills the viewport; logo and buttons ease in once the phone is
 * fully gone). Starts at 0 so the nav chrome is hidden on first paint of
 * the home page.
 */
export const introT = motionValue(0);

/**
 * Hero act scroll progress (0 → 1). HeroShowcase writes it; NavDock reads
 * it to sync its surface color with the slide crossfade (dark on slide 1,
 * #EEEEEE on slide 2).
 */
export const heroT = motionValue(0);

/**
 * Feature-splits arrival (0 → 1 as that section scrolls into view).
 * NavDock reads it to dip back to the dark theme while the section is
 * on screen.
 */
export const splitsDark = motionValue(0);

/**
 * Markets-section arrival (0/1, animated in ~180ms). When it flips on,
 * the nav zips back to its light surface even though the splits override
 * is still upstream.
 */
export const marketsLight = motionValue(0);

/**
 * Product-page override (0/1, zipped in 50ms). Pages that pin the dock
 * dark (NavDock forceDark) write this while the dock overlaps a black
 * canvas, flipping the surface to #EEEEEE so it stays visible.
 */
export const productLight = motionValue(0);

/**
 * Slack-act overlap (0/1, zipped in ~180ms). SlackSection writes it while
 * its #EEEEEE box sits under the dock, so the surface goes dark instead
 * of blending into the box.
 */
export const slackDark = motionValue(0);
