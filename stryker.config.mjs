/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  mutate: [
    'src/lib/api.ts',
    'src/lib/cart.tsx',
    'src/lib/config.ts',
    'src/lib/http.ts',
    'src/services/keycloak.ts',
  ],
  testRunner: 'jest',
  jest: {
    projectType: 'create-react-app',
  },
  checkers: ['typescript'],
  reporters: ['html', 'clear-text', 'progress'],
  coverageAnalysis: 'perTest',
  thresholds: {
    high: 80,
    low: 60,
    break: 60,
  },
  timeoutMS: 60000,
};
