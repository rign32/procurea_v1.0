import { useState, useEffect } from 'react';
import {
    Mail, Plus, Copy, Trash2, ChevronDown, ChevronRight, Loader2,
    Clock, MoreVertical,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog, DialogContent, DialogDescription, DialogFooter,
    DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { EmailPreview } from '@/components/email/EmailPreview';
import { t, isEN } from '@/i18n';
import { useAuthStore } from '@/stores/auth.store';
import sequencesService from '@/services/sequences.service';
import type { SequenceTemplate } from '@/services/sequences.service';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0 }
};

export function SequencesPage() {
    const [templates, setTemplates] = useState<SequenceTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [previewStepId, setPreviewStepId] = useState<string | null>(null);

    // Dialog state
    const [cloneDialog, setCloneDialog] = useState<{ open: boolean; templateId: string | null }>({ open: false, templateId: null });
    const [cloneName, setCloneName] = useState('');
    const [createDialog, setCreateDialog] = useState(false);
    const [newName, setNewName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Step editing
    const [editingStep, setEditingStep] = useState<{ stepId: string; subject: string; body: string } | null>(null);
    const [addStepDialog, setAddStepDialog] = useState<{ open: boolean; templateId: string | null }>({ open: false, templateId: null });
    const [newStep, setNewStep] = useState({ dayOffset: 0, type: 'REMINDER', subject: '', bodySnippet: '' });

    const { user } = useAuthStore();

    const loadTemplates = async () => {
        try {
            setIsLoading(true);
            const data = await sequencesService.getAll();
            setTemplates(data);
        } catch (err) {
            console.error('Failed to load templates:', err);
            toast.error(t.common.error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { loadTemplates(); }, []);

    // --- Handlers ---

    const handleCreate = async () => {
        if (!newName.trim()) return;
        setIsSaving(true);
        try {
            await sequencesService.create(newName.trim());
            await loadTemplates();
            setCreateDialog(false);
            setNewName('');
            toast.success(t.common.success);
        } catch {
            toast.error(t.common.error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleClone = async () => {
        if (!cloneDialog.templateId || !cloneName.trim()) return;
        setIsSaving(true);
        try {
            await sequencesService.clone(cloneDialog.templateId, cloneName.trim());
            await loadTemplates();
            setCloneDialog({ open: false, templateId: null });
            setCloneName('');
            toast.success(t.common.success);
        } catch {
            toast.error(t.common.error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm(t.sequences.deleteConfirm)) return;
        try {
            await sequencesService.delete(id);
            await loadTemplates();
            toast.success(t.common.deleted);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message || t.common.error);
        }
    };

    const handleUpdateStep = async () => {
        if (!editingStep) return;
        setIsSaving(true);
        try {
            await sequencesService.updateStep(editingStep.stepId, {
                subject: editingStep.subject,
                body: editingStep.body,
            });
            await loadTemplates();
            setEditingStep(null);
            toast.success(t.common.success);
        } catch {
            toast.error(t.common.error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteStep = async (stepId: string) => {
        if (!confirm(t.sequences.deleteStepConfirm)) return;
        try {
            await sequencesService.deleteStep(stepId);
            await loadTemplates();
            toast.success(t.common.deleted);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message || t.common.error);
        }
    };

    const handleAddStep = async () => {
        if (!addStepDialog.templateId || !newStep.subject.trim()) return;
        setIsSaving(true);
        try {
            await sequencesService.addStep(addStepDialog.templateId, newStep);
            await loadTemplates();
            setAddStepDialog({ open: false, templateId: null });
            setNewStep({ dayOffset: 0, type: 'REMINDER', subject: '', bodySnippet: '' });
            toast.success(t.common.success);
        } catch (err: unknown) {
            const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
            toast.error(message || t.common.error);
        } finally {
            setIsSaving(false);
        }
    };

    const stepTypeLabel = (type: string) => {
        switch (type) {
            case 'INITIAL': return t.sequences.stepType.initial;
            case 'REMINDER': return t.sequences.stepType.reminder;
            case 'FINAL': return t.sequences.stepType.final;
            default: return type;
        }
    };

    const stepTypeColor = (type: string) => {
        switch (type) {
            case 'INITIAL': return 'bg-[#5E8C8F]/10 text-[#4A7174] border-[#5E8C8F]/20';
            case 'REMINDER': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
            case 'FINAL': return 'bg-red-500/10 text-red-600 border-red-500/20';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6 max-w-5xl mx-auto"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{t.sequences.title}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t.sequences.subtitle}
                    </p>
                </div>
                <Button onClick={() => setCreateDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    {t.sequences.create}
                </Button>
            </motion.div>

            {/* Templates List */}
            {templates.length === 0 ? (
                <motion.div variants={itemVariants}>
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Mail className="mx-auto h-12 w-12 text-muted-foreground opacity-50 mb-4" />
                            <p className="text-muted-foreground">{t.sequences.emptyTitle}</p>
                            <Button variant="link" onClick={() => setCreateDialog(true)}>
                                {t.sequences.emptyAction}
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            ) : (
                <div className="space-y-4">
                    {templates.map((template) => {
                        const isExpanded = expandedId === template.id;
                        return (
                            <motion.div variants={itemVariants} key={template.id}>
                                <Card className="overflow-hidden">
                                    <div
                                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                                        onClick={() => setExpandedId(isExpanded ? null : template.id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="text-muted-foreground">
                                                {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                                            </div>
                                            <Mail className="h-5 w-5 text-primary" />
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <h3 className="font-semibold">{template.name}</h3>
                                                    {template.isSystem && (
                                                        <Badge variant="outline" className="text-[10px] py-0">
                                                            {t.sequences.system}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {template.steps.length} {t.sequences.steps.toLowerCase()} · {t.sequences.created} {new Date(template.createdAt).toLocaleDateString(isEN ? 'en-US' : 'pl-PL')}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => {
                                                        setCloneName(template.name + ' ' + t.sequences.copySuffix);
                                                        setCloneDialog({ open: true, templateId: template.id });
                                                    }}>
                                                        <Copy className="mr-2 h-4 w-4" />
                                                        {t.sequences.clone}
                                                    </DropdownMenuItem>
                                                    {!template.isSystem && (
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => handleDelete(template.id)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            {t.common.delete}
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>

                                    {/* Expanded: Steps */}
                                    {isExpanded && (
                                        <div className="border-t animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="p-4 space-y-3">
                                                {template.steps.map((step) => (
                                                    <div
                                                        key={step.id}
                                                        className="flex items-start gap-4 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors group"
                                                    >
                                                        <div className="flex flex-col items-center gap-1 pt-1">
                                                            <div className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${stepTypeColor(step.type)}`}>
                                                                {stepTypeLabel(step.type)}
                                                            </div>
                                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                                <Clock className="h-3 w-3" />
                                                                {t.sequences.day} {step.dayOffset}
                                                            </div>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-sm">{step.subject}</p>
                                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 whitespace-pre-line">
                                                                {step.bodySnippet}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-xs"
                                                                onClick={() => setPreviewStepId(step.id === previewStepId ? null : step.id)}
                                                            >
                                                                {t.sequences.preview}
                                                            </Button>
                                                            {!template.isSystem && (
                                                                <>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 text-xs"
                                                                        onClick={() => setEditingStep({
                                                                            stepId: step.id,
                                                                            subject: step.subject,
                                                                            body: step.bodySnippet,
                                                                        })}
                                                                    >
                                                                        {t.common.edit}
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-7 text-xs text-destructive hover:text-destructive"
                                                                        onClick={() => handleDeleteStep(step.id)}
                                                                    >
                                                                        <Trash2 className="h-3 w-3" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}

                                                {/* Email Preview */}
                                                {previewStepId && template.steps.some(s => s.id === previewStepId) && (
                                                    <div className="mt-4">
                                                        <Label className="mb-2 block">{t.sequences.preview}</Label>
                                                        <EmailPreview
                                                            stepId={previewStepId}
                                                            organizationId={user?.organizationId || undefined}
                                                            className="max-h-[400px] overflow-y-auto"
                                                        />
                                                    </div>
                                                )}

                                                {/* Add Step Button */}
                                                {!template.isSystem && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="w-full border-dashed"
                                                        onClick={() => {
                                                            const maxDay = Math.max(...template.steps.map(s => s.dayOffset), 0);
                                                            setNewStep({
                                                                dayOffset: maxDay + 3,
                                                                type: 'REMINDER',
                                                                subject: '',
                                                                bodySnippet: '',
                                                            });
                                                            setAddStepDialog({ open: true, templateId: template.id });
                                                        }}
                                                    >
                                                        <Plus className="mr-2 h-4 w-4" />
                                                        {t.sequences.addStep}
                                                    </Button>
                                                )}
                                                {template.isSystem && (
                                                    <p className="text-xs text-muted-foreground text-center py-2">
                                                        {t.sequences.systemReadonly}
                                                    </p>
                                                )}
                                            </div>

                                            {/* Variables Reference */}
                                            <div className="border-t px-4 py-3 bg-muted/30">
                                                <p className="text-xs text-muted-foreground">
                                                    <span className="font-medium">{t.sequences.variables}:</span>{' '}
                                                    {t.sequences.variablesList}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            )}

            {/* Create Dialog */}
            <Dialog open={createDialog} onOpenChange={setCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.sequences.create}</DialogTitle>
                        <DialogDescription>{t.sequences.createDescription}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t.sequences.templateName}</Label>
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder={t.sequences.templateNamePlaceholder}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCreateDialog(false)}>
                            {t.common.cancel}
                        </Button>
                        <Button onClick={handleCreate} disabled={isSaving || !newName.trim()}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t.sequences.create}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Clone Dialog */}
            <Dialog open={cloneDialog.open} onOpenChange={(open) => setCloneDialog(prev => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.sequences.clone}</DialogTitle>
                        <DialogDescription>{t.sequences.cloneDescription}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>{t.sequences.cloneName}</Label>
                            <Input
                                value={cloneName}
                                onChange={(e) => setCloneName(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCloneDialog({ open: false, templateId: null })}>
                            {t.common.cancel}
                        </Button>
                        <Button onClick={handleClone} disabled={isSaving || !cloneName.trim()}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t.sequences.clone}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Step Dialog */}
            <Dialog open={!!editingStep} onOpenChange={(open) => !open && setEditingStep(null)}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>{t.sequences.editStep}</DialogTitle>
                    </DialogHeader>
                    {editingStep && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>{t.sequences.subject}</Label>
                                <Input
                                    value={editingStep.subject}
                                    onChange={(e) => setEditingStep(prev => prev ? { ...prev, subject: e.target.value } : null)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t.sequences.body}</Label>
                                <textarea
                                    className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                    value={editingStep.body}
                                    onChange={(e) => setEditingStep(prev => prev ? { ...prev, body: e.target.value } : null)}
                                />
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {t.sequences.variables}: {t.sequences.variablesList}
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingStep(null)}>
                            {t.common.cancel}
                        </Button>
                        <Button onClick={handleUpdateStep} disabled={isSaving}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t.common.save}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Add Step Dialog */}
            <Dialog open={addStepDialog.open} onOpenChange={(open) => setAddStepDialog(prev => ({ ...prev, open }))}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t.sequences.addStep}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t.sequences.day}</Label>
                                <Input
                                    type="number"
                                    min={0}
                                    value={newStep.dayOffset}
                                    onChange={(e) => setNewStep(prev => ({ ...prev, dayOffset: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t.sequences.type}</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    value={newStep.type}
                                    onChange={(e) => setNewStep(prev => ({ ...prev, type: e.target.value }))}
                                >
                                    <option value="INITIAL">{t.sequences.stepType.initial}</option>
                                    <option value="REMINDER">{t.sequences.stepType.reminder}</option>
                                    <option value="FINAL">{t.sequences.stepType.final}</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>{t.sequences.subject}</Label>
                            <Input
                                value={newStep.subject}
                                onChange={(e) => setNewStep(prev => ({ ...prev, subject: e.target.value }))}
                                placeholder={t.sequences.subjectPlaceholder}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>{t.sequences.body}</Label>
                            <textarea
                                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                value={newStep.bodySnippet}
                                onChange={(e) => setNewStep(prev => ({ ...prev, bodySnippet: e.target.value }))}
                                placeholder={t.sequences.bodyPlaceholder}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddStepDialog({ open: false, templateId: null })}>
                            {t.common.cancel}
                        </Button>
                        <Button onClick={handleAddStep} disabled={isSaving || !newStep.subject.trim()}>
                            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {t.sequences.addStep}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </motion.div>
    );
}

export default SequencesPage;
