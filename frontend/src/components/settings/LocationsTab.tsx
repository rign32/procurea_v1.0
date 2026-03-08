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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { PL } from '@/i18n/pl';
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
    return { street: address, postalCode: '', city: '', country: 'Polska' };
};

export function LocationsTab({ user }: LocationsTabProps) {
    const [locations, setLocations] = useState<OrganizationLocation[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingLocation, setEditingLocation] = useState<OrganizationLocation | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<LocationFormData>({
        defaultValues: { country: 'Polska' }
    });

    const loadLocations = async () => {
        if (!user?.organizationId) return;
        try {
            setIsLoading(true);
            const data = await organizationService.getLocations(user.organizationId);
            setLocations(data);
        } catch (error) {
            console.error('Failed to load locations:', error);
            toast.error(PL.common.error);
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
            reset({ name: '', street: '', city: '', postalCode: '', country: 'Polska', isDefault: false });
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
                toast.success(PL.common.success);
            } else {
                await organizationService.addLocation(user.organizationId, payload);
                toast.success(PL.common.success);
            }
            await loadLocations();
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Failed to save location:', error);
            toast.error(PL.common.error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this location?')) return;
        if (!user?.organizationId) return;

        try {
            await organizationService.removeLocation(user.organizationId, id);
            toast.success(PL.common.deleted);
            loadLocations();
        } catch (error) {
            console.error('Failed to delete location:', error);
            toast.error(PL.common.error);
        }
    };

    if (!user?.organizationId) {
        return (
            <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                    {PL.settings.organization.locations} - {PL.common.noData}
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div variants={itemVariants} initial="hidden" animate="show">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>{PL.settings.organization.locations}</CardTitle>
                        <CardDescription>Zarządzaj adresami dostaw</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenDialog()} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        {PL.settings.organization.addLocation}
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
                            <p className="text-muted-foreground">Brak zdefiniowanych lokalizacji</p>
                            <Button variant="link" onClick={() => handleOpenDialog()}>
                                Dodaj pierwszą lokalizację
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
                                                        Domyślna
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
                                                {PL.common.edit}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-destructive focus:text-destructive"
                                                onClick={() => handleDelete(location.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                {PL.common.delete}
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
                                {editingLocation ? PL.common.edit : PL.settings.organization.addLocation}
                            </DialogTitle>
                            <DialogDescription>
                                Wprowadź dane lokalizacji dostawy.
                            </DialogDescription>
                        </DialogHeader>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="loc-name">{PL.settings.location.name}</Label>
                                <Input
                                    id="loc-name"
                                    {...register('name', { required: true })}
                                    placeholder="np. Magazyn Główny"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="loc-street">Adres (Ulica i numer)</Label>
                                <Input
                                    id="loc-street"
                                    {...register('street', { required: true })}
                                    placeholder="np. ul. Złota 44"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="loc-city">Miasto</Label>
                                    <Input
                                        id="loc-city"
                                        {...register('city', { required: true })}
                                        placeholder="np. Warszawa"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="loc-postalCode">Kod pocztowy</Label>
                                    <Input
                                        id="loc-postalCode"
                                        {...register('postalCode', { required: true })}
                                        placeholder="00-120"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="loc-country">Kraj</Label>
                                <Input
                                    id="loc-country"
                                    {...register('country', { required: true })}
                                    placeholder="Polska"
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="isDefault"
                                    checked={watch('isDefault')}
                                    onCheckedChange={(checked) => setValue('isDefault', checked as boolean)}
                                />
                                <Label htmlFor="isDefault">{PL.settings.location.isDefault}</Label>
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    {PL.common.cancel}
                                </Button>
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {PL.common.save}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </Card>
        </motion.div>
    );
}
