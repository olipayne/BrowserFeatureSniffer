import { BrowserType } from '@/types/browserData';
import { FeatureTest } from '@/types/feature';
import { getMinVersion } from '@/utils/versionParsing';

export class FeatureList {
  private element: HTMLElement;
  private searchInput: HTMLInputElement;

  constructor(containerId: string, searchInputId: string) {
    this.element = document.getElementById(containerId) as HTMLElement;
    this.searchInput = document.getElementById(searchInputId) as HTMLInputElement;
    
    if (!this.element) throw new Error(`Container ${containerId} not found`);
    if (!this.searchInput) throw new Error(`Search input ${searchInputId} not found`);
    
    this.setupSearch();
  }

  updateFeatures(
    featureTests: Record<string, FeatureTest>,
    results: Record<string, boolean>,
    browserType: BrowserType
  ) {
    const featuresList = Object.entries(featureTests)
      .map(([path, data]) => {
        const supported = results[path];
        const version = data.support[browserType] ? 
          getMinVersion(data.support[browserType]) : null;
        
        const versionDisplay = version !== null ? 
          `Added in version: ${version.toFixed(1)}` : 
          'Version information unavailable';
        
        return `
          <div class="p-2 rounded ${supported ? "bg-green-50" : "bg-red-50"} feature-item" 
               data-path="${path}">
            <div class="flex justify-between">
              <div>
                <span class="font-medium">${path}</span>
                <span class="${supported ? "text-green-600" : "text-red-600"} ml-2">
                  ${supported ? "✓" : "✗"}
                </span>
              </div>
              ${data.mdn_url ? `
                <a href="${data.mdn_url}" 
                   target="_blank" 
                   class="text-blue-600 hover:text-blue-800 text-sm">
                  MDN Docs
                </a>
              ` : ""}
            </div>
            <div class="text-sm text-gray-600 mt-1">
              ${versionDisplay}
            </div>
          </div>
        `;
      })
      .join('');

    this.element.innerHTML = featuresList;
  }

  private setupSearch() {
    this.searchInput.addEventListener('input', (e) => {
      const searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
      const items = this.element.querySelectorAll('.feature-item');
      
      items.forEach((item) => {
        const htmlItem = item as HTMLElement;
        const path = htmlItem.dataset.path?.toLowerCase() || '';
        htmlItem.style.display = path.includes(searchTerm) ? 'block' : 'none';
      });
    });
  }
}