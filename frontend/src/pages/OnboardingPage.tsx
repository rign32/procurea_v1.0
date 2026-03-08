import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PL } from '@/i18n/pl';
import { useAuthStore } from '@/stores/auth.store';
import { Building2, MapPin, UserCheck, ArrowRight, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function OnboardingPage() {
    const navigate = useNavigate();
    const { user, setUser } = useAuthStore();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        jobTitle: '',
        companyName: '',
        nip: '',
        locationStreet: '',
        locationBuildingNr: '',
        locationUnitNr: '',
        locationCity: '',
        locationPostalCode: '',
        locationCountry: 'Polska',
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.firstName || !formData.lastName) {
                setError('Imię i nazwisko są wymagane');
                return;
            }
        }
        if (step === 2) {
            if (!formData.companyName) {
                setError(PL.auth.onboarding.companyNameRequired);
                return;
            }
        }
        setError('');
        setStep(s => Math.min(3, s + 1));
    };

    const handleBack = () => {
        setError('');
        setStep(s => Math.max(1, s - 1));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // If we are not on the last step, just go next (which handles validation)
        if (step < 3) {
            handleNext();
            return;
        }
        try {
            setLoading(true);
            setError('');

            const locations = [];
            if (formData.locationStreet) {
                const streetLine = [formData.locationStreet, formData.locationBuildingNr, formData.locationUnitNr && `/${formData.locationUnitNr}`].filter(Boolean).join(' ');
                locations.push({
                    name: 'Główna siedziba',
                    address: `${streetLine}, ${formData.locationPostalCode} ${formData.locationCity}, ${formData.locationCountry}`,
                });
            }

            const res = await fetch('/api/auth/onboarding/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    userId: user?.id,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    jobTitle: formData.jobTitle,
                    companyName: formData.companyName,
                    locations
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || PL.errors.generic);

            // Update local user state
            setUser(data);
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Rendering helpers
    const StepIndicator = () => (
        <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map((s) => (
                <div
                    key={s}
                    className={`h-2.5 w-10 rounded-full transition-colors ${step >= s ? 'bg-primary' : 'bg-muted'
                        }`}
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 p-4">
            <motion.div
                variants={pageVariants}
                initial="hidden"
                animate="show"
                className="w-full max-w-md space-y-6"
            >
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">{PL.auth.onboarding.title}</h1>
                    <p className="text-muted-foreground">{PL.auth.onboarding.subtitle}</p>
                </div>

                <Card className="shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <StepIndicator />
                        <CardTitle className="text-xl">
                            {step === 1 && PL.auth.onboarding.step1Title}
                            {step === 2 && PL.auth.onboarding.step2Title}
                            {step === 3 && PL.auth.onboarding.step3Title}
                        </CardTitle>
                        <CardDescription>
                            {step === 1 && PL.auth.onboarding.step1Subtitle}
                            {step === 2 && PL.auth.onboarding.step2Subtitle}
                            {step === 3 && PL.auth.onboarding.step3Subtitle}
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-4 pt-4">
                        {error && (
                            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">

                            {/* STEP 1: Personal Info */}
                            {step === 1 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="firstName">{PL.auth.onboarding.firstName}</Label>
                                            <Input
                                                id="firstName"
                                                name="firstName"
                                                placeholder={PL.auth.onboarding.firstNamePlaceholder}
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">{PL.auth.onboarding.lastName}</Label>
                                            <Input
                                                id="lastName"
                                                name="lastName"
                                                placeholder={PL.auth.onboarding.lastNamePlaceholder}
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="jobTitle">{PL.auth.onboarding.jobTitle}</Label>
                                        <div className="relative">
                                            <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="jobTitle"
                                                name="jobTitle"
                                                className="pl-9"
                                                placeholder={PL.auth.onboarding.jobTitlePlaceholder}
                                                value={formData.jobTitle}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* STEP 2: Company Info */}
                            {step === 2 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <Label htmlFor="companyName">{PL.auth.onboarding.companyName} *</Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="companyName"
                                                name="companyName"
                                                className="pl-9"
                                                placeholder={PL.auth.onboarding.companyNamePlaceholder}
                                                value={formData.companyName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nip">NIP (Opcjonalnie)</Label>
                                        <Input
                                            id="nip"
                                            name="nip"
                                            placeholder="NP: 1234567890"
                                            value={formData.nip}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* STEP 3: Location */}
                            {step === 3 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <Label htmlFor="locationStreet">Ulica / Miejscowość</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="locationStreet"
                                                name="locationStreet"
                                                className="pl-9"
                                                placeholder="ul. Przykładowa"
                                                value={formData.locationStreet}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="locationBuildingNr">Nr budynku</Label>
                                            <Input
                                                id="locationBuildingNr"
                                                name="locationBuildingNr"
                                                placeholder="10"
                                                value={formData.locationBuildingNr}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="locationUnitNr">Nr lokalu</Label>
                                            <Input
                                                id="locationUnitNr"
                                                name="locationUnitNr"
                                                placeholder="5"
                                                value={formData.locationUnitNr}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="locationPostalCode">Kod pocztowy</Label>
                                            <Input
                                                id="locationPostalCode"
                                                name="locationPostalCode"
                                                placeholder="00-001"
                                                value={formData.locationPostalCode}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="locationCity">Miasto</Label>
                                            <Input
                                                id="locationCity"
                                                name="locationCity"
                                                placeholder="Warszawa"
                                                value={formData.locationCity}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex gap-3 pt-4 border-t">
                                {step > 1 && (
                                    <Button type="button" variant="outline" onClick={handleBack} disabled={loading} className="w-12 px-0">
                                        <ArrowLeft className="h-4 w-4" />
                                    </Button>
                                )}

                                {step < 3 ? (
                                    <Button type="submit" className="flex-1">
                                        {PL.common.next} <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={loading} className="flex-1">
                                        {loading ? PL.common.loading : PL.auth.onboarding.complete}
                                    </Button>
                                )}
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
