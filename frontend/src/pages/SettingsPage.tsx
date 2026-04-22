import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2, User as UserIcon, Building, MapPin, Bell, Users, CreditCard, ArrowUpRight, Receipt, Lock, ScrollText, Key, CalendarClock, Plug } from 'lucide-react';
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
import { IntegrationsTab } from '@/components/settings/IntegrationsTab';
import { analytics } from '@/lib/analytics';

type TabKey = 'profile' | 'organization' | 'locations' | 'team' | 'notifications' | 'history' | 'audit-log' | 'api-keys' | 'scheduled-reports' | 'integrations';

const VALID_TABS: TabKey[] = ['profile', 'organization', 'locations', 'team', 'notifications', 'history', 'audit-log', 'api-keys', 'scheduled-reports', 'integrations'];

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
    ...(isFullPlan ? [{ key: 'integrations' as TabKey, label: isEN ? 'Integrations' : 'Integracje', icon: <Plug className="h-4 w-4" /> }] : []),
  ];

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-ink" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-5 border-b border-rule">
        <div>
          <h1 className="text-[30px] leading-[1.1] tracking-[-0.03em] font-bold">{t.settings.title}</h1>
          <p className="mt-1.5 font-mono text-[12.5px] text-muted-ink tabular-nums">
            {t.settings.subtitle}
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-surface border border-rule rounded-[10px] p-2">
        <div className="flex flex-wrap gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => tab.locked ? handleTabChange('profile') : handleTabChange(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-medium transition-colors ${
                tab.locked
                  ? 'text-muted-ink/50 cursor-not-allowed'
                  : activeTab === tab.key
                    ? 'bg-brand text-white'
                    : 'text-muted-ink hover:text-ink hover:bg-surface-2'
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
              className="flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-medium transition-colors text-muted-ink hover:text-ink hover:bg-surface-2"
            >
              <CreditCard className="h-4 w-4" />
              {t.settings.tabs.billing}
              <ArrowUpRight className="h-3 w-3 opacity-50" />
            </button>
          )}
        </div>
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
        {activeTab === 'integrations' && isFullPlan && <IntegrationsTab />}
      </div>
    </div>
  );
}

export default SettingsPage;
