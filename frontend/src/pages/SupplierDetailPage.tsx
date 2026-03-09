import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronRight,
  Globe,
  MapPin,
  Brain,
  Users,
  Award,
  Mail,
  Phone,
  UserCircle,
  ExternalLink,
  Loader2,
  ShieldAlert,
} from 'lucide-react';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/services/api.client';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BlacklistDialog } from '@/components/suppliers/BlacklistDialog';
import { useSupplier } from '@/hooks/useSuppliers';
import { useAuthStore } from '@/stores/auth.store';
import { PL } from '@/i18n/pl';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};
import type { Contact } from '@/types/supplier.types';

export function SupplierDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isBlacklistDialogOpen, setIsBlacklistDialogOpen] = useState(false);
  const { data: supplier, isLoading, error } = useSupplier(id || '');
  const { user } = useAuthStore();
  const isFullPlan = user?.plan === 'full';

  const blacklistMutation = useMutation({
    mutationFn: async (reason: string) => {
      const res = await apiClient.post(`/suppliers/${id}/blacklist`, { reason });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['supplier', id] });
      toast.success('Dostawca dodany do Blacklisty');
      setIsBlacklistDialogOpen(false);
      navigate('/suppliers');
    },
    onError: () => {
      toast.error('Nie udało się dodać do Blacklisty');
    }
  });

  const scorePercent = supplier?.analysisScore
    ? Math.round(supplier.analysisScore * 10)
    : 0;

  const getScoreVariant = (
    score: number
  ): 'default' | 'secondary' | 'destructive' => {
    if (score >= 80) return 'default';
    if (score >= 60) return 'secondary';
    return 'destructive';
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">
            {error ? PL.errors.generic : PL.errors.notFound}
          </p>
          <Button onClick={() => navigate('/suppliers')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {PL.common.back}
          </Button>
        </div>
      </div>
    );
  }

  const certificates = supplier.certificates
    ? supplier.certificates.split(',').map((c) => c.trim()).filter(Boolean)
    : [];

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/suppliers');
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-[-10px]">
        <button onClick={() => navigate('/suppliers')} className="hover:text-foreground transition-colors">{PL.suppliers.title}</button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium line-clamp-1">{supplier.name}</span>
      </div>

      {/* Back Button + Header */}
      <motion.div variants={itemVariants}>
        <Button
          variant="ghost"
          onClick={handleBack}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {PL.common.back}
        </Button>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">
              {supplier.name || 'Unknown'}
            </h1>
            <div className="flex items-center gap-3 text-muted-foreground mt-2">
              {supplier.country && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {supplier.country}
                  {supplier.city && ` / ${supplier.city}`}
                </span>
              )}
              {supplier.website && (
                <a
                  href={supplier.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                >
                  <Globe className="h-4 w-4" />
                  {supplier.website}
                </a>
              )}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <Button
              variant="destructive"
              className="px-3"
              onClick={() => setIsBlacklistDialogOpen(true)}
            >
              <ShieldAlert className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Zgłoś dostawcę</span>
            </Button>
            <Badge
              variant={getScoreVariant(scorePercent)}
              className="text-lg px-4 py-1 font-semibold"
            >
              {scorePercent}%
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  {PL.suppliers.detail.overview}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      {PL.suppliers.filters.country}
                    </dt>
                    <dd className="text-sm mt-1">
                      {supplier.country || PL.common.noData}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Miasto
                    </dt>
                    <dd className="text-sm mt-1">
                      {supplier.city || PL.common.noData}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      {PL.suppliers.detail.specialization}
                    </dt>
                    <dd className="text-sm mt-1">
                      {supplier.specialization || PL.common.noData}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">
                      Strona WWW
                    </dt>
                    <dd className="text-sm mt-1">
                      {supplier.website ? (
                        <a
                          href={supplier.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {supplier.website}
                        </a>
                      ) : (
                        PL.common.noData
                      )}
                    </dd>
                  </div>
                  {supplier.employeeCount && supplier.employeeCount !== 'N/A' && (
                    <div>
                      <dt className="text-sm font-medium text-muted-foreground">
                        {PL.suppliers.detail.companySize}
                      </dt>
                      <dd className="text-sm mt-1">
                        {supplier.employeeCount} {PL.suppliers.detail.employees}
                      </dd>
                    </div>
                  )}
                </dl>
              </CardContent>
            </Card>
          </motion.div>

          {/* AI Analysis Card */}
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  {PL.suppliers.detail.aiInsights}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold">{scorePercent}%</div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {PL.suppliers.detail.overall}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="h-3 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${scorePercent >= 80
                          ? 'bg-green-500'
                          : scorePercent >= 60
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                          }`}
                        style={{ width: `${scorePercent}%` }}
                      />
                    </div>
                  </div>
                </div>
                {supplier.analysisReason && (
                  <div className="rounded-lg bg-muted/50 p-4">
                    <p className="text-sm font-medium mb-1">
                      {PL.suppliers.detail.recommendation}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {supplier.analysisReason}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Contacts Card — only visible for full plan */}
          {isFullPlan && (
          <motion.div variants={itemVariants}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  {PL.suppliers.detail.contacts}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {supplier.contacts && supplier.contacts.length > 0 ? (
                  <div className="space-y-4">
                    {supplier.contacts.map((contact: Contact) => (
                      <div
                        key={contact.id}
                        className="flex items-start gap-4 rounded-lg border p-4"
                      >
                        <UserCircle className="h-10 w-10 text-muted-foreground flex-shrink-0" />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">
                              {contact.name || 'Brak imienia'}
                            </span>
                            {contact.isDecisionMaker && (
                              <Badge variant="default" className="text-xs">
                                {PL.suppliers.detail.primary}
                              </Badge>
                            )}
                          </div>
                          {contact.role && (
                            <p className="text-sm text-muted-foreground">
                              {contact.role}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm">
                            {contact.email && (
                              <a
                                href={`mailto:${contact.email}`}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <Mail className="h-3 w-3" />
                                {contact.email}
                              </a>
                            )}
                            {contact.phone && (
                              <a
                                href={`tel:${contact.phone}`}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                <Phone className="h-3 w-3" />
                                {contact.phone}
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : supplier.contactEmails ? (
                  <div className="space-y-2">
                    {supplier.contactEmails
                      .split(',')
                      .filter((e) => e.trim())
                      .map((email, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a
                            href={`mailto:${email.trim()}`}
                            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {email.trim()}
                          </a>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {PL.common.noData}
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
          )}
        </div>

        {/* Right Column - Sidebar */}
        <motion.div variants={itemVariants} className="space-y-6">
          {/* Certificates Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                {PL.suppliers.detail.certificates}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {certificates.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {certificates.map((cert, index) => (
                    <Badge key={index} variant="outline">
                      {cert}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {PL.common.noData}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{PL.suppliers.detail.scoring}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {PL.suppliers.detail.overall}
                </span>
                <Badge
                  variant={getScoreVariant(scorePercent)}
                  className="font-semibold"
                >
                  {scorePercent}%
                </Badge>
              </div>
              {supplier.employeeCount && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {PL.suppliers.detail.companySize}
                  </span>
                  <span>
                    {supplier.employeeCount} {PL.suppliers.detail.employees}
                  </span>
                </div>
              )}
              {isFullPlan && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {PL.suppliers.detail.contacts}
                  </span>
                  <span>
                    {supplier.contacts?.length ||
                      (supplier.contactEmails
                        ? supplier.contactEmails.split(',').filter((e) => e.trim())
                          .length
                        : 0)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {PL.suppliers.detail.certificates}
                </span>
                <span>{certificates.length}</span>
              </div>
            </CardContent>
          </Card>

        </motion.div>
      </div>

      {supplier && (
        <BlacklistDialog
          isOpen={isBlacklistDialogOpen}
          onClose={() => setIsBlacklistDialogOpen(false)}
          supplierName={supplier.name || 'Nieznany'}
          isSubmitting={blacklistMutation.isPending}
          onConfirm={(reason) => blacklistMutation.mutate(reason)}
        />
      )}
    </motion.div>
  );
}

export default SupplierDetailPage;
