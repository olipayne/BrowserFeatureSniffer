interface EngineFeatures {
  name: string;
  features: Array<{
    test: () => boolean;
    description: string;
  }>;
}

export interface EngineResult {
  name: string;
  confidence: number;
  matchedFeatures: string[];
}

export function detectBrowserEngine(): EngineResult {
  // Define engine-specific features
  const engines: EngineFeatures[] = [
    {
      name: 'Blink',
      features: [
        {
          test: () => 'CSSLayerStatementRule' in window,
          description: 'CSSLayerStatementRule'
        },
        {
          test: () => 'chrome' in window,
          description: 'window.chrome'
        },
        {
          test: () => 'CSS' in window && 'registerProperty' in (CSS as any),
          description: 'CSS.registerProperty'
        },
        {
          test: () => {
            try {
              return 'setAppBadge' in navigator;
            } catch {
              return false;
            }
          },
          description: 'navigator.setAppBadge'
        },
        {
          test: () => 'webkitRequestFileSystem' in window,
          description: 'webkitRequestFileSystem'
        }
      ]
    },
    {
      name: 'Gecko',
      features: [
        {
          test: () => 'mozInnerScreenX' in window,
          description: 'window.mozInnerScreenX'
        },
        {
          test: () => 'InstallTrigger' in window,
          description: 'window.InstallTrigger'
        },
        {
          test: () => {
            const canvas = document.createElement('canvas');
            return canvas.getContext && 'mozOpaque' in canvas;
          },
          description: 'canvas.mozOpaque'
        },
        {
          test: () => 'MozActivity' in window,
          description: 'window.MozActivity'
        },
        {
          test: () => 'sidebar' in window,
          description: 'window.sidebar'
        }
      ]
    },
    {
      name: 'WebKit',
      features: [
        {
          test: () => {
            try {
              return 'webkitIndexedDB' in window && !('chrome' in window);
            } catch {
              return false;
            }
          },
          description: 'webkitIndexedDB without chrome'
        },
        {
          test: () => {
            try {
              return 'WebKitPlaybackTargetAvailabilityEvent' in window;
            } catch {
              return false;
            }
          },
          description: 'WebKitPlaybackTargetAvailabilityEvent'
        },
        {
          test: () => 'webkitAudioContext' in window && !('AudioContext' in window),
          description: 'webkitAudioContext without AudioContext'
        },
        {
          test: () => {
            try {
              return 'safari' in window;
            } catch {
              return false;
            }
          },
          description: 'window.safari'
        }
      ]
    }
  ];

  // Test each engine and calculate confidence
  const results = engines.map(engine => {
    const matchedFeatures = engine.features
      .filter(feature => {
        try {
          return feature.test();
        } catch {
          return false;
        }
      })
      .map(feature => feature.description);

    const confidence = (matchedFeatures.length / engine.features.length) * 100;

    return {
      name: engine.name,
      confidence,
      matchedFeatures
    };
  });

  // Sort by confidence and return the best match
  results.sort((a, b) => b.confidence - a.confidence);
  return results[0];
}