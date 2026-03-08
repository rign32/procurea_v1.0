import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, FileText, Users, Sparkles, ArrowRight, Plus } from 'lucide-react';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useAuthStore } from '@/stores/auth.store';
import { PL } from '@/i18n/pl';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { data: campaigns, isLoading } = useCampaigns();

  const activeCampaigns = campaigns?.filter((c) => c.status === 'RUNNING').length || 0;
  const totalCampaigns = campaigns?.length || 0;
  const totalSuppliers = campaigns?.reduce((sum, c) => sum + (c.suppliersFound || 0), 0) || 0;
  const pendingOffers = campaigns?.reduce((sum, c) => sum + (c.pendingOffers || 0), 0) || 0;
  const isFullPlan = user?.plan === 'full';

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {PL.dashboard.welcome}, {user?.name || 'User'}!
        </h1>
        <p className="text-muted-foreground mt-1">
          AI-Powered Sourcing - inteligentne wyszukiwanie producentów
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
                <h2 className="text-2xl font-bold">Uruchom wyszukiwanie AI</h2>
              </div>
              <p className="text-muted-foreground max-w-lg">
                Wieloetapowy agent AI przeszuka internet, znajdzie producentów,
                oceni ich możliwości i zbierze dane kontaktowe. Cały proces trwa kilka minut.
              </p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Badge variant="outline" className="bg-background/50">5 etapów AI</Badge>
                <Badge variant="outline" className="bg-background/50">Tylko producenci</Badge>
                <Badge variant="outline" className="bg-background/50">Automatyczne kontakty</Badge>
              </div>
            </div>
            <Button size="lg" onClick={() => navigate('/campaigns/new')} className="md:ml-4 shadow-soft-xl hover:shadow-glow-primary transition-shadow">
              Rozpocznij
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <div className={`grid gap-4 md:grid-cols-2 ${isFullPlan ? 'lg:grid-cols-3' : 'lg:grid-cols-2'}`}>
        {isLoading ? (
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
              { title: PL.dashboard.metrics.activeCampaigns, icon: Target, val: totalCampaigns, desc: `${activeCampaigns} aktywnych`, link: '/campaigns' },
              { title: PL.dashboard.metrics.activeSuppliers, icon: Users, val: totalSuppliers, desc: 'znalezionych we wszystkich', link: '/suppliers' },
              ...(isFullPlan ? [{ title: PL.dashboard.metrics.pendingOffers, icon: FileText, val: pendingOffers, desc: 'oczekujących na odpowiedź', link: '/rfqs' }] : [])
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
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Ostatnie kampanie</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/campaigns')}>
                Zobacz wszystkie
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4 pt-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg border border-transparent bg-muted/20">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !campaigns || campaigns.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Brak kampanii</p>
                <p className="text-sm mt-1">
                  Utwórz pierwszą kampanię aby rozpocząć wyszukiwanie
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate('/campaigns/new')}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {PL.campaigns.createNew}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {campaigns.slice(0, 5).map((campaign) => (
                  <div
                    key={campaign.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/campaigns/${campaign.id}`)}
                  >
                    <div>
                      <p className="text-sm font-medium">{campaign.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(campaign.createdAt).toLocaleDateString('pl-PL')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">
                        {campaign.suppliersFound || 0} dostawców
                      </span>
                      <Badge
                        variant={
                          campaign.status === 'COMPLETED' ? 'default' :
                            campaign.status === 'ERROR' ? 'destructive' : 'secondary'
                        }
                      >
                        {PL.campaigns.status[campaign.status.toLowerCase() as keyof typeof PL.campaigns.status]}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* How it works */}
        <Card>
          <CardHeader>
            <CardTitle>Jak działa AI Sourcing?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Strategia', desc: 'AI generuje inteligentne zapytania wyszukiwania w wielu językach', color: 'text-blue-600 bg-blue-100' },
                { step: '2', title: 'Skanowanie', desc: 'Przeszukiwanie internetu i identyfikacja potencjalnych producentów', color: 'text-yellow-600 bg-yellow-100' },
                { step: '3', title: 'Analiza', desc: 'Ocena możliwości produkcyjnych i dopasowania do wymagań', color: 'text-purple-600 bg-purple-100' },
                { step: '4', title: 'Wzbogacanie', desc: 'Szukanie danych kontaktowych i weryfikacja informacji', color: 'text-green-600 bg-green-100' },
                { step: '5', title: 'Weryfikacja', desc: 'Końcowa walidacja danych i tworzenie profili dostawców', color: 'text-red-600 bg-red-100' },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${item.color}`}>
                    {item.step}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
