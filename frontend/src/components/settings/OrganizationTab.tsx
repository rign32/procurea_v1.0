import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Building, Loader2, Save, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { t } from '@/i18n';
import organizationService from '@/services/organization.service';
import type { UpdateOrganizationDto, Organization } from '@/services/organization.service';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

interface OrganizationTabProps {
    user: any; // User has organizationId
}

export function OrganizationTab({ user }: OrganizationTabProps) {
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<UpdateOrganizationDto>();
    const footerEnabled = watch('footerEnabled');
    const watchedValues = watch();

    useEffect(() => {
        if (user?.organizationId) {
            loadOrganization(user.organizationId);
        }
    }, [user?.organizationId]);

    const loadOrganization = async (id: string) => {
        try {
            setIsLoading(true);
            const data = await organizationService.get(id);
            setOrganization(data);

            // Set form default values
            setValue('name', data.name);
            setValue('baseCurrency', data.baseCurrency || 'PLN');
            setValue('footerEnabled', data.footerEnabled);
            setValue('footerFirstName', data.footerFirstName || user?.name?.split(' ')[0] || '');
            setValue('footerLastName', data.footerLastName || user?.name?.split(' ').slice(1).join(' ') || '');
            setValue('footerCompany', data.footerCompany || user?.companyName || '');
            setValue('footerPosition', data.footerPosition || user?.jobTitle || '');
            setValue('footerEmail', data.footerEmail || user?.email || '');
            setValue('footerPhone', data.footerPhone || user?.phone || '');
        } catch (error) {
            console.error('Failed to load organization:', error);
            toast.error(t.common.error);
        } finally {
            setIsLoading(false);
        }
    };

    const onSubmit = async (data: UpdateOrganizationDto) => {
        if (!organization) return;

        setIsSaving(true);
        try {
            const updated = await organizationService.update(organization.id, data);
            setOrganization(updated);
            toast.success(t.common.success);
        } catch (error) {
            console.error('Failed to update organization:', error);
            toast.error(t.common.error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user?.organizationId) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    {t.settings.organization.title} - {t.common.noData}
                </CardContent>
            </Card>
        );
    }

    if (isLoading) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
        >
            <Card>
                <CardHeader>
                    <CardTitle>{t.settings.organization.title}</CardTitle>
                    <CardDescription>{t.settings.organization.subtitle}</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="orgName">{t.settings.organization.name}</Label>
                                <Input
                                    id="orgName"
                                    {...register('name')}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>{t.settings.organization.domain}</Label>
                                <div className="flex h-10 w-full rounded-md border border-input bg-muted px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                                    {organization?.domain || '—'}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div className="space-y-2">
                                <Label htmlFor="baseCurrency">{t.settings.organization.baseCurrency}</Label>
                                <select
                                    id="baseCurrency"
                                    {...register('baseCurrency')}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                >
                                    <option value="PLN">{t.settings.organization.currencies.PLN}</option>
                                    <option value="EUR">{t.settings.organization.currencies.EUR}</option>
                                    <option value="USD">{t.settings.organization.currencies.USD}</option>
                                    <option value="GBP">{t.settings.organization.currencies.GBP}</option>
                                    <option value="CHF">{t.settings.organization.currencies.CHF}</option>
                                    <option value="CNY">{t.settings.organization.currencies.CNY}</option>
                                </select>
                                <p className="text-xs text-muted-foreground">
                                    {t.settings.organization.currencyHint}
                                </p>
                            </div>
                        </div>

                        <div className="border-t pt-6 mt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium">{t.footer.title}</h3>
                                <div className="flex items-center space-x-2">
                                    <Switch
                                        id="footer-enabled"
                                        checked={footerEnabled}
                                        onCheckedChange={(checked) => setValue('footerEnabled', checked)}
                                    />
                                    <Label htmlFor="footer-enabled">{t.footer.enabled}</Label>
                                </div>
                            </div>

                            {footerEnabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>{t.footer.firstName}</Label>
                                                <Input {...register('footerFirstName')} placeholder={t.settings.organization.footerFirstNamePlaceholder} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>{t.footer.lastName}</Label>
                                                <Input {...register('footerLastName')} placeholder={t.settings.organization.footerLastNamePlaceholder} />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label>{t.footer.company}</Label>
                                            <Input {...register('footerCompany')} placeholder={t.settings.organization.footerCompanyPlaceholder} />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>{t.footer.position}</Label>
                                            <Input {...register('footerPosition')} placeholder={t.settings.organization.footerPositionPlaceholder} />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label>{t.footer.email}</Label>
                                                <Input {...register('footerEmail')} placeholder={t.settings.organization.footerEmailPlaceholder} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>{t.footer.phone}</Label>
                                                <Input {...register('footerPhone')} placeholder={t.settings.organization.footerPhonePlaceholder} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Label className="flex items-center gap-2">
                                            <Eye className="h-4 w-4" /> {t.footer.preview}
                                        </Label>
                                        <div className="border rounded-md p-6 bg-white dark:bg-zinc-900 text-sm font-sans shadow-sm h-full flex flex-col justify-center">
                                            <p className="text-muted-foreground mb-4 italic">{t.settings.organization.footerPreviewMessage}</p>
                                            <div className="mt-auto border-t pt-4">
                                                <p className="font-bold text-base text-foreground">
                                                    {watchedValues.footerFirstName || t.settings.organization.footerPreviewFirstName} {watchedValues.footerLastName || t.settings.organization.footerPreviewLastName}
                                                </p>
                                                <p className="text-foreground/80 font-medium">{watchedValues.footerPosition || t.settings.organization.footerPreviewPosition}</p>
                                                <p className="font-semibold text-primary mt-1">{watchedValues.footerCompany || t.settings.organization.footerPreviewCompany}</p>
                                                <div className="mt-2 text-xs text-muted-foreground space-y-0.5">
                                                    {(watchedValues.footerEmail) && <p>E: {watchedValues.footerEmail}</p>}
                                                    {(watchedValues.footerPhone) && <p>T: {watchedValues.footerPhone}</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t.common.save}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Todo: Locations component will go here or be a separate tab */}
        </motion.div>
    );
}
