import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // All /api requests (including the SSE stream) go to the mock backend in /server
    proxy: { '/api': 'http://localhost:4000' },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/__test__/setup.ts'],
    restoreMocks: true,
  },
});
