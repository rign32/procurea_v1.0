import { useState } from 'react';
import { Loader2, User as UserIcon, Building, MapPin, Bell, Users, CreditCard } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { PL } from '@/i18n/pl';
import { ProfileTab } from '@/components/settings/ProfileTab';
import { OrganizationTab } from '@/components/settings/OrganizationTab';
import { LocationsTab } from '@/components/settings/LocationsTab';
import { TeamTab } from '@/components/settings/TeamTab';
import { NotificationsTab } from '@/components/settings/NotificationsTab';
import { BillingTab } from '@/components/settings/BillingTab';

type TabKey = 'profile' | 'organization' | 'locations' | 'team' | 'notifications' | 'billing';

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const { user, isLoading } = useAuthStore();

  const isFullPlan = user?.plan === 'full';

  const tabs: { key: TabKey; label: string; icon: React.ReactNode }[] = [
    { key: 'profile', label: PL.settings.tabs.profile, icon: <UserIcon className="h-4 w-4" /> },
    ...(isFullPlan ? [
      { key: 'organization' as TabKey, label: PL.settings.tabs.organization, icon: <Building className="h-4 w-4" /> },
    ] : []),
    ...(isFullPlan ? [{ key: 'locations' as TabKey, label: PL.settings.tabs.locations, icon: <MapPin className="h-4 w-4" /> }] : []),
    { key: 'team', label: PL.settings.tabs.team, icon: <Users className="h-4 w-4" /> },
    { key: 'notifications', label: PL.settings.tabs.notifications, icon: <Bell className="h-4 w-4" /> },
    ...(isFullPlan ? [
      { key: 'billing' as TabKey, label: PL.settings.tabs.billing, icon: <CreditCard className="h-4 w-4" /> },
    ] : []),
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
        <h1 className="text-3xl font-bold">{PL.settings.title}</h1>
        <p className="text-muted-foreground mt-1">
          Zarządzaj swoim profilem i organizacją
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
              }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in zoom-in-95 duration-200">
        {activeTab === 'profile' && <ProfileTab user={user} />}
        {activeTab === 'organization' && <OrganizationTab user={user} />}
        {activeTab === 'locations' && <LocationsTab user={user} />}
        {activeTab === 'team' && <TeamTab user={user} />}
        {activeTab === 'notifications' && <NotificationsTab user={user} isFullPlan={isFullPlan} />}
        {activeTab === 'billing' && <BillingTab user={user} />}
      </div>
    </div>
  );
}

export default SettingsPage;
