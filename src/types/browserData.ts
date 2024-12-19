export type BrowserType = 'chrome' | 'firefox' | 'safari' | 'unknown';

export interface VersionRange {
  min: number;
  max: number;
  constraints: VersionConstraint[];
}

export type VersionConstraintReason = 'Feature present' | 'Feature removed' | 'Feature not yet added';

export interface VersionConstraint {
  min: number;
  max: number;
  feature: string;
  reason: VersionConstraintReason;
}

export interface BrowserSupport {
  version_added: string | boolean | null;
  version_removed?: string | null;
  flags?: BrowserFlag[];
  partial_implementation?: boolean;
}

export interface BrowserFlag {
  type: string;
  name: string;
  value_to_set?: string;
}