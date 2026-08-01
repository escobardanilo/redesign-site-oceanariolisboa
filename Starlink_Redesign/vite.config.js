import { defineConfig } from 'vite';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Minimal build-time HTML include system (same pattern used by the
 * sibling Oceanario_Lisboa_Redesign project): keeps html/components/*
 * as real, separate files shared across every page, while Vite still
 * only ever sees plain, self-contained HTML entry points.
 *
 * Usage inside any .html file:
 *   <!--@include: html/components/header.html -->
 */
function htmlInclude() {
  const includeRegex = /<!--\s*@include:\s*([^\s]+)\s*-->/g;
  const projectRoot = process.cwd();

  function resolveIncludes(content, seen) {
    return content.replace(includeRegex, (match, includePath) => {
      const fullPath = resolve(projectRoot, includePath);
      if (!existsSync(fullPath)) {
        console.warn(`[html-include] File not found: ${includePath}`);
        return `<!-- MISSING INCLUDE: ${includePath} -->`;
      }
      if (seen.has(fullPath)) {
        console.warn(`[html-include] Circular include detected: ${includePath}`);
        return '';
      }
      const nextSeen = new Set(seen).add(fullPath);
      const raw = readFileSync(fullPath, 'utf-8');
      return resolveIncludes(raw, nextSeen);
    });
  }

  return {
    name: 'html-include',
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        return resolveIncludes(html, new Set([resolve(ctx.filename)]));
      },
    },
  };
}

export default defineConfig({
  root: '.',
  base: '/redesign-site-oceanariolisboa/',
  plugins: [htmlInclude()],
  server: {
    port: 5173,
    open: false,
  },
  preview: {
    port: 4173,
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    target: 'es2020',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        services: resolve(__dirname, 'services.html'),
        technology: resolve(__dirname, 'technology.html'),
        contacts: resolve(__dirname, 'contacts.html'),
        signIn: resolve(__dirname, 'sign-in.html'),
      },
    },
  },
});
