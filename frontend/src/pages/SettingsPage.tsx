import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, User as UserIcon, Building, MapPin, Bell, Users, CreditCard, ArrowUpRight, Receipt, Lock, ScrollText, Key, CalendarClock } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { t, isEN } from '@/i18n';
import { ProfileTab } from '@/components/settings/ProfileTab';
import { OrganizationTab } from '@/components/settings/OrganizationTab';
import { LocationsTab } from '@/components/settings/LocationsTab';
import { TeamTab } from '@/components/settings/TeamTab';
import { NotificationsTab } from '@/components/settings/NotificationsTab';
import { TransactionHistoryTab } from '@/components/settings/TransactionHistoryTab';
import { AuditLogTab } from '@/components/settings/AuditLogTab';
import { ApiKeysTab } from '@/components/settings/ApiKeysTab';
import { ScheduledReportsTab } from '@/components/settings/ScheduledReportsTab';
import { analytics } from '@/lib/analytics';

type TabKey = 'profile' | 'organization' | 'locations' | 'team' | 'notifications' | 'history' | 'audit-log' | 'api-keys' | 'scheduled-reports';

const VALID_TABS: TabKey[] = ['profile', 'organization', 'locations', 'team', 'notifications', 'history', 'audit-log', 'api-keys', 'scheduled-reports'];

export function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<TabKey>(() => {
    const tab = searchParams.get('tab');
    if (tab && VALID_TABS.includes(tab as TabKey)) return tab as TabKey;
    return 'profile';
  });

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    setSearchParams(key === 'profile' ? {} : { tab: key }, { replace: true });
  };

  useEffect(() => { analytics.settingsView(); }, []);
  const { user, isLoading } = useAuthStore();

  const isFullPlan = user?.plan === 'full';
  const isTrialWithCredits = user?.plan === 'research' && (user?.searchCredits ?? 0) > 0;

  const tabs: { key: TabKey; label: string; icon: React.ReactNode; locked?: boolean }[] = [
    { key: 'profile', label: t.settings.tabs.profile, icon: <UserIcon className="h-4 w-4" /> },
    { key: 'organization', label: t.settings.tabs.organization, icon: <Building className="h-4 w-4" />, locked: !isFullPlan },
    { key: 'locations', label: t.settings.tabs.locations, icon: <MapPin className="h-4 w-4" />, locked: !isFullPlan },
    { key: 'team', label: t.settings.tabs.team, icon: <Users className="h-4 w-4" /> },
    { key: 'notifications', label: t.settings.tabs.notifications, icon: <Bell className="h-4 w-4" /> },
    ...(!isTrialWithCredits ? [{ key: 'history' as TabKey, label: isEN ? 'History' : 'Historia', icon: <Receipt className="h-4 w-4" /> }] : []),
    ...(isFullPlan && user?.role === 'ADMIN' ? [{ key: 'audit-log' as TabKey, label: isEN ? 'Audit Log' : 'Dziennik audytu', icon: <ScrollText className="h-4 w-4" /> }] : []),
    ...(isFullPlan ? [{ key: 'api-keys' as TabKey, label: isEN ? 'API Keys' : 'Klucze API', icon: <Key className="h-4 w-4" /> }] : []),
    ...(isFullPlan ? [{ key: 'scheduled-reports' as TabKey, label: isEN ? 'Reports' : 'Raporty', icon: <CalendarClock className="h-4 w-4" /> }] : []),
  ];

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t.settings.title}</h1>
        <p className="text-muted-foreground mt-1">
          {t.settings.subtitle}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => tab.locked ? handleTabChange('profile') : handleTabChange(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab.locked
                ? 'text-muted-foreground/50 cursor-not-allowed'
                : activeTab === tab.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            title={tab.locked ? (isEN ? 'Available on Full plan' : 'Dostępne w planie Full') : undefined}
          >
            {tab.locked ? <Lock className="h-3.5 w-3.5" /> : tab.icon}
            {tab.label}
          </button>
        ))}
        {/* Plan button — opens popup, hidden for trial users with credits */}
        {!isTrialWithCredits && (
          <button
            onClick={() => useUIStore.getState().openBillingModal()}
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors text-muted-foreground hover:text-foreground"
          >
            <CreditCard className="h-4 w-4" />
            {t.settings.tabs.billing}
            <ArrowUpRight className="h-3 w-3 opacity-50" />
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in zoom-in-95 duration-200">
        {activeTab === 'profile' && <ProfileTab user={user} />}
        {activeTab === 'organization' && (isFullPlan ? <OrganizationTab user={user} /> : null)}
        {activeTab === 'locations' && (isFullPlan ? <LocationsTab user={user} /> : null)}
        {activeTab === 'team' && <TeamTab user={user} />}
        {activeTab === 'notifications' && <NotificationsTab user={user} isFullPlan={isFullPlan} />}
        {activeTab === 'history' && <TransactionHistoryTab user={user} />}
        {activeTab === 'audit-log' && <AuditLogTab user={user} />}
        {activeTab === 'api-keys' && isFullPlan && <ApiKeysTab />}
        {activeTab === 'scheduled-reports' && isFullPlan && <ScheduledReportsTab />}
      </div>
    </div>
  );
}

export default SettingsPage;
