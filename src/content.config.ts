/**
 * Content Collections configuration (Astro's typed content layer).
 *
 * A *collection* = a set of entries + a *loader* (where they come from) + a *schema* (their shape).
 * Here, the "site" collection has one entry per language: src/content/site/en.yaml → id "en", etc.
 *
 * At build time Astro validates every file against the Zod schema below: a missing field,
 * a wrong type or an unknown key makes the build fail with a precise error message.
 * The TypeScript type of the data is *inferred* from the schema: no hand-written interfaces, no `any`.
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { ICON_NAMES } from './icons';

/** Non-empty text. Inline markup (==hl==, **bold**, _serif_, [link](url)) is allowed where rendered with inline(). */
const text = z.string().trim().min(1);

const sectionTitle = text;

const skillTile = z.strictObject({
  name: text,
  /** Omit for skills without a logo: the design shows an outlined diamond instead. */
  icon: z.enum(ICON_NAMES).optional(),
});

const skillGroup = z.strictObject({
  letter: z.string().length(1),
  tags: text,
  title: text,
  description: text,
  tiles: z.array(skillTile).min(1),
});

const languageCard = z.strictObject({
  name: text,
  code: z.string().length(2),
  level: text,
  detail: text,
});

const job = z.strictObject({
  years: text,
  company: text,
  role: text,
  location: text,
  description: text,
});

const project = z.strictObject({
  context: text,
  name: text,
  // A full URL, or a path on this site such as /seppia-cms/ (works on staging and production alike).
  url: z.union([z.url(), z.string().regex(/^\/\S*$/, 'Expected a full URL or a site path starting with "/"')]),
  description: text,
  role: text,
  tech: z.array(text).min(1),
});

const educationItem = z.strictObject({
  years: text,
  title: text,
  detail: text,
  location: text,
  description: text,
});

const passion = z.strictObject({
  icon: z.enum(['mountain', 'dice', 'globe']),
  text: text,
});

export const siteSchema = z.strictObject({
  meta: z.strictObject({
    title: text,
    description: text,
  }),
  nav: z.strictObject({
    label: text,
    /** Accessible name of the mobile menu button. */
    menu: text,
    /** Accessible name of the floating "back to top" button. */
    toTop: text,
    about: text,
    skills: text,
    experience: text,
    showcase: text,
    passions: text,
    contact: text,
  }),
  languageSwitcher: z.strictObject({
    label: text,
  }),
  hero: z.strictObject({
    role: text,
    basedIn: text,
    location: text,
    /** Hero CV button on wide screens. */
    cvButton: text,
    /** Hero CV button on phones, and the accessible name of the floating CV button. */
    cvButtonShort: text,
    portraitAlt: text,
  }),
  about: z.strictObject({
    title: sectionTitle,
    lead: text,
    statement: text,
    paragraphs: z.array(text).min(1),
  }),
  skills: z.strictObject({
    title: sectionTitle,
    groups: z.array(skillGroup).length(3),
  }),
  languages: z.strictObject({
    title: sectionTitle,
    items: z.array(languageCard).min(1),
  }),
  experience: z.strictObject({
    title: sectionTitle,
    jobs: z.array(job).min(1),
  }),
  showcase: z.strictObject({
    title: sectionTitle,
    intro: text,
    labels: z.strictObject({ project: text, role: text, tech: text }),
    projects: z.array(project).min(1),
  }),
  education: z.strictObject({
    title: sectionTitle,
    items: z.array(educationItem).min(1),
    note: z.strictObject({ title: text, text: text }),
  }),
  passions: z.strictObject({
    title: sectionTitle,
    items: z.array(passion).length(3),
  }),
  contact: z.strictObject({
    title: text,
    location: text,
  }),
  /** Labels only used in the PDF / print layout. */
  print: z.strictObject({
    contacts: text,
    downloadNote: text,
  }),
});

export type SiteContent = z.infer<typeof siteSchema>;

const site = defineCollection({
  loader: glob({ pattern: '*.yaml', base: './src/content/site' }),
  schema: siteSchema,
});

export const collections = { site };
