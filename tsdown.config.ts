import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: ['src/index.ts', 'src/moves.ts', 'src/rules.ts', 'src/ascii.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: false,
});
