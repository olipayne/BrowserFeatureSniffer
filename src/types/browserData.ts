export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'unknown';

export interface VersionRange {
  min: number;
  max: number;
  constraints: VersionConstraint[];
}

export interface VersionConstraint {
  min: number;
  max: number;
  feature: string;
  reason: 'Feature present' | 'Feature removed' | 'Feature not yet added';
}

export interface BrowserSupport {
  version_added: string | boolean | null;
  version_removed?: string | null;
  flags?: Flag[];
  partial_implementation?: boolean;
}

interface Flag {
  type: string;
  name: string;
  value_to_set?: string;
}
