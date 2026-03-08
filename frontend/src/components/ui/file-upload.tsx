import { useState, useRef, useCallback } from 'react';
import { Upload, X, FileIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import apiClient from '@/services/api.client';

interface UploadedFile {
    id: string;
    filename: string;
    url: string;
    size: number;
}

interface FileUploadProps {
    value: UploadedFile[];
    onChange: (files: UploadedFile[]) => void;
    className?: string;
    maxFiles?: number;
}

const ALLOWED = '.pdf,.dxf,.step,.stp,.jpg,.jpeg,.png';
const MAX_SIZE = 10 * 1024 * 1024;

function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({ value, onChange, className, maxFiles = 5 }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragOver, setDragOver] = useState(false);
    const [error, setError] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    const uploadFile = useCallback(async (file: File) => {
        if (file.size > MAX_SIZE) {
            setError(`Plik "${file.name}" jest za duży (max 10MB)`);
            return null;
        }
        const formData = new FormData();
        formData.append('file', file);
        try {
            const { data } = await apiClient.post('/uploads', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            return data as UploadedFile;
        } catch {
            setError(`Błąd przesyłania "${file.name}"`);
            return null;
        }
    }, []);

    const handleFiles = useCallback(async (files: FileList | File[]) => {
        setError('');
        const arr = Array.from(files);
        const remaining = maxFiles - value.length;
        if (arr.length > remaining) {
            setError(`Można dodać max ${remaining} plików`);
            return;
        }
        setUploading(true);
        const results = await Promise.all(arr.map(uploadFile));
        const uploaded = results.filter(Boolean) as UploadedFile[];
        if (uploaded.length > 0) {
            onChange([...value, ...uploaded]);
        }
        setUploading(false);
    }, [value, maxFiles, onChange, uploadFile]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const removeFile = (index: number) => {
        onChange(value.filter((_, i) => i !== index));
    };

    return (
        <div className={cn('space-y-3', className)}>
            {/* Drop zone */}
            <div
                className={cn(
                    'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 cursor-pointer transition-colors',
                    dragOver ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/50',
                    uploading && 'opacity-50 pointer-events-none',
                )}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
            >
                {uploading ? (
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                ) : (
                    <Upload className="h-8 w-8 text-muted-foreground" />
                )}
                <p className="text-sm text-muted-foreground mt-2">
                    {uploading ? 'Przesyłanie...' : 'Przeciągnij pliki lub kliknij aby wybrać'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                    PDF, DXF, STEP, JPG, PNG — max 10MB
                </p>
                <input
                    ref={inputRef}
                    type="file"
                    accept={ALLOWED}
                    multiple
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                    className="hidden"
                />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {/* File list */}
            {value.length > 0 && (
                <div className="space-y-2">
                    {value.map((file, i) => (
                        <div key={file.id} className="flex items-center gap-3 rounded-md border p-2 text-sm">
                            <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="flex-1 truncate">{file.filename}</span>
                            <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
                            <button type="button" onClick={() => removeFile(i)} className="text-muted-foreground hover:text-destructive">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
