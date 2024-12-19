interface CategoryData {
  total: number;
  supported: number;
  features: Array<{
    path: string;
    supported: boolean;
    data: any;
  }>;
}

export class FeatureCategories {
  private element: HTMLElement;

  constructor(containerId: string) {
    this.element = document.getElementById(containerId) as HTMLElement;
    if (!this.element) throw new Error(`Container ${containerId} not found`);
  }

  updateCategories(categories: Record<string, CategoryData>) {
    this.element.innerHTML = Object.entries(categories)
      .filter(([_, data]) => data.total > 0)
      .sort((a, b) => b[1].total - a[1].total)
      .map(([category, data]) => {
        const percentage = ((data.supported / data.total) * 100).toFixed(1);
        const features = data.features
          .sort((a, b) => Number(b.supported) - Number(a.supported))
          .slice(0, 3);

        return `
          <div class="p-4 bg-gray-50 rounded hover:bg-gray-100 transition-colors">
            <div class="flex justify-between items-center mb-3">
              <div>
                <span class="font-medium text-lg">${category}</span>
                <span class="ml-2 text-sm text-gray-600">
                  ${data.supported}/${data.total} features
                </span>
              </div>
              <span class="text-sm font-medium ${
                Number(percentage) > 80
                  ? "text-green-600"
                  : Number(percentage) > 40
                  ? "text-yellow-600"
                  : "text-red-600"
              }">
                ${percentage}%
              </span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div class="h-2 rounded-full transition-all duration-500 ${
                Number(percentage) > 80
                  ? "bg-green-500"
                  : Number(percentage) > 40
                  ? "bg-yellow-500"
                  : "bg-red-500"
              }" style="width: ${percentage}%"></div>
            </div>
            <div class="text-sm text-gray-600 space-y-1">
              ${features
                .map(
                  (f) => `
                  <div class="flex items-center">
                    <span class="${
                      f.supported ? "text-green-500" : "text-red-500"
                    } mr-2">
                      ${f.supported ? "✓" : "✗"}
                    </span>
                    ${f.path}
                  </div>
                `
                )
                .join('')}
            </div>
          </div>
        `;
      })
      .join('');
  }
}