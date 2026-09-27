# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing static site: plain HTML/CSS/JS files. `index.html` (booking/portfolio) and `graduation.html` (gallery + purchases). No build step. Booking form posts to a Google Apps Script endpoint (`GOOGLE_SCRIPT_URL` in index.html) that emails the owner on submit; keep this mechanism.

## Users

Primary booking audience: **local business owners** — real-estate agents and trades/small businesses such as plumbers — who need marketing photography and social content. Secondary audience: **parents and athletes** booking portraits, family, sports and graduation/event sessions.

## Product Purpose

A photographer's booking site. Its job is to convert visitors into session bookings and repeat commercial relationships — a real-estate agent, tradesperson, or parent should be able to see relevant work, understand cost, and request a date in under a minute. Proof gallery is delivered within 48 hours.

## Positioning

A single local photographer who covers both sides: polished commercial content for Washington businesses (real estate, trades, reels) and relaxed personal photography for families and athletes — with a hard 48-hour gallery turnaround as the operational claim. Proofs in 48 hours is a promised service standard, not a marketing-only number.

## Operating Context

- Sessions happen on location across Washington (Auburn/Seattle/Tri-Cities references in copy).
- Purchases flow through per-photo mailto requests on the graduation gallery and the booking form on index.
- Turnaround promise in copy: proofs within 48 hours; reply to booking requests within 24 hours.
- Contact channels: email cameronjschindler@gmail.com and Instagram @schindler_cameron (confirmed present in the original files). No phone number confirmed.

## Capabilities and Constraints

- Services (from booking form options): Portrait/Family; Sports; Events; Single Reel; Reels Bundle ($240); Real estate; Automotive; custom.
- Price starting points wired into the site: Portrait/Sports from $50, Family from $75, Events from $75, Single reel from $35, Reels bundle $240, Real estate from $80, Automotive from $65.
- Must NOT fabricate social proof: no invented ratings, no invented testimonials, no invented session counts. Only true facts may be shown (e.g. service availability, turnaround promise).
- Static files only; no server. Form delivery depends on the existing Apps Script URL placeholder.

## Brand Commitments

- Name: Cameron Schindler. Wordmark "Cameron Schindler." with accent dot.
- Designer reference explicitly liked by the owner: the cinematic, full-bleed-photo hero of denniswebber.com (film-credit typography, name-as-headline, restrained CTAs). This is the binding visual reference for the hero.
- Voice: direct, local, no-pressure ("no stiff poses, no assembly line"); honest about guarantee ("not thrilled? re-shoot or don't pay").

## Evidence on Hand

- Real photography across the workspace root and `graduation/` folder (hero, gallery, film strip, gallery set).
- Original index.html contains email cameronjschindler@gmail.com and instagram.com/schindler_cameron.
- Google Apps Script booking endpoint constant (unverified live status).
- Absent: real testimonials, real ratings, real client counts, real phone number, verified IG handle/live status. Do not fabricate these.

## Product Principles

- Lead with the work and the turnaround promise; let photography carry the page.
- Serve business buyers explicitly (real estate, trades, reels) without alienating family/athlete buyers.
- Keep zero-pressure, no-upsell tone; guarantees are part of the offer, not decoration.
- Nothing invented: remove or replace any social proof or metric that cannot be substantiated.
- Book in under a minute: contact channels and the form are always one tap/scroll away.

## Accessibility & Inclusion

No platform-specific requirement was established. Apply WCAG AA basics as default craft: readable contrast, labeled form fields, keyboard-focus states, reduced-motion support (keep an intentional alternative, not a global kill that removes function).