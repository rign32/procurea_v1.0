import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};
import { Users, Loader2, User as UserIcon, Share2, LogOut, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { t } from '@/i18n';
import organizationService from '@/services/organization.service';
import type { TeamMember } from '@/services/organization.service';
import type { User } from '@/types/campaign.types';
import { toast } from 'sonner';

interface TeamTabProps {
    user: User;
}

export function TeamTab({ user }: TeamTabProps) {
    const [members, setMembers] = useState<TeamMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<string | null>(null);

    const loadMembers = async () => {
        if (!user?.organizationId) return;
        try {
            setIsLoading(true);
            const data = await organizationService.getSharingPreferences(user.organizationId);
            setMembers(data);
        } catch (error) {
            console.error('Failed to load members:', error);
            toast.error(t.common.error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMembers();
    }, [user?.organizationId]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleToggleSharing = async (memberId: string, enabled: boolean) => {
        if (!user?.organizationId) return;
        setTogglingId(memberId);
        try {
            await organizationService.updateSharing(user.organizationId, memberId, enabled);
            setMembers(prev => prev.map(m =>
                m.id === memberId ? { ...m, iShareWithThem: enabled } : m
            ));
            toast.success(enabled ? t.settings.team.sharingEnabled : t.settings.team.sharingDisabled);
        } catch (error: unknown) {
            toast.error((error as { message?: string })?.message || t.common.error);
        } finally {
            setTogglingId(null);
        }
    };

    const handleLeaveOrg = async () => {
        if (!user?.organizationId) return;
        if (!confirm(t.settings.team.leaveConfirm)) return;

        try {
            await organizationService.leaveOrganization(user.organizationId);
            toast.success(t.settings.team.leftOrg);
            window.location.reload();
        } catch (error: unknown) {
            toast.error((error as { message?: string })?.message || t.common.error);
        }
    };

    // Extract domain from user email
    const domain = user?.email?.split('@')[1] || '';

    if (!user?.organizationId) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    {t.settings.team.title} - {t.common.noData}
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div variants={itemVariants} initial="hidden" animate="show">
            <Card>
                <CardHeader>
                    <CardTitle>{t.settings.team.title}</CardTitle>
                    <CardDescription>{t.settings.team.subtitle}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Auto-discovery info banner */}
                    <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                        <Info className="h-4 w-4 mt-0.5 text-blue-600 dark:text-blue-400 shrink-0" />
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            {t.settings.team.autoDiscovery.replace('{domain}', `@${domain}`)}
                        </p>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : members.length === 0 ? (
                        <div className="text-center py-12 border-dashed border-2 rounded-lg">
                            <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                            <p className="text-muted-foreground">{t.settings.team.noMembers}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <UserIcon className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {member.name || member.email}
                                                </span>
                                                {member.theyShareWithMe && (
                                                    <Badge variant="default" className="text-[10px] bg-green-600">
                                                        <Share2 className="h-3 w-3 mr-1" />
                                                        {t.settings.team.sharesWithYou}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{member.email}</p>
                                            {member.jobTitle && (
                                                <span className="text-xs text-muted-foreground">{member.jobTitle}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                                            <span className="text-muted-foreground hidden sm:inline">
                                                {t.settings.team.shareWith}
                                            </span>
                                            <Switch
                                                checked={member.iShareWithThem}
                                                onCheckedChange={(checked) => handleToggleSharing(member.id, checked)}
                                                disabled={togglingId === member.id}
                                            />
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Leave organization */}
                    <div className="pt-4 border-t">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={handleLeaveOrg}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            {t.settings.team.leaveOrg}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
