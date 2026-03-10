import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { t } from '@/i18n';
import { useAuthStore } from '@/stores/auth.store';
import { analytics, startHesitationTracker } from '@/lib/analytics';
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

    useEffect(() => {
        analytics.onboardingStepView(1);
        return startHesitationTracker('onboarding', 45000);
    }, []);

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
        locationCountry: t.auth.onboarding.defaultCountry,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleNext = () => {
        if (step === 1) {
            if (!formData.firstName || !formData.lastName) {
                setError(t.auth.onboarding.nameRequired);
                return;
            }
        }
        if (step === 2) {
            if (!formData.companyName) {
                setError(t.auth.onboarding.companyNameRequired);
                return;
            }
        }
        setError('');
        analytics.onboardingStepComplete(step);
        const nextStep = Math.min(3, step + 1);
        analytics.onboardingStepView(nextStep);
        setStep(nextStep);
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
                    name: t.auth.onboarding.defaultLocationName,
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
            if (!res.ok) throw new Error(data.message || t.errors.generic);

            analytics.onboardingStepComplete(3);
            analytics.onboardingCompleted();
            // Update local user state
            setUser(data);
            navigate('/');
        } catch (err: any) {
            analytics.onboardingFailed(err.message);
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
                    <h1 className="text-3xl font-bold tracking-tight">{t.auth.onboarding.title}</h1>
                    <p className="text-muted-foreground">{t.auth.onboarding.subtitle}</p>
                </div>

                <Card className="shadow-lg">
                    <CardHeader className="text-center pb-2">
                        <StepIndicator />
                        <CardTitle className="text-xl">
                            {step === 1 && t.auth.onboarding.step1Title}
                            {step === 2 && t.auth.onboarding.step2Title}
                            {step === 3 && t.auth.onboarding.step3Title}
                        </CardTitle>
                        <CardDescription>
                            {step === 1 && t.auth.onboarding.step1Subtitle}
                            {step === 2 && t.auth.onboarding.step2Subtitle}
                            {step === 3 && t.auth.onboarding.step3Subtitle}
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
                                            <Label htmlFor="firstName">{t.auth.onboarding.firstName}</Label>
                                            <Input
                                                id="firstName"
                                                name="firstName"
                                                placeholder={t.auth.onboarding.firstNamePlaceholder}
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="lastName">{t.auth.onboarding.lastName}</Label>
                                            <Input
                                                id="lastName"
                                                name="lastName"
                                                placeholder={t.auth.onboarding.lastNamePlaceholder}
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="jobTitle">{t.auth.onboarding.jobTitle}</Label>
                                        <div className="relative">
                                            <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="jobTitle"
                                                name="jobTitle"
                                                className="pl-9"
                                                placeholder={t.auth.onboarding.jobTitlePlaceholder}
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
                                        <Label htmlFor="companyName">{t.auth.onboarding.companyName} *</Label>
                                        <div className="relative">
                                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="companyName"
                                                name="companyName"
                                                className="pl-9"
                                                placeholder={t.auth.onboarding.companyNamePlaceholder}
                                                value={formData.companyName}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="nip">{t.auth.onboarding.nipLabel}</Label>
                                        <Input
                                            id="nip"
                                            name="nip"
                                            placeholder={t.auth.onboarding.nipPlaceholder}
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
                                        <Label htmlFor="locationStreet">{t.auth.onboarding.streetLabel}</Label>
                                        <div className="relative">
                                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="locationStreet"
                                                name="locationStreet"
                                                className="pl-9"
                                                placeholder={t.auth.onboarding.streetPlaceholder}
                                                value={formData.locationStreet}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="locationBuildingNr">{t.auth.onboarding.buildingNr}</Label>
                                            <Input
                                                id="locationBuildingNr"
                                                name="locationBuildingNr"
                                                placeholder="10"
                                                value={formData.locationBuildingNr}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="locationUnitNr">{t.auth.onboarding.unitNr}</Label>
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
                                            <Label htmlFor="locationPostalCode">{t.auth.onboarding.postalCode}</Label>
                                            <Input
                                                id="locationPostalCode"
                                                name="locationPostalCode"
                                                placeholder={t.auth.onboarding.postalCodePlaceholder}
                                                value={formData.locationPostalCode}
                                                onChange={handleChange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="locationCity">{t.auth.onboarding.cityLabel}</Label>
                                            <Input
                                                id="locationCity"
                                                name="locationCity"
                                                placeholder={t.auth.onboarding.cityPlaceholder}
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
                                        {t.common.next} <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Button type="submit" disabled={loading} className="flex-1">
                                        {loading ? t.common.loading : t.auth.onboarding.complete}
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
