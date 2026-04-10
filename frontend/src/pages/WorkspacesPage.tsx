import { useState, useCallback } from 'react';
import { Loader2, FolderKanban, Plus, Pencil, Trash2, Users, UserPlus, UserMinus } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { EmptyState } from '@/components/ui/empty-state';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { useConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  useWorkspaces,
  useCreateWorkspace,
  useUpdateWorkspace,
  useDeleteWorkspace,
  useAddWorkspaceMember,
  useRemoveWorkspaceMember,
} from '@/hooks/useWorkspaces';
import { useAuthStore } from '@/stores/auth.store';
import organizationService from '@/services/organization.service';
import type { OrgMember } from '@/services/organization.service';
import type { Workspace } from '@/services/workspaces.service';
import { isEN } from '@/i18n';

export function WorkspacesPage() {
  const { user } = useAuthStore();
  const { confirm, ConfirmDialogElement } = useConfirmDialog();

  // Workspace CRUD
  const { data: workspaces, isLoading, error } = useWorkspaces();
  const createMutation = useCreateWorkspace();
  const updateMutation = useUpdateWorkspace();
  const deleteMutation = useDeleteWorkspace();
  const addMemberMutation = useAddWorkspaceMember();
  const removeMemberMutation = useRemoveWorkspaceMember();

  // Create/Edit dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');

  // Members dialog
  const [membersWorkspace, setMembersWorkspace] = useState<Workspace | null>(null);
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([]);
  const [orgMembersLoading, setOrgMembersLoading] = useState(false);

  // Load org members when members dialog opens
  const openMembersDialog = useCallback(async (ws: Workspace) => {
    setMembersWorkspace(ws);
    if (!user?.organizationId) return;
    setOrgMembersLoading(true);
    try {
      const members = await organizationService.getMembers(user.organizationId);
      setOrgMembers(members);
    } catch {
      toast.error(isEN ? 'Failed to load members' : 'Blad ladowania czlonkow');
    } finally {
      setOrgMembersLoading(false);
    }
  }, [user?.organizationId]);

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setEditingWorkspace(null);
  };

  const openCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (ws: Workspace) => {
    setEditingWorkspace(ws);
    setFormName(ws.name);
    setFormDescription(ws.description || '');
    setFormOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error(isEN ? 'Name is required' : 'Nazwa jest wymagana');
      return;
    }

    try {
      if (editingWorkspace) {
        await updateMutation.mutateAsync({
          id: editingWorkspace.id,
          dto: {
            name: formName.trim(),
            description: formDescription.trim() || undefined,
          },
        });
        toast.success(isEN ? 'Workspace updated' : 'Przestrzen zaktualizowana');
      } else {
        await createMutation.mutateAsync({
          name: formName.trim(),
          description: formDescription.trim() || undefined,
        });
        toast.success(isEN ? 'Workspace created' : 'Przestrzen utworzona');
      }
      setFormOpen(false);
      resetForm();
    } catch (err: unknown) {
      toast.error(
        (err as { message?: string })?.message ||
          (isEN ? 'Operation failed' : 'Operacja nie powiodla sie')
      );
    }
  };

  const handleDelete = async (ws: Workspace) => {
    const ok = await confirm({
      title: isEN ? 'Delete Workspace' : 'Usun przestrzen',
      description: isEN
        ? `Are you sure you want to delete "${ws.name}"? This action cannot be undone.`
        : `Czy na pewno chcesz usunac "${ws.name}"? Tej operacji nie mozna cofnac.`,
      variant: 'destructive',
      confirmLabel: isEN ? 'Delete' : 'Usun',
    });
    if (!ok) return;

    try {
      await deleteMutation.mutateAsync(ws.id);
      toast.success(isEN ? 'Workspace deleted' : 'Przestrzen usunieta');
    } catch (err: unknown) {
      toast.error(
        (err as { message?: string })?.message ||
          (isEN ? 'Failed to delete' : 'Blad usuwania')
      );
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!membersWorkspace) return;
    try {
      await addMemberMutation.mutateAsync({
        workspaceId: membersWorkspace.id,
        userId,
      });
      toast.success(isEN ? 'Member added' : 'Czlonek dodany');
    } catch (err: unknown) {
      toast.error(
        (err as { message?: string })?.message ||
          (isEN ? 'Failed to add member' : 'Blad dodawania czlonka')
      );
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!membersWorkspace) return;
    try {
      await removeMemberMutation.mutateAsync({
        workspaceId: membersWorkspace.id,
        userId,
      });
      toast.success(isEN ? 'Member removed' : 'Czlonek usuniety');
    } catch (err: unknown) {
      toast.error(
        (err as { message?: string })?.message ||
          (isEN ? 'Failed to remove member' : 'Blad usuwania czlonka')
      );
    }
  };

  const isWorkspaceMember = (userId: string): boolean => {
    return membersWorkspace?.members?.some((m) => m.id === userId) ?? false;
  };

  if (!workspaces && isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-destructive">
            {isEN ? 'An error occurred. Please try again.' : 'Wystapil blad. Sprobuj ponownie.'}
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            {isEN ? 'Refresh' : 'Odswiez'}
          </Button>
        </div>
      </div>
    );
  }

  const workspacesList = workspaces ?? [];

  return (
    <div className="space-y-6">
      {ConfirmDialogElement}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {isEN ? 'Workspaces' : 'Przestrzenie robocze'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isEN
              ? 'Organize your team into workspaces'
              : 'Organizuj swoj zespol w przestrzeniach roboczych'}
          </p>
        </div>
        <Button onClick={openCreate} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          {isEN ? 'New Workspace' : 'Nowa przestrzen'}
        </Button>
      </div>

      {/* Workspaces Grid */}
      {workspacesList.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={isEN ? 'No workspaces yet' : 'Brak przestrzeni roboczych'}
          description={
            isEN
              ? 'Create your first workspace to organize your team.'
              : 'Utworz pierwsza przestrzen robocza, aby zorganizowac zespol.'
          }
          action={
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              {isEN ? 'New Workspace' : 'Nowa przestrzen'}
            </Button>
          }
        />
      ) : (
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: { opacity: 1, transition: { staggerChildren: 0.05 } },
          }}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {workspacesList.map((ws) => (
            <motion.div
              key={ws.id}
              variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            >
              <Card className="border-border/40 hover:shadow-soft-xl transition-shadow h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <FolderKanban className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base truncate">{ws.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEdit(ws)}
                        title={isEN ? 'Edit' : 'Edytuj'}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(ws)}
                        title={isEN ? 'Delete' : 'Usun'}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 flex flex-col justify-between">
                  {ws.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {ws.description}
                    </p>
                  )}
                  {!ws.description && <div className="flex-1" />}

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {ws.memberCount ?? ws.members?.length ?? 0}{' '}
                        {isEN ? 'members' : 'czlonkow'}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openMembersDialog(ws)}
                    >
                      <Users className="mr-1.5 h-3.5 w-3.5" />
                      {isEN ? 'Manage' : 'Zarzadzaj'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create / Edit Workspace Dialog */}
      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormOpen(false);
            resetForm();
          }
        }}
      >
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>
              {editingWorkspace
                ? (isEN ? 'Edit Workspace' : 'Edytuj przestrzen')
                : (isEN ? 'New Workspace' : 'Nowa przestrzen')}
            </DialogTitle>
            <DialogDescription>
              {editingWorkspace
                ? (isEN ? 'Update workspace details.' : 'Zaktualizuj dane przestrzeni.')
                : (isEN
                    ? 'Create a new workspace for your team.'
                    : 'Utworz nowa przestrzen robocza dla zespolu.')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{isEN ? 'Name' : 'Nazwa'}</Label>
              <Input
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder={isEN ? 'e.g. Marketing Team' : 'np. Zespol marketingu'}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {isEN ? 'Description' : 'Opis'}{' '}
                <span className="text-muted-foreground text-xs">
                  ({isEN ? 'optional' : 'opcjonalne'})
                </span>
              </Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder={
                  isEN
                    ? 'What is this workspace for?'
                    : 'Do czego sluzy ta przestrzen?'
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFormOpen(false);
                resetForm();
              }}
            >
              {isEN ? 'Cancel' : 'Anuluj'}
            </Button>
            <Button
              onClick={handleSave}
              disabled={
                createMutation.isPending ||
                updateMutation.isPending ||
                !formName.trim()
              }
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEN ? 'Saving...' : 'Zapisywanie...'}
                </>
              ) : editingWorkspace ? (
                isEN ? 'Save Changes' : 'Zapisz zmiany'
              ) : (
                isEN ? 'Create Workspace' : 'Utworz przestrzen'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Members Dialog */}
      <Dialog
        open={!!membersWorkspace}
        onOpenChange={(open) => {
          if (!open) setMembersWorkspace(null);
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {isEN ? 'Manage Members' : 'Zarzadzaj czlonkami'} —{' '}
              {membersWorkspace?.name}
            </DialogTitle>
            <DialogDescription>
              {isEN
                ? 'Add or remove organization members from this workspace.'
                : 'Dodaj lub usun czlonkow organizacji z tej przestrzeni.'}
            </DialogDescription>
          </DialogHeader>

          <div className="py-2 max-h-[400px] overflow-y-auto">
            {orgMembersLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : orgMembers.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                {isEN
                  ? 'No organization members found.'
                  : 'Nie znaleziono czlonkow organizacji.'}
              </p>
            ) : (
              <div className="space-y-2">
                {orgMembers.map((member) => {
                  const isMember = isWorkspaceMember(member.id);
                  const isToggling =
                    addMemberMutation.isPending || removeMemberMutation.isPending;

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm truncate">
                            {member.name || member.email}
                          </span>
                          {isMember && (
                            <Badge variant="default" className="text-[10px] shrink-0">
                              {isEN ? 'Member' : 'Czlonek'}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </p>
                      </div>

                      <Button
                        variant={isMember ? 'outline' : 'default'}
                        size="sm"
                        disabled={isToggling}
                        onClick={() =>
                          isMember
                            ? handleRemoveMember(member.id)
                            : handleAddMember(member.id)
                        }
                        className="shrink-0"
                      >
                        {isMember ? (
                          <>
                            <UserMinus className="mr-1 h-3.5 w-3.5" />
                            {isEN ? 'Remove' : 'Usun'}
                          </>
                        ) : (
                          <>
                            <UserPlus className="mr-1 h-3.5 w-3.5" />
                            {isEN ? 'Add' : 'Dodaj'}
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setMembersWorkspace(null)}>
              {isEN ? 'Close' : 'Zamknij'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default WorkspacesPage;
