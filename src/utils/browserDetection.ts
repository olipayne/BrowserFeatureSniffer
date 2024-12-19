import { BrowserType } from '@/types/browserData';

export function detectBrowserType(): BrowserType {
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('firefox')) return 'firefox';
  if (ua.includes('safari') && !ua.includes('chrome')) return 'safari';
  if (ua.includes('chrome')) return 'chrome';
  return 'unknown';
}

export function getCurrentBrowserVersion(browserType: BrowserType): number {
  const ua = navigator.userAgent;
  let match: RegExpMatchArray | null;

  switch (browserType) {
    case 'chrome':
      match = ua.match(/Chrome\/(\d+\.\d+)/);
      break;
    case 'firefox':
      match = ua.match(/Firefox\/(\d+\.\d+)/);
      break;
    case 'safari':
      match = ua.match(/Version\/(\d+\.\d+)/);
      break;
    default:
      return 999;
  }

  return match ? parseFloat(match[1]) : 999;
}
