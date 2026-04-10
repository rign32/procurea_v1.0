import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};
import { useForm } from 'react-hook-form';
import { MapPin, Plus, Trash2, Edit2, Loader2, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { t, isEN } from '@/i18n';
import organizationService from '@/services/organization.service';
import type { OrganizationLocation } from '@/types/campaign.types';
import { toast } from 'sonner';

interface LocationsTabProps {
    user: any;
}

interface LocationFormData {
    name: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    isDefault: boolean;
}

const parseAddress = (address: string) => {
    const parts = address.split(',').map(s => s.trim());
    if (parts.length >= 3) {
        const street = parts[0];
        const country = parts[parts.length - 1];
        const middle = parts.slice(1, -1).join(', ');
        const zipCityMatch = middle.match(/^([\dA-Z-]+)\s+(.*)$/i);
        if (zipCityMatch) {
            return { street, postalCode: zipCityMatch[1], city: zipCityMatch[2], country };
        }
        return { street, postalCode: '', city: middle, country };
    }
    return { street: address, postalCode: '', city: '', country: t.settings.location.defaultCountry };
};

export function LocationsTab({ user }: LocationsTabProps) {
    const { confirm, ConfirmDialogElement } = useConfirmDialog();
    const [locations, setLocations] = useState<OrganizationLocation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<OrganizationLocation | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors: _errors } } = useForm<LocationFormData>({
        defaultValues: { country: t.settings.location.defaultCountry }
    });

    const loadLocations = async () => {
        if (!user?.organizationId) return;
        try {
            setIsLoading(true);
            const data = await organizationService.getLocations(user.organizationId);
            setLocations(data);
        } catch (error) {
            console.error('Failed to load locations:', error);
            toast.error(t.common.error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadLocations();
    }, [user?.organizationId]);

    const handleOpenDialog = (location?: OrganizationLocation) => {
        if (location) {
            const parsed = parseAddress(location.address);
            setEditingLocation(location);
            setValue('name', location.name);
            setValue('street', parsed.street);
            setValue('city', parsed.city);
            setValue('postalCode', parsed.postalCode);
            setValue('country', parsed.country);
            setValue('isDefault', location.isDefault);
        } else {
            setEditingLocation(null);
            reset({ name: '', street: '', city: '', postalCode: '', country: t.settings.location.defaultCountry, isDefault: false });
        }
        setIsDialogOpen(true);
    };

    const onSubmit = async (data: LocationFormData) => {
        if (!user?.organizationId) return;
        setIsSaving(true);
        try {
            const fullAddress = `${data.street}, ${data.postalCode} ${data.city}, ${data.country}`;
            const payload = {
                name: data.name,
                address: fullAddress,
                isDefault: data.isDefault,
            };

            if (editingLocation) {
                await organizationService.updateLocation(user.organizationId, editingLocation.id, payload);
                toast.success(t.common.success);
            } else {
                await organizationService.addLocation(user.organizationId, payload);
                toast.success(t.common.success);
            }
            await loadLocations();
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Failed to save location:', error);
            toast.error(t.common.error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!await confirm({ title: isEN ? 'Are you sure you want to delete this location?' : 'Czy na pewno chcesz usunąć tę lokalizację?', variant: 'destructive' })) return;
        if (!user?.organizationId) return;

        try {
            await organizationService.removeLocation(user.organizationId, id);
            toast.success(t.common.deleted);
            loadLocations();
        } catch (error) {
            console.error('Failed to delete location:', error);
            toast.error(t.common.error);
        }
    };

    if (!user?.organizationId) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    {t.settings.organization.locations} - {t.common.noData}
                </CardContent>
            </Card>
        );
    }

    return (
        <>
        {ConfirmDialogElement}
        <motion.div variants={itemVariants} initial="hidden" animate="show">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{t.settings.organization.locations}</CardTitle>
                        <CardDescription>{t.settings.location.manageDelivery}</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenDialog()} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        {t.settings.organization.addLocation}
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : locations.length === 0 ? (
                        <div className="text-center py-12 border-dashed border-2 rounded-lg">
                            <MapPin className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                            <p className="text-muted-foreground">{t.settings.location.noLocations}</p>
                            <Button variant="link" onClick={() => handleOpenDialog()}>
                                {t.settings.location.addFirst}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {locations.map((location) => (
                                <div
                                    key={location.id}
                                    className="flex items-start justify-between p-4 border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1 h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <MapPin className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h4 className="font-semibold">{location.name}</h4>
                                                {location.isDefault && (
                                                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                                                        {t.settings.location.defaultLabel}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">
                                                {location.address}
                                            </p>
                                        </div>
                                    </div>

                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleOpenDialog(location)}>
                                                <Edit2 className="mr-2 h-4 w-4" />
                                                {t.common.edit}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleDelete(location.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                {t.common.delete}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingLocation ? t.common.edit : t.settings.organization.addLocation}
                            </DialogTitle>
                            <DialogDescription>
                                {t.settings.location.dialogDescription}
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="loc-name">{t.settings.location.name}</Label>
                                <Input
                                    id="loc-name"
                                    {...register('name', { required: true })}
                                    placeholder={t.settings.location.namePlaceholder}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="loc-street">{t.settings.location.streetLabel}</Label>
                                <Input
                                    id="loc-street"
                                    {...register('street', { required: true })}
                                    placeholder={t.settings.location.streetPlaceholder}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="loc-city">{t.settings.location.city}</Label>
                                    <Input
                                        id="loc-city"
                                        {...register('city', { required: true })}
                                        placeholder={t.settings.location.cityPlaceholder}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="loc-postalCode">{t.settings.location.postalCode}</Label>
                                    <Input
                                        id="loc-postalCode"
                                        {...register('postalCode', { required: true })}
                                        placeholder={t.settings.location.postalCodePlaceholder}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="loc-country">{t.settings.location.country}</Label>
                                <Input
                                    id="loc-country"
                                    {...register('country', { required: true })}
                                    placeholder={t.settings.location.countryPlaceholder}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isDefault"
                                    checked={watch('isDefault')}
                                    onCheckedChange={(checked) => setValue('isDefault', checked as boolean)}
                                />
                                <Label htmlFor="isDefault">{t.settings.location.isDefault}</Label>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    {t.common.cancel}
                                </Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t.common.save}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </Card>
        </motion.div>
        </>
    );
}
