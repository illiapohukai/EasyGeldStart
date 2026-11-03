import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export function resolveViteBasePath(): string {
  const explicit = process.env.VITE_BASE_PATH?.trim();
  if (explicit) {
    if (explicit === '/' || explicit === './') return explicit;
    const withLeading = explicit.startsWith('/') ? explicit : `/${explicit}`;
    return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
  }

  // Automatic fallback when building inside GitHub Actions for a project repository (e.g. owner/GeldStart)
  if (process.env.GITHUB_ACTIONS === 'true' && process.env.GITHUB_REPOSITORY) {
    const repoName = process.env.GITHUB_REPOSITORY.split('/')[1]?.trim();
    if (repoName && !repoName.endsWith('.github.io')) {
      return `/${repoName}/`;
    }
  }

  return '/';
}

export default defineConfig(() => {
  const basePath = resolveViteBasePath();
  return {
    base: basePath,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
