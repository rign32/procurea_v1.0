import { useEffect, useState } from 'react';
import {
    BookOpen,
    ExternalLink,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    Loader2,
    FileText,
    FileType,
    Globe,
} from 'lucide-react';
import {
    getLeadMagnets,
    syncLeadMagnet,
    type LeadMagnetEntry,
} from '../services/api';

type SyncState =
    | { kind: 'idle' }
    | { kind: 'pending'; slug: string | 'all'; startedAt: number }
    | { kind: 'success'; slug: string | 'all'; runUrl: string; at: number }
    | { kind: 'error'; slug: string | 'all'; message: string; at: number };

export default function LeadMagnetsPage() {
    const [magnets, setMagnets] = useState<LeadMagnetEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [sync, setSync] = useState<SyncState>({ kind: 'idle' });

    const load = async () => {
        try {
            setError(null);
            const res = await getLeadMagnets();
            setMagnets(res.data);
        } catch (e) {
            const message = e instanceof Error ? e.message : 'Failed to load lead magnets';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        load();
    }, []);

    const trigger = async (slug?: string) => {
        const target = slug ?? 'all';
        setSync({ kind: 'pending', slug: target, startedAt: Date.now() });
        try {
            const res = await syncLeadMagnet(slug);
            setSync({
                kind: 'success',
                slug: target,
                runUrl: res.data.runUrl,
                at: Date.now(),
            });
        } catch (e) {
            const message =
                (e as { response?: { data?: { message?: string } } })?.response?.data?.message ??
                (e instanceof Error ? e.message : 'Sync request failed');
            setSync({ kind: 'error', slug: target, message, at: Date.now() });
        }
    };

    const isBusy = sync.kind === 'pending';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-3">
                        <BookOpen size={24} className="text-accent" />
                        Lead Magnets
                    </h1>
                    <p className="mt-1 text-sm text-text-secondary">
                        Source of truth: Figma file{' '}
                        <code className="px-1.5 py-0.5 rounded bg-surface-raised text-xs font-mono">
                            EVi16MP6TUmTE9OQf6I7Ha
                        </code>
                        . Click <em>Sync</em> to pull the latest design from Figma → regenerate PDFs → commit to staging.
                    </p>
                </div>
                <button
                    onClick={() => trigger()}
                    disabled={isBusy}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-all disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                >
                    {isBusy && sync.slug === 'all' ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : (
                        <RefreshCw size={16} />
                    )}
                    Sync all from Figma
                </button>
            </div>

            {/* Sync feedback banner */}
            {sync.kind === 'pending' && (
                <Banner
                    tone="info"
                    icon={<Loader2 size={16} className="animate-spin" />}
                    title={
                        sync.slug === 'all'
                            ? 'Sync workflow dispatched for all 4 magnets…'
                            : `Sync workflow dispatched for ${sync.slug}…`
                    }
                    body="GitHub Actions is running. The new files will land on staging in ~3–5 min, then you merge staging → main to publish."
                />
            )}
            {sync.kind === 'success' && (
                <Banner
                    tone="success"
                    icon={<CheckCircle2 size={16} />}
                    title="Sync workflow triggered"
                    body={
                        <>
                            Watch progress on{' '}
                            <a href={sync.runUrl} target="_blank" rel="noreferrer" className="underline hover:text-text-primary">
                                GitHub Actions
                            </a>
                            . The bot will commit to <code className="font-mono text-xs">staging</code> when the sync produces changes; if Figma already matches the repo nothing is committed.
                        </>
                    }
                />
            )}
            {sync.kind === 'error' && (
                <Banner
                    tone="error"
                    icon={<AlertCircle size={16} />}
                    title={sync.slug === 'all' ? 'Failed to dispatch sync (all magnets)' : `Failed to dispatch sync for ${sync.slug}`}
                    body={sync.message}
                />
            )}

            {/* Loading / error / list */}
            {loading ? (
                <div className="text-text-secondary text-sm">Loading…</div>
            ) : error ? (
                <Banner tone="error" icon={<AlertCircle size={16} />} title="Couldn't load magnets" body={error} />
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {magnets.map((m) => (
                        <MagnetCard
                            key={m.slug}
                            magnet={m}
                            busy={isBusy && (sync.slug === 'all' || sync.slug === m.slug)}
                            onSync={() => trigger(m.slug)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

function MagnetCard({
    magnet,
    busy,
    onSync,
}: {
    magnet: LeadMagnetEntry;
    busy: boolean;
    onSync: () => void;
}) {
    return (
        <div className="border border-border rounded-xl bg-surface-raised p-5 hover:border-border-hover transition-colors">
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                    <div className="text-base font-semibold text-text-primary truncate">{magnet.title}</div>
                    <div className="text-xs text-text-muted font-mono mt-0.5 truncate">{magnet.slug}</div>
                </div>
                <span
                    className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${magnet.isPublished
                        ? 'bg-success/15 text-success'
                        : 'bg-warning/15 text-warning'
                        }`}
                >
                    {magnet.isPublished ? 'Published' : 'Local only'}
                </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary mb-4">
                <span className="font-mono">{magnet.audience}</span>
                <span>·</span>
                <span>{magnet.category}</span>
            </div>

            {/* Figma link */}
            <a
                href={magnet.figmaUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all mb-2"
            >
                <Globe size={14} className="text-accent" />
                <span className="flex-1 truncate font-mono">{magnet.figmaPageName}</span>
                <ExternalLink size={12} className="opacity-50" />
            </a>

            {/* Hosted URLs (PL + EN, if published) */}
            {magnet.hostedPdf ? (
                <div className="space-y-1.5 mb-4">
                    <HostedRow icon={<FileType size={13} />} label="PDF (PL)" url={magnet.hostedPdf.pl} />
                    <HostedRow icon={<FileType size={13} />} label="PDF (EN)" url={magnet.hostedPdf.en} />
                    <HostedRow icon={<FileText size={13} />} label="MD  (PL)" url={magnet.hostedMarkdown!.pl} />
                    <HostedRow icon={<FileText size={13} />} label="MD  (EN)" url={magnet.hostedMarkdown!.en} />
                </div>
            ) : (
                <div className="px-3 py-2 mb-4 rounded-lg bg-warning-muted text-xs text-warning">
                    Not yet wired into <code className="font-mono">resources.ts</code> — hosted URLs would 404. Sync produces local files only until the manifest entry is added.
                </div>
            )}

            <button
                onClick={onSync}
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border border-border text-sm font-medium text-text-primary hover:bg-surface-hover hover:border-border-hover transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {busy ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
                Sync this magnet from Figma
            </button>
        </div>
    );
}

function HostedRow({ icon, label, url }: { icon: React.ReactNode; label: string; url: string }) {
    return (
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface hover:bg-surface-hover transition-all"
        >
            <span className="text-text-muted group-hover:text-accent transition-colors">{icon}</span>
            <span className="text-[11px] font-mono text-text-muted shrink-0">{label}</span>
            <span className="text-xs text-text-secondary group-hover:text-text-primary truncate flex-1">
                {url.replace(/^https:\/\//, '')}
            </span>
            <ExternalLink size={11} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
        </a>
    );
}

function Banner({
    tone,
    icon,
    title,
    body,
}: {
    tone: 'info' | 'success' | 'error';
    icon: React.ReactNode;
    title: string;
    body: React.ReactNode;
}) {
    const cls =
        tone === 'success'
            ? 'border-success/30 bg-success/10 text-success'
            : tone === 'error'
              ? 'border-danger/30 bg-danger/10 text-danger'
              : 'border-accent/30 bg-accent-muted text-text-primary';
    return (
        <div className={`border rounded-lg px-4 py-3 ${cls}`}>
            <div className="flex items-start gap-3">
                <span className="mt-0.5 shrink-0">{icon}</span>
                <div className="min-w-0">
                    <div className="text-sm font-medium">{title}</div>
                    <div className="text-xs mt-0.5 text-text-secondary">{body}</div>
                </div>
            </div>
        </div>
    );
}
