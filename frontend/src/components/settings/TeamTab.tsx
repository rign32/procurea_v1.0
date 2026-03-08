import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};
import { useForm } from 'react-hook-form';
import { Users, Plus, Trash2, Loader2, Shield, User as UserIcon, Mail, Eye, FolderOpen, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { PL } from '@/i18n/pl';
import organizationService from '@/services/organization.service';
import type { OrgMember } from '@/services/organization.service';
import { toast } from 'sonner';

interface TeamTabProps {
    user: any;
}

interface InviteFormData {
    email: string;
    role: string;
    campaignAccess: string;
}

const ACCESS_OPTIONS = [
    {
        value: 'all',
        label: 'Pełny dostęp',
        description: 'Widzi i tworzy wszystkie kampanie',
        icon: Globe,
    },
    {
        value: 'own',
        label: 'Własne kampanie',
        description: 'Widzi i tworzy tylko swoje',
        icon: FolderOpen,
    },
    {
        value: 'readonly',
        label: 'Tylko odczyt',
        description: 'Widzi kampanie, nie tworzy',
        icon: Eye,
    },
];

function getAccessLabel(access: string): string {
    const opt = ACCESS_OPTIONS.find(o => o.value === access);
    return opt?.label || access;
}

export function TeamTab({ user }: TeamTabProps) {
    const [members, setMembers] = useState<OrgMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editingMemberId, setEditingMemberId] = useState<string | null>(null);

    const { register, handleSubmit, reset, setValue, watch } = useForm<InviteFormData>({
        defaultValues: { email: '', role: 'USER', campaignAccess: 'own' },
    });

    const selectedRole = watch('role');
    const selectedAccess = watch('campaignAccess');

    const loadMembers = async () => {
        if (!user?.organizationId) return;
        try {
            setIsLoading(true);
            const data = await organizationService.getMembers(user.organizationId);
            setMembers(data);
        } catch (error) {
            console.error('Failed to load members:', error);
            toast.error(PL.common.error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadMembers();
    }, [user?.organizationId]);

    const onSubmit = async (data: InviteFormData) => {
        if (!user?.organizationId) return;
        setIsSaving(true);
        try {
            await organizationService.inviteMember(user.organizationId, {
                email: data.email,
                role: data.role,
                campaignAccess: data.role === 'ADMIN' ? 'all' : data.campaignAccess,
            });
            toast.success(PL.settings.team.inviteSent);
            await loadMembers();
            setIsDialogOpen(false);
            reset({ email: '', role: 'USER', campaignAccess: 'own' });
        } catch (error: any) {
            console.error('Failed to invite member:', error);
            toast.error(error?.message || PL.common.error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemove = async (memberId: string, memberEmail: string) => {
        if (!confirm(`${PL.settings.team.removeConfirm} ${memberEmail}?`)) return;
        if (!user?.organizationId) return;

        try {
            await organizationService.removeMember(user.organizationId, memberId);
            toast.success(PL.common.deleted);
            loadMembers();
        } catch (error: any) {
            console.error('Failed to remove member:', error);
            toast.error(error?.message || PL.common.error);
        }
    };

    const handleUpdateAccess = async (memberId: string, campaignAccess: string) => {
        if (!user?.organizationId) return;
        try {
            await organizationService.updateUserAccess(user.organizationId, memberId, { campaignAccess });
            toast.success('Uprawnienia zaktualizowane');
            setEditingMemberId(null);
            loadMembers();
        } catch (error: any) {
            toast.error(error?.message || PL.common.error);
        }
    };

    const isAdmin = user?.role === 'ADMIN';

    if (!user?.organizationId) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    {PL.settings.team.title} - {PL.common.noData}
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div variants={itemVariants} initial="hidden" animate="show">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{PL.settings.team.title}</CardTitle>
                        <CardDescription>{PL.settings.team.subtitle}</CardDescription>
                    </div>
                    {isAdmin && (
                        <Button onClick={() => setIsDialogOpen(true)} size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            {PL.settings.team.invite}
                        </Button>
                    )}
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : members.length === 0 ? (
                        <div className="text-center py-12 border-dashed border-2 rounded-lg">
                            <Users className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                            <p className="text-muted-foreground">{PL.settings.team.noMembers}</p>
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
                                            {member.role === 'ADMIN' ? (
                                                <Shield className="h-4 w-4" />
                                            ) : (
                                                <UserIcon className="h-4 w-4" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium">
                                                    {member.name || member.email}
                                                </span>
                                                <Badge variant={member.role === 'ADMIN' ? 'default' : 'secondary'} className="text-[10px]">
                                                    {member.role === 'ADMIN' ? PL.settings.team.roleAdmin : PL.settings.team.roleMember}
                                                </Badge>
                                                {member.id === user?.id && (
                                                    <Badge variant="outline" className="text-[10px]">
                                                        {PL.settings.team.you}
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{member.email}</p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                {member.jobTitle && (
                                                    <span className="text-xs text-muted-foreground">{member.jobTitle}</span>
                                                )}
                                                {member.role !== 'ADMIN' && (
                                                    <>
                                                        {editingMemberId === member.id ? (
                                                            <div className="flex gap-1 mt-1">
                                                                {ACCESS_OPTIONS.map((opt) => (
                                                                    <button
                                                                        key={opt.value}
                                                                        onClick={() => handleUpdateAccess(member.id, opt.value)}
                                                                        className={`text-[10px] px-2 py-0.5 rounded border transition-colors ${
                                                                            member.campaignAccess === opt.value
                                                                                ? 'border-primary bg-primary/10 text-primary'
                                                                                : 'border-muted hover:border-primary/50'
                                                                        }`}
                                                                    >
                                                                        {opt.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <button
                                                                onClick={() => isAdmin && member.id !== user?.id && setEditingMemberId(member.id)}
                                                                className={`inline-flex items-center gap-1 text-xs text-muted-foreground ${isAdmin && member.id !== user?.id ? 'hover:text-foreground cursor-pointer' : ''}`}
                                                            >
                                                                <span>{getAccessLabel(member.campaignAccess)}</span>
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isAdmin && member.id !== user?.id && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => handleRemove(member.id, member.email)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{PL.settings.team.inviteTitle}</DialogTitle>
                            <DialogDescription>{PL.settings.team.inviteSubtitle}</DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="invite-email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="invite-email"
                                        type="email"
                                        {...register('email', { required: true })}
                                        placeholder="kolega@firma.pl"
                                        className="pl-10"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>{PL.settings.team.role}</Label>
                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setValue('role', 'USER')}
                                        className={`flex-1 flex items-center gap-2 p-3 rounded-lg border-2 transition-colors text-sm ${selectedRole === 'USER'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-muted hover:border-muted-foreground/30'
                                            }`}
                                    >
                                        <UserIcon className="h-4 w-4" />
                                        <div className="text-left">
                                            <div className="font-medium">{PL.settings.team.roleMember}</div>
                                            <div className="text-xs text-muted-foreground">{PL.settings.team.roleMemberDesc}</div>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setValue('role', 'ADMIN')}
                                        className={`flex-1 flex items-center gap-2 p-3 rounded-lg border-2 transition-colors text-sm ${selectedRole === 'ADMIN'
                                            ? 'border-primary bg-primary/5'
                                            : 'border-muted hover:border-muted-foreground/30'
                                            }`}
                                    >
                                        <Shield className="h-4 w-4" />
                                        <div className="text-left">
                                            <div className="font-medium">{PL.settings.team.roleAdmin}</div>
                                            <div className="text-xs text-muted-foreground">{PL.settings.team.roleAdminDesc}</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {selectedRole !== 'ADMIN' && (
                                <div className="space-y-2">
                                    <Label>Dostęp do kampanii</Label>
                                    <div className="space-y-2">
                                        {ACCESS_OPTIONS.map((opt) => {
                                            const Icon = opt.icon;
                                            return (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    onClick={() => setValue('campaignAccess', opt.value)}
                                                    className={`w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-colors text-sm text-left ${
                                                        selectedAccess === opt.value
                                                            ? 'border-primary bg-primary/5'
                                                            : 'border-muted hover:border-muted-foreground/30'
                                                    }`}
                                                >
                                                    <Icon className="h-4 w-4 shrink-0" />
                                                    <div>
                                                        <div className="font-medium">{opt.label}</div>
                                                        <div className="text-xs text-muted-foreground">{opt.description}</div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    {PL.common.cancel}
                                </Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {PL.settings.team.sendInvite}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </Card>
        </motion.div>
    );
}
