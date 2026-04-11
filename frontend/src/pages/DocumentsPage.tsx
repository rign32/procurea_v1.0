import { useState, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Pencil,
  History,
  Loader2,
  Search,
  FileImage,
  File,
  X,
  Plus,
  ChevronDown,
  ExternalLink,
  Eye,
} from 'lucide-react';
import { toast } from 'sonner';
import { t } from '@/i18n';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { TagInput } from '@/components/ui/tag-input';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { documentsService } from '@/services/documents.service';
import type { DocumentRecord } from '@/services/documents.service';

const CATEGORY_OPTIONS = [
  { value: 'certificate', label: t.documents.categories.certificate },
  { value: 'drawing', label: t.documents.categories.drawing },
  { value: 'nda', label: t.documents.categories.nda },
  { value: 'spec', label: t.documents.categories.spec },
  { value: 'quality_report', label: t.documents.categories.quality_report },
  { value: 'contract', label: t.documents.categories.contract },
  { value: 'other', label: t.documents.categories.other },
];

const ENTITY_TYPE_OPTIONS = [
  { value: 'supplier', label: t.documents.entityTypes.supplier },
  { value: 'rfq', label: t.documents.entityTypes.rfq },
  { value: 'offer', label: t.documents.entityTypes.offer },
  { value: 'campaign', label: t.documents.entityTypes.campaign },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getCategoryLabel(category: string): string {
  const cat = CATEGORY_OPTIONS.find((c) => c.value === category);
  return cat ? cat.label : category;
}

function getFileIcon(mimeType: string, className?: string) {
  if (mimeType.startsWith('image/')) return <FileImage className={className} />;
  return <File className={className} />;
}

function getCategoryColor(category?: string): string {
  switch (category) {
    case 'certificate':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'drawing':
      return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'nda':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'spec':
      return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'quality_report':
      return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'contract':
      return 'bg-indigo-100 text-indigo-700 border-indigo-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function DocumentsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [page, setPage] = useState(1);

  // Dialogs
  const [uploadOpen, setUploadOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<DocumentRecord | null>(null);
  const [deleteDoc, setDeleteDoc] = useState<DocumentRecord | null>(null);
  const [versionsDoc, setVersionsDoc] = useState<DocumentRecord | null>(null);
  const [versionUploadDoc, setVersionUploadDoc] = useState<DocumentRecord | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);

  const { data: result, isLoading } = useQuery({
    queryKey: ['documents', { search, categoryFilter, entityTypeFilter, page }],
    queryFn: () =>
      documentsService.list({
        search: search || undefined,
        category: categoryFilter || undefined,
        entityType: entityTypeFilter || undefined,
        page,
        limit: 50,
      }),
  });

  const documents = result?.data || [];
  const total = result?.total || 0;

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success(t.documents.deleteSuccess);
      setDeleteDoc(null);
    },
    onError: () => {
      toast.error(t.errors.generic);
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t.documents.title}</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t.documents.subtitle}
          </p>
        </div>
        <Button onClick={() => setUploadOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t.documents.upload}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder={t.documents.searchPlaceholder}
            className="pl-9"
          />
        </div>
        <div className="relative">
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-md border border-input bg-background px-3 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
          >
            <option value="">{t.documents.filterAll} - {t.documents.category}</option>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={entityTypeFilter}
            onChange={(e) => { setEntityTypeFilter(e.target.value); setPage(1); }}
            className="h-10 rounded-md border border-input bg-background px-3 pr-8 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring appearance-none cursor-pointer"
          >
            <option value="">{t.documents.filterAll} - {t.documents.entityLink}</option>
            {ENTITY_TYPE_OPTIONS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : documents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={t.documents.noDocuments}
          description={t.documents.noDocumentsDesc}
          action={
            <Button onClick={() => setUploadOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              {t.documents.upload}
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onPreview={() => setPreviewDoc(doc)}
                onEdit={() => setEditDoc(doc)}
                onDelete={() => setDeleteDoc(doc)}
                onVersions={() => setVersionsDoc(doc)}
                onUploadVersion={() => setVersionUploadDoc(doc)}
              />
            ))}
          </div>

          {/* Pagination */}
          {total > 50 && (
            <div className="flex justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t.common.previous}
              </Button>
              <span className="flex items-center text-sm text-muted-foreground px-3">
                {page} / {Math.ceil(total / 50)}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= Math.ceil(total / 50)}
                onClick={() => setPage((p) => p + 1)}
              >
                {t.common.nextPage}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Upload Dialog */}
      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
      />

      {/* Edit Metadata Dialog */}
      {editDoc && (
        <EditMetadataDialog
          doc={editDoc}
          onClose={() => setEditDoc(null)}
        />
      )}

      {/* Delete Confirm Dialog */}
      {deleteDoc && (
        <Dialog open={true} onOpenChange={() => setDeleteDoc(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t.documents.deleteDocument}</DialogTitle>
              <DialogDescription>
                {t.documents.deleteConfirm}
              </DialogDescription>
            </DialogHeader>
            <p className="text-sm font-medium">{deleteDoc.originalName}</p>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDoc(null)}>
                {t.common.cancel}
              </Button>
              <Button
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(deleteDoc.id)}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {t.common.delete}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Versions Dialog */}
      {versionsDoc && (
        <VersionsDialog
          doc={versionsDoc}
          onClose={() => setVersionsDoc(null)}
        />
      )}

      {/* Version Upload Dialog */}
      {versionUploadDoc && (
        <VersionUploadDialog
          doc={versionUploadDoc}
          onClose={() => setVersionUploadDoc(null)}
        />
      )}

      {/* Preview Dialog */}
      {previewDoc && (
        <PreviewDialog
          doc={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
}

/* ---------- Document Card ---------- */

function DocumentCard({
  doc,
  onPreview,
  onEdit,
  onDelete,
  onVersions,
  onUploadVersion,
}: {
  doc: DocumentRecord;
  onPreview: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onVersions: () => void;
  onUploadVersion: () => void;
}) {
  return (
    <Card className="group hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-3">
        {/* File icon + name — click opens preview */}
        <div className="flex items-start gap-3 cursor-pointer" onClick={onPreview}>
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
            {getFileIcon(doc.mimeType, "h-5 w-5 text-muted-foreground")}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate hover:text-primary transition-colors" title={doc.originalName}>
              {doc.originalName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-muted-foreground">
                {formatBytes(doc.sizeBytes)}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatDate(doc.createdAt)}
              </span>
              {doc.version > 1 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  v{doc.version}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Category + tags */}
        <div className="flex flex-wrap gap-1.5">
          {doc.category && (
            <span
              className={`inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium ${getCategoryColor(doc.category)}`}
            >
              {getCategoryLabel(doc.category)}
            </span>
          )}
          {Array.isArray(doc.tags) &&
            doc.tags.map((tag: string, i: number) => (
              <Badge key={`${tag}-${i}`} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
        </div>

        {/* Description */}
        {doc.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {doc.description}
          </p>
        )}

        {/* Entity link */}
        {doc.entityType && (
          <div className="text-xs text-muted-foreground">
            {t.documents.entityLink}:{' '}
            <span className="font-medium">
              {ENTITY_TYPE_OPTIONS.find((e) => e.value === doc.entityType)?.label || doc.entityType}
            </span>
          </div>
        )}

        {/* Actions — with tooltips and text labels */}
        <TooltipProvider delayDuration={300}>
          <div className="flex flex-wrap gap-1.5 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href={documentsService.getDownloadUrl(doc)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent transition-colors"
                >
                  <Download className="h-3 w-3" />
                  {t.documents.download}
                </a>
              </TooltipTrigger>
              <TooltipContent>{t.documents.tooltipDownload}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onEdit}
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent transition-colors"
                >
                  <Pencil className="h-3 w-3" />
                  {t.documents.tooltipEdit}
                </button>
              </TooltipTrigger>
              <TooltipContent>{t.documents.tooltipEdit}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onUploadVersion}
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent transition-colors"
                >
                  <Upload className="h-3 w-3" />
                  {t.documents.tooltipNewVersion}
                </button>
              </TooltipTrigger>
              <TooltipContent>{t.documents.tooltipNewVersion}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onVersions}
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent transition-colors"
                >
                  <History className="h-3 w-3" />
                  {t.documents.tooltipVersionHistory}
                </button>
              </TooltipTrigger>
              <TooltipContent>{t.documents.tooltipVersionHistory}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onDelete}
                  className="inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs hover:bg-accent text-destructive transition-colors ml-auto"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </TooltipTrigger>
              <TooltipContent>{t.documents.tooltipDelete}</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

/* ---------- Upload Dialog ---------- */

function UploadDialog({
  open,
  onOpenChange,
  defaultEntityType,
  defaultEntityId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultEntityType?: string;
  defaultEntityId?: string;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');
  const [entityType, setEntityType] = useState(defaultEntityType || '');
  const [entityId, setEntityId] = useState(defaultEntityId || '');

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('No file');
      return documentsService.upload({
        file,
        category: category || undefined,
        tags: tags.length > 0 ? tags : undefined,
        description: description || undefined,
        entityType: entityType || undefined,
        entityId: entityId || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success(t.documents.uploadSuccess);
      resetForm();
      onOpenChange(false);
    },
    onError: () => {
      toast.error(t.documents.uploadError);
    },
  });

  const resetForm = useCallback(() => {
    setFile(null);
    setCategory('');
    setTags([]);
    setDescription('');
    setEntityType(defaultEntityType || '');
    setEntityId(defaultEntityId || '');
  }, [defaultEntityType, defaultEntityId]);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.documents.uploadDialog}</DialogTitle>
          <DialogDescription>
            PDF, DXF, STEP, JPG, PNG -- max 10MB
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File input */}
          <div>
            <label className="text-sm font-medium">{t.documents.fileName}</label>
            <div
              className="mt-1 flex items-center justify-center rounded-lg border-2 border-dashed p-4 cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              {file ? (
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <span className="text-sm truncate max-w-[200px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <Upload className="h-6 w-6 text-muted-foreground mx-auto" />
                  <p className="text-sm text-muted-foreground mt-1">
                    Click to select file
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.dxf,.step,.stp,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) setFile(e.target.files[0]);
                }}
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="text-sm font-medium">{t.documents.category}</label>
            <div className="relative mt-1">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 pr-8 text-sm appearance-none cursor-pointer"
              >
                <option value="">--</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-sm font-medium">{t.documents.tags}</label>
            <TagInput
              value={tags}
              onChange={setTags}
              placeholder={t.documents.tagsPlaceholder}
              className="mt-1"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium">{t.documents.description}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.documents.descriptionPlaceholder}
              rows={2}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {/* Entity link */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">{t.documents.entityType} <span className="text-muted-foreground font-normal">({t.common.optional})</span></label>
              <div className="relative mt-1">
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 pr-8 text-sm appearance-none cursor-pointer"
                >
                  <option value="">--</option>
                  {ENTITY_TYPE_OPTIONS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t.documents.entityId} <span className="text-muted-foreground font-normal">({t.common.optional})</span></label>
              <Input
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                placeholder="ID"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              resetForm();
              onOpenChange(false);
            }}
          >
            {t.common.cancel}
          </Button>
          <Button
            disabled={!file || uploadMutation.isPending}
            onClick={() => uploadMutation.mutate()}
          >
            {uploadMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            {t.documents.upload}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Edit Metadata Dialog ---------- */

function EditMetadataDialog({
  doc,
  onClose,
}: {
  doc: DocumentRecord;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState(doc.category || '');
  const [tags, setTags] = useState<string[]>(
    Array.isArray(doc.tags) ? doc.tags : [],
  );
  const [description, setDescription] = useState(doc.description || '');
  const [entityType, setEntityType] = useState(doc.entityType || '');
  const [entityId, setEntityId] = useState(doc.entityId || '');

  const updateMutation = useMutation({
    mutationFn: () =>
      documentsService.updateMetadata(doc.id, {
        category: category || undefined,
        tags,
        description: description || undefined,
        entityType: entityType || undefined,
        entityId: entityId || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success(t.documents.updateSuccess);
      onClose();
    },
    onError: () => {
      toast.error(t.errors.generic);
    },
  });

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.documents.editMetadata}</DialogTitle>
          <DialogDescription>{doc.originalName}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">{t.documents.category}</label>
            <div className="relative mt-1">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 pr-8 text-sm appearance-none cursor-pointer"
              >
                <option value="">--</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">{t.documents.tags}</label>
            <TagInput
              value={tags}
              onChange={setTags}
              placeholder={t.documents.tagsPlaceholder}
              className="mt-1"
            />
          </div>

          <div>
            <label className="text-sm font-medium">{t.documents.description}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.documents.descriptionPlaceholder}
              rows={2}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">{t.documents.entityType}</label>
              <div className="relative mt-1">
                <select
                  value={entityType}
                  onChange={(e) => setEntityType(e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 pr-8 text-sm appearance-none cursor-pointer"
                >
                  <option value="">--</option>
                  {ENTITY_TYPE_OPTIONS.map((e) => (
                    <option key={e.value} value={e.value}>
                      {e.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">{t.documents.entityId}</label>
              <Input
                value={entityId}
                onChange={(e) => setEntityId(e.target.value)}
                placeholder="ID"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button
            disabled={updateMutation.isPending}
            onClick={() => updateMutation.mutate()}
          >
            {updateMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            {t.common.save}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Versions Dialog ---------- */

function VersionsDialog({
  doc,
  onClose,
}: {
  doc: DocumentRecord;
  onClose: () => void;
}) {
  const { data: versions, isLoading } = useQuery({
    queryKey: ['document-versions', doc.id],
    queryFn: () => documentsService.getVersions(doc.id),
  });

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t.documents.versions}</DialogTitle>
          <DialogDescription>{doc.originalName}</DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : versions && versions.length > 0 ? (
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {versions.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">v{v.version}</span>
                    {v.isLatest && (
                      <Badge variant="default" className="text-[10px]">
                        Latest
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {v.originalName} - {formatBytes(v.sizeBytes)} - {formatDate(v.createdAt)}
                  </p>
                </div>
                <a
                  href={documentsService.getDownloadUrl(v)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-muted-foreground hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t.documents.version} 1
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t.common.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Version Upload Dialog ---------- */

function VersionUploadDialog({
  doc,
  onClose,
}: {
  doc: DocumentRecord;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('No file');
      return documentsService.uploadNewVersion(doc.id, file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success(t.documents.versionSuccess);
      onClose();
    },
    onError: () => {
      toast.error(t.documents.uploadError);
    },
  });

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t.documents.uploadVersion}</DialogTitle>
          <DialogDescription>
            {doc.originalName} (v{doc.version})
          </DialogDescription>
        </DialogHeader>

        <div
          className="flex items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          {file ? (
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm truncate max-w-[200px]">{file.name}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
              >
                <X className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="h-6 w-6 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground mt-1">
                Click to select file
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.dxf,.step,.stp,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) setFile(e.target.files[0]);
            }}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t.common.cancel}
          </Button>
          <Button
            disabled={!file || uploadMutation.isPending}
            onClick={() => uploadMutation.mutate()}
          >
            {uploadMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            )}
            {t.documents.upload}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Preview Dialog ---------- */

function PreviewDialog({
  doc,
  onClose,
}: {
  doc: DocumentRecord;
  onClose: () => void;
}) {
  const downloadUrl = documentsService.getDownloadUrl(doc);
  const isImage = doc.mimeType.startsWith('image/');
  const isPdf = doc.mimeType === 'application/pdf';

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className={isImage ? 'max-w-2xl' : 'max-w-md'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            {t.documents.preview}
          </DialogTitle>
          <DialogDescription>{doc.originalName}</DialogDescription>
        </DialogHeader>

        {isImage ? (
          <div className="flex justify-center bg-muted/30 rounded-lg p-2 max-h-[60vh] overflow-auto">
            <img
              src={downloadUrl}
              alt={doc.originalName}
              className="max-w-full max-h-[55vh] object-contain rounded"
            />
          </div>
        ) : isPdf ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-md border p-4">
              <FileText className="h-8 w-8 text-red-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.originalName}</p>
                <p className="text-xs text-muted-foreground">{formatBytes(doc.sizeBytes)}</p>
              </div>
            </div>
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 w-full"
            >
              <Button className="w-full" variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                {t.documents.openInNewTab}
              </Button>
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-md border p-4">
              {getFileIcon(doc.mimeType, 'h-8 w-8 text-muted-foreground shrink-0')}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.originalName}</p>
                <div className="text-xs text-muted-foreground space-y-0.5 mt-1">
                  <p>{t.documents.type}: {doc.mimeType}</p>
                  <p>{t.documents.size}: {formatBytes(doc.sizeBytes)}</p>
                  <p>{t.documents.uploadedAt}: {formatDate(doc.createdAt)}</p>
                  {doc.version > 1 && <p>{t.documents.version}: {doc.version}</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              {t.documents.download}
            </Button>
          </a>
          <Button variant="outline" onClick={onClose}>
            {t.common.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { UploadDialog };
export default DocumentsPage;
