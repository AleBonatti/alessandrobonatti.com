/**
 * Language-independent data: contacts, links and third-party ids.
 * Anything a visitor reads as prose lives in src/content/site/<locale>.yaml instead.
 *
 * `satisfies` checks the object against the type while keeping the narrow literal types.
 */
interface Profile {
  name: { first: string; last: string };
  email: string;
  phones: ReadonlyArray<{ country: 'SE' | 'IT'; display: string; tel: string }>;
  github: { url: string; label: string };
  social: ReadonlyArray<{ id: 'linkedin' | 'github' | 'whatsapp' | 'telegram'; label: string; url: string }>;
  partnerUrl: string;
  iubenda: { siteId: number; cookiePolicyId: number };
  gaMeasurementId: string;
}

export const profile = {
  name: { first: 'Alessandro', last: 'Bonatti' },
  email: 'hej@alessandrobonatti.com',
  phones: [
    { country: 'SE', display: '+46 70-0331855', tel: '+46700331855' },
    { country: 'IT', display: '+39 340-6887826', tel: '+393406887826' },
  ],
  github: { url: 'https://github.com/AleBonatti', label: 'github.com/AleBonatti' },
  social: [
    { id: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/alessandro-bonatti/' },
    { id: 'github', label: 'GitHub', url: 'https://github.com/AleBonatti' },
    { id: 'whatsapp', label: 'WhatsApp', url: 'https://wa.me/+393406887826' },
    { id: 'telegram', label: 'Telegram', url: 'https://t.me/+393406887826' },
  ],
  partnerUrl: 'https://carmenghirardi.com',
  iubenda: {
    siteId: 3941646,
    cookiePolicyId: 72689656,
  },
  gaMeasurementId: 'G-496QCT7X7S',
} as const satisfies Profile;
