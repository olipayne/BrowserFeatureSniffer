export class DetectionResults {
  private element: HTMLElement;

  constructor(containerId: string) {
    this.element = document.getElementById(containerId) as HTMLElement;
    if (!this.element) throw new Error(`Container ${containerId} not found`);
  }

  updateBrowserInfo(browserType: string, versionRange: { min: number; max: number; constraints: any[] }) {
    const browserGuess = document.getElementById('browser-guess');
    const versionRangeEl = document.getElementById('version-range');

    if (browserGuess) {
      browserGuess.innerHTML = `
        <p class="font-medium">Detected Browser: ${
          browserType.charAt(0).toUpperCase() + browserType.slice(1)
        }</p>
      `;
    }

    if (versionRangeEl) {
      versionRangeEl.innerHTML = `
        <p class="font-medium">Estimated Version Range:</p>
        <p>Version ${versionRange.min.toFixed(1)} - ${versionRange.max.toFixed(1)}</p>
        <div class="mt-4 text-sm">
          <p class="font-medium mb-2">Key Version Constraints:</p>
          <div class="space-y-1 max-h-40 overflow-y-auto">
            ${versionRange.constraints
              .filter(
                (c) =>
                  Math.abs(c.min - versionRange.min) < 1 ||
                  Math.abs(c.max - versionRange.max) < 1
              )
              .map(
                (c) => `
                  <div class="text-xs">
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
