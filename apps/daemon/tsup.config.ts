import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  noExternal: [/^@agora\//],
  external: ['tweetnacl', 'tweetnacl-util'],
});
