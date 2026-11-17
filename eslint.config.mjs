import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';

const eslintConfig = defineConfig([
  ...nextVitals,
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
  {
    rules: {
      // Existing effects update state after async data loads; keep the new
      // React Hooks diagnostic visible while avoiding unrelated lint failures.
      'react-hooks/set-state-in-effect': 'warn',
    },
  },
]);

export default eslintConfig;
