/**
 * Blocked generic/free email domains.
 * Only professional (corporate) email addresses are allowed for registration.
 */
const BLOCKED_EMAIL_DOMAINS: ReadonlySet<string> = new Set([
  // Global providers
  'gmail.com',
  'googlemail.com',
  'yahoo.com',
  'yahoo.co.uk',
  'yahoo.fr',
  'yahoo.de',
  'yahoo.it',
  'yahoo.es',
  'yahoo.co.jp',
  'hotmail.com',
  'hotmail.co.uk',
  'hotmail.fr',
  'hotmail.de',
  'outlook.com',
  'outlook.fr',
  'outlook.de',
  'live.com',
  'live.co.uk',
  'msn.com',
  'aol.com',
  'icloud.com',
  'me.com',
  'mac.com',
  'mail.com',
  'email.com',
  'protonmail.com',
  'proton.me',
  'pm.me',
  'zoho.com',
  'zohomail.com',
  'yandex.com',
  'yandex.ru',
  'gmx.com',
  'gmx.de',
  'gmx.net',
  'gmx.at',
  'tutanota.com',
  'tuta.io',
  'fastmail.com',
  'hushmail.com',
  'inbox.com',
  'mail.ru',
  'rambler.ru',
  'seznam.cz',
  'web.de',
  'freenet.de',
  't-online.de',

  // Polish providers
  'wp.pl',
  'onet.pl',
  'o2.pl',
  'interia.pl',
  'op.pl',
  'poczta.fm',
  'gazeta.pl',
  'tlen.pl',
  'go2.pl',
  'vp.pl',
  'autograf.pl',
  'buziaczek.pl',
  'poczta.onet.pl',
]);

/**
 * Check if an email address uses a blocked (generic/free) domain.
 */
export function isBlockedEmailDomain(email: string): boolean {
  const domain = email.toLowerCase().split('@')[1];
  if (!domain) return true; // Invalid email
  return BLOCKED_EMAIL_DOMAINS.has(domain);
}
