/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Search, Users, ExternalLink, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import campaignsService from '@/services/campaigns.service';
import { t, isEN } from '@/i18n';
import { getStatusConfig, getDisplayName, getDisplayRole } from '@/utils/contact-status';

type EmailFilter = 'all' | 'with_email' | 'without_email';

export function ContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter] = useState<string>('');
  const [emailFilter, setEmailFilter] = useState<EmailFilter>('with_email');

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['contacts', searchQuery, statusFilter],
    queryFn: () =>
      campaignsService.getAllContacts({
        search: searchQuery || undefined,
        emailStatus: statusFilter || undefined,
      }),
    staleTime: 30000,
  });

  const statusConfig = useMemo(() => getStatusConfig(), []);

  const filteredContacts = useMemo(() => {
    if (emailFilter === 'with_email') return contacts.filter((c: any) => c.email);
    if (emailFilter === 'without_email') return contacts.filter((c: any) => !c.email);
    return contacts;
  }, [contacts, emailFilter]);

  const withEmailCount = contacts.filter((c: any) => c.email).length;
  const withoutEmailCount = contacts.filter((c: any) => !c.email).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.campaigns.detail.contactsTitle}</h1>
          <p className="text-muted-foreground mt-1">{t.campaigns.detail.contactsSubtitle}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Badge className="bg-green-100 text-green-800">{withEmailCount} {t.campaigns.detail.filterWithEmail}</Badge>
          <Badge variant="secondary">{withoutEmailCount} {t.campaigns.detail.filterWithout}</Badge>
          <Badge variant="outline">{contacts.length} {t.campaigns.detail.filterAll}</Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex gap-3 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={isEN ? 'Search by name, email or company...' : 'Szukaj po nazwisku, email lub firmie...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={emailFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEmailFilter('all')}
              >
                {t.campaigns.detail.filterAll}
              </Button>
              <Button
                variant={emailFilter === 'with_email' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEmailFilter('with_email')}
                className={emailFilter === 'with_email' ? 'bg-green-600' : ''}
              >
                <Mail className="mr-1 h-3 w-3" />
                {t.campaigns.detail.filterWithEmail}
              </Button>
              <Button
                variant={emailFilter === 'without_email' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEmailFilter('without_email')}
              >
                {t.campaigns.detail.filterWithout}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contacts Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredContacts.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-medium">{isEN ? 'No contacts yet' : 'Brak kontaktów'}</h3>
              <p className="mt-2 text-muted-foreground">
                {isEN
                  ? 'Contacts will appear here after accepting suppliers in a campaign.'
                  : 'Kontakty pojawią się tutaj po zaakceptowaniu dostawców w kampanii.'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left py-3 px-4 font-medium">{t.campaigns.detail.colName}</th>
                    <th className="text-left py-3 px-4 font-medium">{t.campaigns.detail.colRole}</th>
                    <th className="text-left py-3 px-4 font-medium">Email</th>
                    <th className="text-left py-3 px-4 font-medium">{t.campaigns.detail.colCompany}</th>
                    <th className="text-left py-3 px-4 font-medium">{t.campaigns.detail.colCampaign}</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">{t.campaigns.detail.colDate}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact: any) => {
                    const displayName = getDisplayName(contact);
                    const displayRole = getDisplayRole(contact);
                    const status = statusConfig[contact.emailStatus] || { label: contact.emailStatus || '—', className: 'bg-gray-100 text-gray-600' };

                    return (
                      <tr
                        key={contact.id}
                        className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <span className={contact.name ? 'font-medium' : 'text-muted-foreground'}>{displayName}</span>
                            {contact.linkedinUrl && (
                              <a
                                href={contact.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                          {contact.seniority && (
                            <span className="text-xs text-muted-foreground capitalize">{contact.seniority}</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{displayRole}</td>
                        <td className="py-3 px-4">
                          {contact.email ? (
                            <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline">
                              {contact.email}
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <span>{contact.supplier?.name || '—'}</span>
                            {contact.supplier?.website && (
                              <a
                                href={contact.supplier.website.startsWith('http') ? contact.supplier.website : `https://${contact.supplier.website}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-xs text-blue-500 hover:text-blue-700"
                              >
                                <ExternalLink className="inline h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {contact.supplier?.campaign?.name || '—'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={status.className}>{status.label}</Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {contact.enrichedAt
                            ? new Date(contact.enrichedAt).toLocaleDateString(isEN ? 'en-US' : 'pl-PL')
                            : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default ContactsPage;
