import './style.css';
import { detectBrowserType } from './utils/browserDetection';
import { CompatibilityService } from './services/compatibilityService';
import { DetectionResults } from './components/DetectionResults';
import { FeatureCategories } from './components/FeatureCategories';
import { FeatureList } from './components/FeatureList';

class App {
  private compatibilityService: CompatibilityService;
  private detectionResults: DetectionResults;
  private featureCategories: FeatureCategories;
  private featureList: FeatureList;
  private loadingElement: HTMLElement;

  constructor() {
    this.compatibilityService = new CompatibilityService();
    this.detectionResults = new DetectionResults('results');
    this.featureCategories = new FeatureCategories('categories');
    this.featureList = new FeatureList('features', 'feature-search');
    this.loadingElement = document.getElementById('loading') as HTMLElement;
  }

  async initialize() {
    try {
      await this.compatibilityService.initialize();
      
      const browserType = detectBrowserType();
      const versionRange = this.compatibilityService.estimateVersionRange(browserType);
      
      // Update UI components
      this.detectionResults.updateBrowserInfo(browserType, versionRange);
      this.featureCategories.updateCategories(this.compatibilityService.getCategorizedFeatures());
      this.featureList.updateFeatures(
        this.compatibilityService.getFeatureTests(),
        this.compatibilityService.getResults(),
        browserType
      );

      // Show results
      this.loadingElement.style.display = 'none';
      document.getElementById('results-container')?.classList.remove('opacity-0');
      document.getElementById('features-container')?.classList.remove('opacity-0');
    } catch (error) {
      console.error('Error initializing app:', error);
      if (this.loadingElement) {
        this.loadingElement.innerHTML = `
          <div class="text-red-600">
            Error loading browser compatibility data. Please try again later.
          </div>
        `;
      }
    }
  }
}

// Initialize app when DOM is loaded
window.addEventListener('load', () => {
  const app = new App();
  app.initialize();
});