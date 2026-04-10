import { useState } from 'react';
import { Key, Plus, Trash2, Loader2, Copy, Check, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from '@/hooks/useApiKeys';
import { isEN } from '@/i18n';

function formatDate(dateStr?: string): string {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString(isEN ? 'en-US' : 'pl-PL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function ApiKeysTab() {
  const { data: apiKeys, isLoading } = useApiKeys();
  const createMutation = useCreateApiKey();
  const deleteMutation = useDeleteApiKey();
  const { confirm, ConfirmDialogElement } = useConfirmDialog();

  const [createOpen, setCreateOpen] = useState(false);
  const [keyName, setKeyName] = useState('');
  const [expiresInDays, setExpiresInDays] = useState('');

  // State for showing the raw key after creation
  const [rawKeyResult, setRawKeyResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!keyName.trim()) {
      toast.error(isEN ? 'Name is required' : 'Nazwa jest wymagana');
      return;
    }

    try {
      const result = await createMutation.mutateAsync({
        name: keyName.trim(),
        expiresInDays: expiresInDays ? parseInt(expiresInDays) : undefined,
      });
      setRawKeyResult(result.rawKey);
      setKeyName('');
      setExpiresInDays('');
      toast.success(isEN ? 'API key created' : 'Klucz API utworzony');
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || (isEN ? 'Failed to create key' : 'Blad tworzenia klucza'));
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: isEN ? 'Delete API Key' : 'Usun klucz API',
      description: isEN
        ? `Are you sure you want to delete "${name}"? This action cannot be undone.`
        : `Czy na pewno chcesz usunac "${name}"? Tej operacji nie mozna cofnac.`,
      variant: 'destructive',
      confirmLabel: isEN ? 'Delete' : 'Usun',
    });
    if (!ok) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(isEN ? 'API key deleted' : 'Klucz API usuniety');
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || (isEN ? 'Failed to delete key' : 'Blad usuwania klucza'));
    }
  };

  const handleCopyKey = async () => {
    if (!rawKeyResult) return;
    try {
      await navigator.clipboard.writeText(rawKeyResult);
      setCopied(true);
      toast.success(isEN ? 'Key copied to clipboard' : 'Klucz skopiowany do schowka');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(isEN ? 'Failed to copy' : 'Blad kopiowania');
    }
  };

  const closeRawKeyDialog = () => {
    setRawKeyResult(null);
    setCopied(false);
    setCreateOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const keys = apiKeys ?? [];

  return (
    <div className="space-y-6">
      {ConfirmDialogElement}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{isEN ? 'API Keys' : 'Klucze API'}</CardTitle>
              <CardDescription className="mt-1">
                {isEN
                  ? 'Manage API keys for programmatic access to Procurea.'
                  : 'Zarzadzaj kluczami API do programistycznego dostepu do Procurea.'}
              </CardDescription>
            </div>
            <Button onClick={() => setCreateOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              {isEN ? 'Create Key' : 'Nowy klucz'}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {keys.length === 0 ? (
            <EmptyState
              icon={Key}
              title={isEN ? 'No API keys' : 'Brak kluczy API'}
              description={isEN ? 'Create your first API key to get started.' : 'Utworz pierwszy klucz API aby rozpoczac.'}
              className="min-h-[250px]"
              action={
                <Button onClick={() => setCreateOpen(true)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {isEN ? 'Create Key' : 'Nowy klucz'}
                </Button>
              }
            />
          ) : (
            <motion.div
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
              initial="hidden"
              animate="show"
              className="space-y-3"
            >
              {keys.map((key) => (
                <motion.div
                  key={key.id}
                  variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{key.name}</span>
                      <Badge variant={key.enabled ? 'default' : 'secondary'} className="text-[10px]">
                        {key.enabled ? (isEN ? 'Active' : 'Aktywny') : (isEN ? 'Disabled' : 'Nieaktywny')}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="font-mono">{key.prefix}...</span>
                      <span>{isEN ? 'Created' : 'Utworzono'}: {formatDate(key.createdAt)}</span>
                      <span>{isEN ? 'Last used' : 'Ostatnie uzycie'}: {formatDate(key.lastUsedAt)}</span>
                      {key.expiresAt && (
                        <span>{isEN ? 'Expires' : 'Wygasa'}: {formatDate(key.expiresAt)}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => handleDelete(key.id, key.name)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>

      {/* Create API Key Dialog */}
      <Dialog open={createOpen && !rawKeyResult} onOpenChange={(open) => { if (!open) { setCreateOpen(false); setKeyName(''); setExpiresInDays(''); } }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEN ? 'Create API Key' : 'Utworz klucz API'}</DialogTitle>
            <DialogDescription>
              {isEN
                ? 'Give your key a descriptive name to remember its purpose.'
                : 'Nadaj kluczowi opisowa nazwe, aby pamietac jego przeznaczenie.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{isEN ? 'Key Name' : 'Nazwa klucza'}</Label>
              <Input
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                placeholder={isEN ? 'e.g. Production integration' : 'np. Integracja produkcyjna'}
              />
            </div>

            <div className="space-y-2">
              <Label>
                {isEN ? 'Expiration (days)' : 'Waznosc (dni)'}
                {' '}<span className="text-muted-foreground text-xs">({isEN ? 'optional, no expiry if empty' : 'opcjonalne, bez wygasniecia jesli puste'})</span>
              </Label>
              <Input
                type="number"
                min="1"
                value={expiresInDays}
                onChange={(e) => setExpiresInDays(e.target.value)}
                placeholder={isEN ? 'e.g. 90' : 'np. 90'}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); setKeyName(''); setExpiresInDays(''); }}>
              {isEN ? 'Cancel' : 'Anuluj'}
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || !keyName.trim()}
            >
              {createMutation.isPending
                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{isEN ? 'Creating...' : 'Tworzenie...'}</>
                : <>{isEN ? 'Create' : 'Utworz'}</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Raw Key Display Dialog (shown ONCE after creation) */}
      <Dialog open={!!rawKeyResult} onOpenChange={(open) => { if (!open) closeRawKeyDialog(); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {isEN ? 'Save Your API Key' : 'Zapisz swoj klucz API'}
            </DialogTitle>
            <DialogDescription>
              {isEN
                ? 'This is the only time you will see the full key. Copy it now and store it securely.'
                : 'To jedyna okazja aby zobaczyc pelny klucz. Skopiuj go teraz i przechowuj bezpiecznie.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="flex items-center gap-2">
              <code className="flex-1 block p-3 bg-muted rounded-md text-sm font-mono break-all select-all">
                {rawKeyResult}
              </code>
              <Button variant="outline" size="icon" onClick={handleCopyKey} className="shrink-0">
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>

            <div className="flex items-start gap-2 p-3 rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {isEN
                  ? 'You will not be able to see this key again after closing this dialog. If you lose it, you will need to create a new one.'
                  : 'Nie bedziesz mogl zobaczyc tego klucza ponownie po zamknieciu tego okna. Jesli go zgubisz, bedziesz musial utworzyc nowy.'}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={closeRawKeyDialog}>
              {isEN ? 'Done' : 'Gotowe'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ApiKeysTab;
