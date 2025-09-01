import { QueryProvider } from '@luciad/ria/view/feature/QueryProvider.js';

export const TypicalGoogleScaleRangesOld = [
  1.0 / 1.0e6,  // 1:1,000,000  → ~1000 m/pixel
  1.0 / 5.0e5,  // 1:500,000    → ~500 m/pixel
  1.0 / 2.0e5,  // 1:200,000    → ~200 m/pixel
  1.0 / 1.0e5,  // 1:100,000    → ~100 m/pixel
  1.0 / 5.0e4,  // 1:50,000     → ~50 m/pixel
  1.0 / 2.0e4,  // 1:20,000     → ~20 m/pixel
  1.0 / 1.0e4,  // 1:10,000     → ~10 m/pixel
  1.0 / 5.0e3,  // 1:5,000      → ~5 m/pixel
  1.0 / 2.0e3,  // 1:2,000      → ~2 m/pixel
  1.0 / 1.0e3,  // 1:1,000      → ~1 m/pixel
  1.0 / 5.0e2,  // 1:500        → ~0.5 m/pixel
  1.0 / 2.0e2,  // 1:200        → ~0.2 m/pixel
  1.0 / 1.0e2,  // 1:100        → ~0.1 m/pixel
  1.0 / 5.0,  // 1:500        → ~0.5 m/pixel
];
export const TypicalGoogleScaleRanges = [
 // 1 / 1e5,   // 10 km
  // 1 / 5e4,   // 5 km
  // 1 / 1e4,   // 1 km
 // 1 / 5e3,   // 500 m
  1 / 1e3,   // 100 m
//  1 / 5e2,   // 50 m
//  1 / 1e2,   // 10 m
  // 1 / 5e1,   // 5 m
  // 1 / 1e1,   // 1 m
]

export const TypicalGoogleScaleRanges_Bigger = [
  1 / 5e5,   // 10 km
  1 / 1e5,   // 10 km
  1 / 5e4,   // 5 km
  1 / 1e4,   // 1 km
  1 / 5e3,   // 500 m
  1 / 1e3,   // 100 m
  1 / 5e2,   // 50 m
  1 / 1e2,   // 10 m
  1 / 5e1,   // 1 m
]

const FILTER_NO_RESTRICTIONS: any = null;

export const TypicalWMSScaleQueries = [] as any;
for (let i = 0; i < TypicalGoogleScaleRanges.length; ++i) {
  TypicalWMSScaleQueries.push({ filter: {l:i} });
}
TypicalWMSScaleQueries.push({ filter: FILTER_NO_RESTRICTIONS });

interface WFS3QueryProviderOptions {
  scaleRanges?: any;
  queries?: any;
  limit?: number | undefined;
}

class CubeQueryProvider extends QueryProvider {
  private scaleRanges: undefined;
  // private queries: { name: string; range: any; value: any }[];

  constructor(options: WFS3QueryProviderOptions) {
    super();
    options = options ? options : {};
    this.scaleRanges = options.scaleRanges
      ? options.scaleRanges
      : TypicalGoogleScaleRanges;
  }

  getQueryForLevel(level: number): any {
    // return this.queries[level];
    return level;
  }

  getQueryLevelScales(): number[] {
    return this.scaleRanges as any;
  }
}

export default CubeQueryProvider;
