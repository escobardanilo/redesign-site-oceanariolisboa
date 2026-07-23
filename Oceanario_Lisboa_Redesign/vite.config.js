import { defineConfig } from 'vite';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

/**
 * Minimal build-time HTML include system.
 * Keeps html/components and html/sections as the real source files
 * (required by the project's separation-of-concerns rules) while Vite
 * still only needs a single index.html entry point.
 *
 * Usage inside any .html file:
 *   <!--@include: html/sections/hero.html -->
 *
 * Paths are resolved relative to the project root, and includes may be
 * nested (an included file can itself include other files).
 */
function htmlInclude() {
  const includeRegex = /<!--\s*@include:\s*([^\s]+)\s*-->/g;
  const projectRoot = process.cwd();

  function resolveIncludes(content, seen) {
    return content.replace(includeRegex, (match, includePath) => {
      const fullPath = resolve(projectRoot, includePath);
      if (!existsSync(fullPath)) {
        console.warn(`[html-include] Ficheiro não encontrado: ${includePath}`);
        return `<!-- MISSING INCLUDE: ${includePath} -->`;
      }
      if (seen.has(fullPath)) {
        console.warn(`[html-include] Include circular detetado: ${includePath}`);
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
  base: './',
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
  },
});
