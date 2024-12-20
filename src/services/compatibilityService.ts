import { BrowserType, VersionRange, VersionConstraint, VersionConstraintReason } from '@/types/browserData';
import { FeatureTest } from '@/types/feature';
import { flattenCompatData, generateFeatureTest } from '@/utils/featureDetection';
import { getCurrentBrowserVersion } from '@/utils/browserDetection';
import { processSupport } from '@/utils/versionParsing';

export class CompatibilityService {
  private featureTests: Record<string, FeatureTest> = {};
  private results: Record<string, boolean> = {};

  async initialize(): Promise<void> {
    try {
      const response = await fetch('https://unpkg.com/@mdn/browser-compat-data/data.json');
      const bcd = await response.json();

      // Process API features
      const apiFeatures = flattenCompatData(bcd.api).filter((feature) => {
        const depth = feature.path.split('.').length;
        return depth < 4 && !feature.path.includes('constructor');
      });

      // Generate tests for each feature
      apiFeatures.forEach((feature) => {
        this.featureTests[feature.path] = {
          test: generateFeatureTest(feature.path),
          support: feature.support,
          name: feature.name,
          mdn_url: feature.mdn_url,
        };
      });

      // Run all tests
      for (const [feature, data] of Object.entries(this.featureTests)) {
        this.results[feature] = data.test();
      }
    } catch (error) {
      console.error('Error initializing compatibility service:', error);
      throw error;
    }
  }

  estimateVersionRange(browserType: BrowserType): VersionRange {
    const maxVersion = getCurrentBrowserVersion(browserType);
    const versionConstraints: VersionConstraint[] = [];

    for (const [feature, supported] of Object.entries(this.results)) {
      const featureData = this.featureTests[feature];
      if (!featureData.support[browserType]) continue;

      const supportData = processSupport(featureData.support[browserType]);
      if (!supportData.length) continue;

      for (const version of supportData) {
        if (supported) {
          if (version.added !== null) {
            versionConstraints.push({
              min: version.added,
              max: version.removed || maxVersion,
              feature,
              reason: 'Feature present' as VersionConstraintReason,
            });
          }
        } else {
          if (version.added !== null && version.removed !== null) {
            versionConstraints.push({
              min: version.removed,
              max: maxVersion,
              feature,
              reason: 'Feature removed' as VersionConstraintReason,
            });
          } else if (version.added !== null) {
            versionConstraints.push({
              min: 0,
              max: version.added,
              feature,
              reason: 'Feature not yet added' as VersionConstraintReason,
            });
          }
        }
      }
    }

    // Find strictly overlapping version ranges
    let finalMin = 0;
    let finalMax = maxVersion;
    const strictRanges: VersionConstraint[] = [];

    // First, sort constraints by min version
    versionConstraints.sort((a, b) => a.min - b.min);

    // Find overlapping constraints that create strict version requirements
    versionConstraints.forEach((constraint) => {
      if (constraint.min === constraint.max) {
        strictRanges.push(constraint);
      } else if (
        constraint.reason === 'Feature present' &&
        constraint.min > finalMin
      ) {
        finalMin = constraint.min;
        strictRanges.push(constraint);
      } else if (
        constraint.reason === 'Feature not yet added' &&
        constraint.max < finalMax
      ) {
        finalMax = constraint.max;
        strictRanges.push(constraint);
      }
    });

    // If we have any exact version matches, use them to narrow the range
    const exactVersions = strictRanges.filter((r) => r.min === r.max);
    if (exactVersions.length > 0) {
      const version = exactVersions[0].min;
      finalMin = version;
      finalMax = version;
    } else {
      // Ensure min <= max
      if (finalMin > finalMax) {
        const temp = finalMin;
        finalMin = finalMax;
        finalMax = temp;
      }
    }

    return {
      min: Math.floor(finalMin),
      max: Math.ceil(finalMax),
      constraints: versionConstraints,
    };
  }

  getFeatureTests(): Record<string, FeatureTest> {
    return this.featureTests;
  }

  getResults(): Record<string, boolean> {
    return this.results;
  }

  getCategorizedFeatures() {
    const categories: Record<string, {
      total: number;
      supported: number;
      features: Array<{ path: string; supported: boolean; data: FeatureTest }>;
    }> = {};

    Object.entries(this.featureTests).forEach(([path, data]) => {
      const category = this.categorizeFeature(path);

      if (!categories[category]) {
        categories[category] = {
          total: 0,
          supported: 0,
          features: [],
        };
      }

      categories[category].total++;
      if (this.results[path]) {
        categories[category].supported++;
      }

      categories[category].features.push({
        path,
        supported: this.results[path],
        data,
      });
    });

    return categories;
  }

  private categorizeFeature(path: string): string {
    if (path.includes('CSS')) return 'CSS & Styling';
    if (path.includes('HTML')) return 'HTML Features';
    if (path.includes('Worker')) return 'Web Workers';
    if (path.includes('WebGL') || path.includes('Canvas') || path.includes('XR')) {
      return 'Graphics & XR';
    }
    if (path.includes('Media') || path.includes('Audio') || path.includes('Video')) {
      return 'Media Features';
    }
    if (path.includes('Storage') || path.includes('Cache') || path.includes('DB')) {
      return 'Storage & Caching';
    }
    if (path.includes('Network') || path.includes('Fetch') || path.includes('XHR')) {
      return 'Networking';
    }
    if (path.includes('Crypto') || path.includes('Security')) {
      return 'Security & Crypto';
    }
    if (path.split('.')[0] === 'api') return 'Web APIs';
    
    return 'Other Features';
  }
}