import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Download,
  Trash2,
  Upload,
  Plus,
  Loader2,
  File,
  FileImage,
  X,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { t } from '@/i18n';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TagInput } from '@/components/ui/tag-input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { documentsService } from '@/services/documents.service';
import type { DocumentRecord as _DocumentRecord } from '@/services/documents.service';

const CATEGORY_OPTIONS = [
  { value: 'certificate', label: t.documents.categories.certificate },
  { value: 'drawing', label: t.documents.categories.drawing },
  { value: 'nda', label: t.documents.categories.nda },
  { value: 'spec', label: t.documents.categories.spec },
  { value: 'quality_report', label: t.documents.categories.quality_report },
  { value: 'contract', label: t.documents.categories.contract },
  { value: 'other', label: t.documents.categories.other },
];

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getCategoryLabel(category: string): string {
  const cat = CATEGORY_OPTIONS.find((c) => c.value === category);
  return cat ? cat.label : category;
}

interface SupplierDocumentsProps {
  supplierId: string;
}

export function SupplierDocuments({ supplierId }: SupplierDocumentsProps) {
  const queryClient = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);

  const { data: result, isLoading } = useQuery({
    queryKey: ['documents', { entityType: 'supplier', entityId: supplierId }],
    queryFn: () =>
      documentsService.list({
        entityType: 'supplier',
        entityId: supplierId,
        limit: 100,
      }),
  });

  const documents = result?.data || [];

  const deleteMutation = useMutation({
    mutationFn: (id: string) => documentsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success(t.documents.deleteSuccess);
    },
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t.documents.supplierDocuments}
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setUploadOpen(true)}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            {t.documents.addSupplierDoc}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t.documents.noSupplierDocs}
          </p>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center gap-3 rounded-md border p-2.5 text-sm group"
              >
                <div className="w-8 h-8 rounded bg-muted flex items-center justify-center shrink-0">
                  {doc.mimeType.startsWith('image/') ? (
                    <FileImage className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <File className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {doc.originalName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {formatBytes(doc.sizeBytes)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(doc.createdAt)}
                    </span>
                    {doc.category && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {getCategoryLabel(doc.category)}
                      </Badge>
                    )}
                    {doc.version > 1 && (
                      <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                        v{doc.version}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a
                    href={documentsService.getDownloadUrl(doc)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => deleteMutation.mutate(doc.id)}
                    disabled={deleteMutation.isPending}
                    className="p-1.5 rounded hover:bg-accent text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      {/* Upload Dialog for this supplier */}
      <SupplierUploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        supplierId={supplierId}
      />
    </Card>
  );
}

/* --- Supplier-specific upload dialog --- */

function SupplierUploadDialog({
  open,
  onOpenChange,
  supplierId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierId: string;
}) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [description, setDescription] = useState('');

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('No file');
      return documentsService.upload({
        file,
        category: category || undefined,
        tags: tags.length > 0 ? tags : undefined,
        description: description || undefined,
        entityType: 'supplier',
        entityId: supplierId,
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

  const resetForm = () => {
    setFile(null);
    setCategory('');
    setTags([]);
    setDescription('');
  };

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
          <DialogTitle>{t.documents.addSupplierDoc}</DialogTitle>
          <DialogDescription>
            PDF, DXF, STEP, JPG, PNG -- max 10MB
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File input */}
          <div
            className="flex items-center justify-center rounded-lg border-2 border-dashed p-4 cursor-pointer hover:border-primary/50 transition-colors"
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

export default SupplierDocuments;
