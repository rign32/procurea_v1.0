import { Injectable, Logger, BadRequestException, ServiceUnavailableException } from '@nestjs/common';

// Mirror of landing/scripts/figma-to-md/magnet-config.mjs. Kept in sync by hand
// — the four magnet slugs change very rarely and the backend doesn't need to
// share the JS module from the landing package.
const MAGNETS: Array<{
    slug: string;
    title: string;
    figmaPageName: string;
    audience: string;
    category: string;
    isPublished: boolean; // visible on landing (has a resources.ts entry)
}> = [
    {
        slug: 'nearshore-migration-playbook',
        title: 'Nearshore Migration Playbook',
        figmaPageName: '01 — Nearshore Migration Playbook',
        audience: 'P1',
        category: 'supply-chain-strategy',
        isPublished: true,
    },
    {
        slug: 'supplier-risk-checklist-2026',
        title: 'Supplier Risk Checklist 2026',
        figmaPageName: '02 — Supplier Risk Checklist 2026',
        audience: 'P1',
        category: 'risk-management',
        isPublished: true,
    },
    {
        slug: 'ai-sourcing-buyers-guide',
        title: "AI Sourcing Buyer's Guide",
        figmaPageName: "03 — AI Sourcing Buyer's Guide",
        audience: 'P2',
        category: 'ai-and-automation',
        isPublished: false,
    },
    {
        slug: 'china-plus-one-playbook-2026',
        title: 'China+1 Strategy Playbook 2026',
        figmaPageName: '04 — China+1 Strategy Playbook 2026',
        audience: 'P1',
        category: 'supply-chain-strategy',
        isPublished: false,
    },
];

const FIGMA_FILE_KEY = 'EVi16MP6TUmTE9OQf6I7Ha';
const GITHUB_REPO = 'rign32/procurea_v1.0';
const WORKFLOW_FILE = 'sync-lead-magnets.yml';

export interface LeadMagnetEntry {
    slug: string;
    title: string;
    figmaPageName: string;
    audience: string;
    category: string;
    isPublished: boolean;
    figmaUrl: string;
    hostedPdf: { pl: string; en: string } | null;
    hostedMarkdown: { pl: string; en: string } | null;
}

@Injectable()
export class LeadMagnetsService {
    private readonly logger = new Logger(LeadMagnetsService.name);

    list(): LeadMagnetEntry[] {
        return MAGNETS.map((m) => ({
            slug: m.slug,
            title: m.title,
            figmaPageName: m.figmaPageName,
            audience: m.audience,
            category: m.category,
            isPublished: m.isPublished,
            figmaUrl: `https://www.figma.com/design/${FIGMA_FILE_KEY}/Procurea-Lead-Magnets`,
            hostedPdf: m.isPublished
                ? {
                      pl: `https://procurea.pl/resources/downloads/${m.slug}/${m.slug}.pdf`,
                      en: `https://procurea.io/resources/downloads/${m.slug}/${m.slug}.pdf`,
                  }
                : null,
            hostedMarkdown: m.isPublished
                ? {
                      pl: `https://procurea.pl/resources/downloads/${m.slug}/${m.slug}.md`,
                      en: `https://procurea.io/resources/downloads/${m.slug}/${m.slug}.md`,
                  }
                : null,
        }));
    }

    // Dispatches the GitHub Actions sync workflow.
    // slug=undefined or '' means "sync all 4 magnets".
    async dispatchSync(slug?: string): Promise<{ ok: true; runUrl: string }> {
        const pat = process.env.GITHUB_PAT;
        if (!pat) {
            throw new ServiceUnavailableException(
                'GITHUB_PAT env var is not set. Generate a fine-grained PAT for ' +
                `${GITHUB_REPO} with "Actions: write" permission and add it to the ` +
                'backend Cloud Function as GITHUB_PAT (Secret Manager).',
            );
        }
        if (slug && !MAGNETS.some((m) => m.slug === slug)) {
            throw new BadRequestException(
                `Unknown slug "${slug}". Known: ${MAGNETS.map((m) => m.slug).join(', ')}`,
            );
        }

        const url = `https://api.github.com/repos/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}/dispatches`;
        const body = JSON.stringify({
            ref: 'staging',
            inputs: { slug: slug ?? '' },
        });

        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Accept: 'application/vnd.github+json',
                Authorization: `Bearer ${pat}`,
                'X-GitHub-Api-Version': '2022-11-28',
                'Content-Type': 'application/json',
            },
            body,
        });

        if (res.status !== 204) {
            const text = await res.text().catch(() => '');
            this.logger.error(`GitHub dispatch failed: ${res.status} ${text.slice(0, 300)}`);
            throw new ServiceUnavailableException(
                `GitHub workflow dispatch failed (${res.status}). Check that the PAT has "Actions: write" on ${GITHUB_REPO} and FIGMA_TOKEN is set as a repo secret.`,
            );
        }

        // GitHub doesn't return the run id from /dispatches — link the user to the
        // workflow runs page so they can watch it.
        const runUrl = `https://github.com/${GITHUB_REPO}/actions/workflows/${WORKFLOW_FILE}`;
        this.logger.log(`Dispatched sync workflow (slug=${slug ?? 'ALL'}) → ${runUrl}`);
        return { ok: true, runUrl };
    }
}
