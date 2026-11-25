# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Consulting clients:** companies and agencies looking for a developer to take on a project as a consultant or freelancer. They want to know whether Alessandro can own their kind of project end to end, and how to reach him.
- **Tech hiring managers:** developers and team leads assessing a candidate for a role. They judge technical depth from the stack, the length and kind of experience, and real shipped projects.

Both audiences carry equal weight. Recruiters and HR are not a primary audience, but they benefit from the same clarity and the downloadable CV.

## Product Purpose

The personal professional site and CV of Alessandro Bonatti, a full-stack web developer based in Malmö, Sweden. It presents 25+ years of experience (employee 1999–2012, then his own agency for 13 years, a software development consultant in Malmö since October 2025) so that a visitor can judge his fit quickly and act on it.

Success means a visitor does either of two things, with equal value: **contacts him** (email, phone, LinkedIn, WhatsApp, Telegram) or **downloads the PDF CV** to share internally. He is open to both consulting assignments and permanent roles; the site must not favour one over the other.

## Positioning

A developer who has done the whole job: a quarter-century of web work spanning front end, back end, APIs, payment systems and server/deploy management, including running his own agency and building his own CMS (Seppia CMS) used by real client sites. He is now based in Sweden and working in the Swedish professional environment.

## Operating Context

- Visitors arrive from LinkedIn, applications, referrals or a shared link, often comparing several profiles; many skim before deciding to read.
- The PDF CV is generated from the same content as the site and is often forwarded inside a company, so it has to stand on its own.
- Past client projects mostly sit behind authentication; the site offers to walk through them in a dedicated meeting rather than exposing them.
- /seppia-cms/ is a standalone presentation page for Seppia CMS (English only, with its own look), linked from the Showcase.

## Capabilities and Constraints

- Static site: Astro, TypeScript, one React island (language switcher). All copy lives in YAML, one file per language.
- Languages: English (default, `/`), Italian (`/it/`), Swedish (`/sv/`). Swedish is written but **unreleased** on production until a native speaker reviews it. Every language must keep the same structure, and the build enforces it.
- Browser-language detection on `/`; an explicit language choice always wins.
- PDF CVs per language, text only (no photo), generated with Playwright after each build.
- No cookies, no analytics and no third-party scripts: fonts are self-hosted, and the only browser storage is the visitor's own language choice (localStorage). GDPR applies (EU/Sweden audience). Umami (cookieless analytics) is planned, not built.
- Hosting: Hostinger shared hosting (LiteSpeed, `.htaccess`); deployed by GitHub Actions + rsync. Staging (dev.alessandrobonatti.com) exists temporarily for the Swedish review.
- Planned, not built: a contact form, probably on a dedicated page.

## Brand Commitments

- Name: Alessandro Bonatti. Rune-style "AB" logo (`src/assets/logo.svg`), also used for the favicon.
- Voice: first person, warm and direct, with a Swedish touch ("Hej, I'm Alessandro", "Say hej!"). Key phrases are emphasised in the copy.
- Seppia CMS is a separate brand with its own identity on its own page; it is not restyled to match the main site.

## Evidence on Hand

- Showcase: real projects with role and stack, e.g. Manateca (manateca.com), Seppia CMS, plus client sites listed on /seppia-cms/ (Residence Pineta, Mediatori Associati Parma, Pi.Effe.Ci., Fism Parma, Magdata, Parmafluid, La Mamita, NIT, Medical Center, Salotti Musicali).
- Work history, education and languages in `src/content/site/*.yaml`; contact data in `src/data/profile.ts`.
- Hero illustration: `src/assets/portrait-design-patterns-bw.jpg`.
- **No testimonials, client logos, metrics or press exist.** Do not invent any.

## Product Principles

1. **Fit at a glance, depth on demand.** A skimming visitor grasps role, seniority, location and stack in seconds; a technical reader can go deeper without hunting.
2. **Two equal exits.** Contact and the CV download stay easy to find from anywhere, neither buried under the other.
3. **Neutral between consulting and employment.** Copy and structure present the experience, not a single hiring model.
4. **Show, don't claim.** Real projects, real stack and real history carry the argument. No invented proof.
5. **Every language is first-class.** Layouts must survive long Italian and Swedish strings, and the PDF must hold up on its own.

## Accessibility & Inclusion

Accessibility and usability are among the skills the site advertises, so the site itself must demonstrate them: semantic structure, keyboard access, sufficient contrast, reduced-motion respect and accessible PDFs (tagged, with bookmarks). No specific conformance level has been set; WCAG 2.2 AA is the working assumption.
