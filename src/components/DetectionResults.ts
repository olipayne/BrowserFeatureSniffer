import { EngineResult } from '@/utils/engineDetection';

export class DetectionResults {
  private element: HTMLElement;

  constructor(containerId: string) {
    this.element = document.getElementById(containerId) as HTMLElement;
    if (!this.element) throw new Error(`Container ${containerId} not found`);
  }

  updateBrowserInfo(
    browserType: string,
    versionRange: { min: number; max: number; constraints: any[] },
    engineInfo: EngineResult
  ) {
    const browserGuess = document.getElementById('browser-guess');
    const versionRangeEl = document.getElementById('version-range');

    if (browserGuess) {
      browserGuess.innerHTML = `
        <div class="space-y-2">
          <p class="font-medium">Detected Browser: ${
            browserType.charAt(0).toUpperCase() + browserType.slice(1)
          }</p>
          <div>
            <p class="font-medium text-sm">Engine: ${engineInfo.name}</p>
            <p class="text-sm text-gray-600">Confidence: ${engineInfo.confidence.toFixed(1)}%</p>
            ${engineInfo.matchedFeatures.length > 0 ? `
              <div class="text-xs text-gray-500 mt-1">
                Matched features:
                <ul class="list-disc list-inside">
                  ${engineInfo.matchedFeatures.map(feature => `
                    <li>${feature}</li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }

    if (versionRangeEl) {
      versionRangeEl.innerHTML = `
        <div>
          <p class="font-medium">Estimated Version Range:</p>
          <p class="mb-4">Version ${versionRange.min.toFixed(1)} - ${versionRange.max.toFixed(1)}</p>
          
          <p class="font-medium mb-2">Key Version Constraints:</p>
          <div class="max-h-48 overflow-y-auto">
            ${versionRange.constraints
              .filter(
                (c) =>
                  Math.abs(c.min - versionRange.min) < 1 ||
                  Math.abs(c.max - versionRange.max) < 1
              )
              .map(
                (c) => `
                  <div class="text-xs mb-1">
                    <span class="font-medium">${c.feature}</span>
                    <span class="text-gray-600">
                      (${c.reason}: v${c.min} - v${c.max})
                    </span>
                  </div>
                `
              )
              .join('')}
          </div>
        </div>
      `;
    }
  }
}