import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};
import { Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { t } from '@/i18n';
import apiClient from '@/services/api.client';
import { toast } from 'sonner';

interface NotificationsTabProps {
    user: any;
    isFullPlan?: boolean;
}

interface NotificationPrefs {
    emailNotifications: boolean;
    weeklyReports: boolean;
    campaignCompleted: boolean;
    sourcingCompleted: boolean;
}

const defaultPrefs: NotificationPrefs = {
    emailNotifications: true,
    weeklyReports: true,
    campaignCompleted: true,
    sourcingCompleted: true,
};

export function NotificationsTab({ user, isFullPlan = false }: NotificationsTabProps) {
    const [prefs, setPrefs] = useState<NotificationPrefs>(defaultPrefs);
    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    // Load preferences from user profile (stored as JSON in notificationPreferences)
    useEffect(() => {
        if (user?.id) {
            loadPreferences();
        }
    }, [user?.id]);

    const loadPreferences = async () => {
        try {
            const { data } = await apiClient.get('/auth/me');
            if (data.notificationPreferences) {
                const parsed = typeof data.notificationPreferences === 'string'
                    ? JSON.parse(data.notificationPreferences)
                    : data.notificationPreferences;
                setPrefs({ ...defaultPrefs, ...parsed });
            }
        } catch {
            // Use defaults if loading fails
        }
    };

    const handleToggle = (key: keyof NotificationPrefs, value: boolean) => {
        setPrefs((prev) => ({ ...prev, [key]: value }));
        setIsDirty(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await apiClient.post('/auth/me/preferences', {
                preferences: [
                    { key: 'emailNotifications', value: prefs.emailNotifications },
                    { key: 'weeklyReports', value: prefs.weeklyReports },
                    { key: 'campaignCompleted', value: prefs.campaignCompleted },
                    { key: 'sourcingCompleted', value: prefs.sourcingCompleted },
                ],
            });
            toast.success(t.settings.notifications.saved);
            setIsDirty(false);
        } catch {
            toast.error(t.common.error);
        } finally {
            setIsSaving(false);
        }
    };

    const nt = t.settings.notifications;

    return (
        <motion.div variants={itemVariants} initial="hidden" animate="show" className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{nt.title}</CardTitle>
                    <CardDescription>{nt.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {isFullPlan && (
                        <>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Nowa oferta od dostawcy</Label>
                                    <p className="text-sm text-muted-foreground">Otrzymuj e-mail, gdy dostawca złoży nową ofertę lub alternatywę.</p>
                                </div>
                                <Switch
                                    checked={prefs.emailNotifications}
                                    onCheckedChange={(v) => handleToggle('emailNotifications', v)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Wiadomość od dostawcy</Label>
                                    <p className="text-sm text-muted-foreground">Otrzymuj e-mail, gdy dostawca wyśle Ci wiadomość w module komunikacji.</p>
                                </div>
                                <Switch
                                    checked={prefs.weeklyReports}
                                    onCheckedChange={(v) => handleToggle('weeklyReports', v)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Koniec akcji ofertowej</Label>
                                    <p className="text-sm text-muted-foreground">{nt.campaignCompletedDesc}</p>
                                </div>
                                <Switch
                                    checked={prefs.campaignCompleted}
                                    onCheckedChange={(v) => handleToggle('campaignCompleted', v)}
                                />
                            </div>
                        </>
                    )}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Kampania zakończona</Label>
                            <p className="text-sm text-muted-foreground">Otrzymuj e-mail, gdy wyszukiwanie AI zakończy się i dostawcy zostaną znalezieni.</p>
                        </div>
                        <Switch
                            checked={prefs.sourcingCompleted}
                            onCheckedChange={(v) => handleToggle('sourcingCompleted', v)}
                        />
                    </div>

                    {isDirty && (
                        <div className="flex justify-end pt-2 border-t">
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Zapisz
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
