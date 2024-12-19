import { BrowserSupport } from '@/types/browserData';
import { ProcessedSupport } from '@/types/feature';

export function parseVersionString(version: string | boolean | null | undefined): number | null {
  if (!version) return null;
  if (version === true) return 1;
  if (typeof version !== 'string') return null;
  
  // Handle "≤" prefix
  if (version.startsWith('≤')) {
    return parseFloat(version.slice(1));
  }
  
  // Handle normal version numbers
  const parsed = parseFloat(version);
  return isNaN(parsed) ? null : parsed;
}

export function processSupport(support: BrowserSupport | BrowserSupport[] | undefined): ProcessedSupport[] {
  if (!support) return [];

  // Handle array of support data
  if (Array.isArray(support)) {
    return support
      .map(entry => ({
        added: parseVersionString(entry.version_added),
        removed: parseVersionString(entry.version_removed),
        flags: entry.flags || [],
        partial_implementation: entry.partial_implementation || false
      }))
      .filter(v => v.added !== null || v.removed !== null);
  }

  // Handle single support entry
  return [{
    added: parseVersionString(support.version_added),
    removed: parseVersionString(support.version_removed),
    flags: support.flags || [],
    partial_implementation: support.partial_implementation || false
  }];
}

export function getMinVersion(support: BrowserSupport | BrowserSupport[] | undefined): number | null {
  if (!support) return null;
  
  const processed = processSupport(support);
  if (processed.length === 0) return null;
  
  // Find the earliest version_added among all entries
  const versions = processed
    .map(entry => entry.added)
    .filter((v): v is number => v !== null);
  
  return versions.length > 0 ? Math.min(...versions) : null;
}