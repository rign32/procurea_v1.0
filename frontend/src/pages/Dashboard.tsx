import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, FileText, Users, Sparkles, ArrowRight, Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { t, isEN } from '@/i18n';
import { motion } from 'framer-motion';
import { analytics, startHesitationTracker } from '@/lib/analytics';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: campaigns, isLoading } = useCampaigns();

  const activeCampaigns = campaigns?.filter((c) => c.status === 'RUNNING').length || 0;
  const totalCampaigns = campaigns?.length || 0;
  const totalSuppliers = campaigns?.reduce((sum, c) => sum + (c.suppliersFound || 0), 0) || 0;
  const pendingOffers = campaigns?.reduce((sum, c) => sum + (c.pendingOffers || 0), 0) || 0;
  const isFullPlan = user?.plan === 'full';
  const [showTopUpDialog, setShowTopUpDialog] = useState(false);
  const [trialPopupDismissed, setTrialPopupDismissed] = useState(() =>
    !!localStorage.getItem(`procurea_trial_dismissed_${user?.id}`)
  );
  const hasCredits = user?.plan === 'unlimited' || (user?.searchCredits ?? 0) > 0;

  const showTrialEndedPopup =
    user?.trialCreditsUsed === true &&
    (user?.searchCredits ?? 0) <= 0 &&
    user?.plan === 'research' &&
    !trialPopupDismissed;

  const handleCreateCampaign = () => {
    if (!hasCredits) { setShowTopUpDialog(true); return; }
    analytics.dashboardCtaClick();
    navigate('/campaigns/new');
  };

  useEffect(() => {
    analytics.dashboardView();
    return startHesitationTracker('dashboard', 30000);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {t.dashboard.welcome}, {user?.name || 'User'}!
        </h1>
        <p className="text-muted-foreground mt-1">
          {t.dashboard.subtitle}
        </p>
      </div>

      {/* Hero CTA Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-soft">
          <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between p-8 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">{t.dashboard.heroCta}</h2>
              </div>
              <p className="text-muted-foreground max-w-lg">
                {t.dashboard.heroDescription}
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline" className="bg-background/50">{t.dashboard.badge1}</Badge>
                <Badge variant="outline" className="bg-background/50">{t.dashboard.badge2}</Badge>
                <Badge variant="outline" className="bg-background/50">{t.dashboard.badge3}</Badge>
              </div>
            </div>
            <Button size="lg" onClick={handleCreateCampaign} className="md:ml-4 shadow-soft-xl hover:shadow-glow-primary transition-shadow">
              {t.dashboard.startButton}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <div className={`grid gap-4 md:grid-cols-2 ${isFullPlan ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
        {!campaigns && isLoading ? (
          Array.from({ length: isFullPlan ? 3 : 2 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12 mb-2 mt-1" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))
        ) : (
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            initial="hidden"
            animate="show"
            className={`col-span-1 md:col-span-2 ${isFullPlan ? 'lg:col-span-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'lg:col-span-2 grid gap-4 md:grid-cols-2'}`}
          >
            {[
              { title: t.dashboard.metrics.activeCampaigns, icon: Target, val: totalCampaigns, desc: `${activeCampaigns} ${t.dashboard.statsActive}`, link: '/campaigns' },
              { title: t.dashboard.metrics.activeSuppliers, icon: Users, val: totalSuppliers, desc: t.dashboard.statsFoundInAll, link: '/suppliers' },
              ...(isFullPlan ? [{ title: t.dashboard.metrics.pendingOffers, icon: FileText, val: pendingOffers, desc: t.dashboard.statsAwaiting, link: '/rfqs' }] : [])
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
              >
                <Card className={stat.link ? "cursor-pointer transition-all duration-300 hover:shadow-soft-xl hover:-translate-y-1" : ""} onClick={() => stat.link && navigate(stat.link)}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                    <stat.icon className="h-4 w-4 text-primary opacity-80" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold tracking-tight">{stat.val}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Recent Campaigns */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{t.dashboard.recentCampaigns}</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/campaigns')}>
              {t.dashboard.viewAll}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!campaigns && isLoading ? (
            <div className="space-y-2 pt-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-muted/20">
                  <Skeleton className="h-4 w-48 flex-shrink-0" />
                  <Skeleton className="h-3 w-20 ml-auto" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
              ))}
            </div>
          ) : !campaigns || campaigns.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>{t.dashboard.noCampaignsText}</p>
              <p className="text-sm mt-1">
                {t.dashboard.createFirstHint}
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={handleCreateCampaign}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t.campaigns.createNew}
              </Button>
            </div>
          ) : (
            <div className="space-y-1">
              {campaigns.slice(0, 5).map((campaign) => (
                <div
                  key={campaign.id}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  onClick={() => navigate(`/campaigns/${campaign.id}`)}
                >
                  <p className="text-sm font-medium flex-1 min-w-0 truncate">{campaign.name}</p>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {new Date(campaign.createdAt).toLocaleDateString(isEN ? 'en-US' : 'pl-PL')}
                  </span>
                  <span className="text-sm font-semibold shrink-0 w-28 text-right">
                    {campaign.suppliersFound || 0} {t.dashboard.suppliersCount}
                  </span>
                  <Badge
                    className="shrink-0 w-24 justify-center"
                    variant={
                      campaign.status === 'COMPLETED' ? 'default' :
                        campaign.status === 'ERROR' ? 'destructive' : 'secondary'
                    }
                  >
                    {t.campaigns.status[campaign.status.toLowerCase() as keyof typeof t.campaigns.status]}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top-up Dialog */}
      {/* Trial Ended Popup */}
      <Dialog open={showTrialEndedPopup} onOpenChange={() => {
        localStorage.setItem(`procurea_trial_dismissed_${user?.id}`, 'true');
        setTrialPopupDismissed(true);
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.settings.billing.trial.ended.title}</DialogTitle>
            <DialogDescription>{t.settings.billing.trial.ended.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              localStorage.setItem(`procurea_trial_dismissed_${user?.id}`, 'true');
              setTrialPopupDismissed(true);
            }}>
              {t.settings.billing.trial.ended.dismiss}
            </Button>
            <Button onClick={() => {
              localStorage.setItem(`procurea_trial_dismissed_${user?.id}`, 'true');
              setTrialPopupDismissed(true);
              useUIStore.getState().openBillingModal();
            }}>
              {t.settings.billing.trial.ended.action}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showTopUpDialog} onOpenChange={setShowTopUpDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.settings.billing.topUp.title}</DialogTitle>
            <DialogDescription>{t.settings.billing.topUp.description}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTopUpDialog(false)}>
              {t.common.cancel}
            </Button>
            <Button onClick={() => useUIStore.getState().openBillingModal()}>
              {t.settings.billing.topUp.action}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
