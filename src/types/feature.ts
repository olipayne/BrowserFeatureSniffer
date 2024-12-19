import { BrowserType, BrowserSupport, BrowserFlag } from './browserData';

export interface Feature {
  path: string;
  support: Record<BrowserType, BrowserSupport | BrowserSupport[]>;
  name: string;
  mdn_url?: string;
}

export interface ProcessedSupport {
  added: number | null;
  removed: number | null;
  flags: BrowserFlag[];
  partial_implementation: boolean;
}

export interface FeatureTest {
  test: () => boolean;
  support: Record<string, BrowserSupport | BrowserSupport[]>;
  name: string;
  mdn_url?: string;
}

export interface CategoryData {
  total: number;
  supported: number;
  features: CategoryFeature[];
}

export interface CategoryFeature {
  path: string;
  supported: boolean;
  data: FeatureTest;
}

// Type for compatibility data
export interface CompatData {
  __compat?: {
    support: Record<string, BrowserSupport | BrowserSupport[]>;
    name?: string;
    mdn_url?: string;
  };
  [key: string]: any;
}