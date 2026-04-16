import { resolveMx } from 'dns/promises';
import type { MxRecord } from 'dns';

export async function validateMxRecord(domain: string): Promise<boolean> {
  try {
    const records: MxRecord[] = await resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}

export async function getMxRecords(domain: string): Promise<MxRecord[]> {
  try {
    return await resolveMx(domain);
  } catch {
    return [];
  }
}

export function extractDomain(url: string): string | null {
  try {
    const cleaned = url.trim().toLowerCase();
    if (!cleaned) return null;
    const withProtocol = cleaned.startsWith('http') ? cleaned : `https://${cleaned}`;
    const parsed = new URL(withProtocol);
    return parsed.hostname.replace(/^www\./, '') || null;
  } catch {
    return null;
  }
}
