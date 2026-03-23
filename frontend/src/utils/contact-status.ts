import { isEN } from '@/i18n';

export const getStatusConfig = (): Record<string, { label: string; className: string }> => ({
  verified:        { label: isEN ? 'Verified' : 'Zweryfikowany', className: 'bg-green-100 text-green-800 border-green-200' },
  extrapolated:    { label: isEN ? 'Extrapolated' : 'Ekstrapolowany', className: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  website_scraped: { label: isEN ? 'From website' : 'Ze strony', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  web_searched:    { label: isEN ? 'Web search' : 'Z wyszukiwania', className: 'bg-purple-100 text-purple-800 border-purple-200' },
  guessed:         { label: isEN ? 'Generic' : 'Ogólny', className: 'bg-amber-100 text-amber-800 border-amber-200' },
  unverified:      { label: isEN ? 'Unverified' : 'Niezweryfikowany', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  unreachable:     { label: isEN ? 'Unreachable' : 'Nieosiągalny', className: 'bg-gray-100 text-gray-500' },
  not_found:       { label: isEN ? 'Not found' : 'Nie znaleziono', className: 'bg-orange-100 text-orange-600' },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getDisplayName = (contact: any): string => {
  if (contact.name) return contact.name;
  // Only use email prefix as name for personal contacts (verified/extrapolated/unverified from Apollo)
  if (contact.email && ['verified', 'extrapolated', 'unverified'].includes(contact.emailStatus)) {
    return contact.email.split('@')[0].replace(/[._-]/g, ' ');
  }
  // For generic/scraped emails — don't fake a name from email prefix
  return '—';
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getDisplayRole = (contact: any): string =>
  contact.role
  || (['website_scraped', 'web_searched', 'guessed'].includes(contact.emailStatus)
    ? (isEN ? 'General contact' : 'Kontakt ogólny')
    : '—');
