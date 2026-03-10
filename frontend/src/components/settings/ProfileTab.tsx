import { useState } from 'react';
import { motion } from 'framer-motion';

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};
import { useForm } from 'react-hook-form';
import { Loader2, Lock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { t } from '@/i18n';
import profileService from '@/services/profile.service';
import type { UpdateProfileDto } from '@/services/profile.service';
import { useAuthStore } from '@/stores/auth.store';
import { toast } from 'sonner';

interface ProfileTabProps {
    user: any;
}

export function ProfileTab({ user }: ProfileTabProps) {
    const { updateUser } = useAuthStore();
    const [isSaving, setIsSaving] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<UpdateProfileDto>({
        defaultValues: {
            name: user?.name || '',
            phone: user?.phone || '',
            jobTitle: user?.jobTitle || '',
            companyName: user?.companyName || '',
        },
    });

    const onSubmit = async (data: UpdateProfileDto) => {
        setIsSaving(true);
        try {
            // Don't send phone if it's already verified (locked)
            const payload = { ...data };
            if (user?.isPhoneVerified) {
                delete payload.phone;
            }
            await profileService.updateProfile(payload);
            updateUser(payload);
            toast.success(t.common.success);
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error(t.common.error);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) return null;

    return (
        <motion.div variants={itemVariants} initial="hidden" animate="show">
            <Card>
                <CardHeader>
                    <CardTitle>{t.settings.profile.title}</CardTitle>
                    <CardDescription>Zarządzaj swoimi danymi osobowymi</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                        <div className="flex items-center gap-4 mb-6">
                            <Avatar className="h-16 w-16 shadow-soft">
                                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                                    {user.name
                                        ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                                        : user.email[0].toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-lg font-semibold">{user.name || '—'}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="name">{t.settings.profile.name}</Label>
                                <Input
                                    id="name"
                                    {...register('name', { required: "Imię i nazwisko jest wymagane" })}
                                    placeholder="Jan Kowalski"
                                    className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                                />
                                {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">{t.settings.profile.email}</Label>
                                <Input
                                    id="email"
                                    value={user.email}
                                    disabled
                                    className="bg-muted"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone" className="flex items-center gap-1.5">
                                    {t.settings.profile.phone}
                                    {user?.isPhoneVerified && (
                                        <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                </Label>
                                {user?.isPhoneVerified ? (
                                    <div className="relative">
                                        <Input
                                            id="phone"
                                            value={user?.phone || ''}
                                            disabled
                                            className="bg-muted pr-10"
                                        />
                                        <span
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
                                            title="Numer telefonu jest Twoim identyfikatorem i nie może być zmieniony"
                                        >
                                            Zweryfikowany
                                        </span>
                                    </div>
                                ) : (
                                    <Input
                                        id="phone"
                                        {...register('phone')}
                                        placeholder="+48 123 456 789"
                                    />
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="jobTitle">{t.settings.profile.jobTitle}</Label>
                                <Input
                                    id="jobTitle"
                                    {...register('jobTitle')}
                                    placeholder="Procurement Manager"
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="companyName">{t.settings.profile.companyName}</Label>
                                <Input
                                    id="companyName"
                                    {...register('companyName', { required: "Nazwa firmy jest wymagana" })}
                                    placeholder="Firma Sp. z o.o."
                                    className={errors.companyName ? "border-destructive focus-visible:ring-destructive" : ""}
                                />
                                {errors.companyName && <p className="text-xs text-destructive mt-1">{errors.companyName.message}</p>}
                                <p className="text-xs text-muted-foreground mt-1">
                                    To jest nazwa wyświetlana w Twoim profilu.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isSaving}>
                                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {t.common.save}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    );
}
