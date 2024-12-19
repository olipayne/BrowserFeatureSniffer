import { Feature, CompatData } from '@/types/feature';

export function generateFeatureTest(path: string): () => boolean {
  const parts = path.split('.');
  return () => {
    try {
      let obj: any = window;
      for (const part of parts) {
        if (part === 'constructor') return false; // Skip dangerous properties
        obj = obj[part];
        if (obj === undefined) return false;
      }
      return true;
    } catch {
      return false;
    }
  };
}

export function flattenCompatData(obj: Record<string, CompatData>, path: string = ''): Feature[] {
  const features: Feature[] = [];

  for (const [key, value] of Object.entries(obj)) {
    const newPath = path ? `${path}.${key}` : key;

    if (value && value.__compat) {
      const support = value.__compat.support;
      if (support) {
        features.push({
          path: newPath,
          support,
          name: value.__compat.name || key,
          mdn_url: value.__compat?.mdn_url,
        });
      }
    }

    if (value && typeof value === 'object' && !value.__compat) {
      features.push(...flattenCompatData(value as Record<string, CompatData>, newPath));
    }
  }

  return features;
}