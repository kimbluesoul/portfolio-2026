/**
 * Derive the page-local font key from either an output HTML path or a URL
 * pathname. Both build-time and render-time callers use this normalization.
 *
 * @param {string} path
 */
export function pageKeyFromPath(path) {
  const normalized = path.replaceAll('\\', '/').replace(/^\/+|\/+$/gu, '');
  const withoutIndex = normalized.endsWith('/index.html')
    ? normalized.slice(0, -'/index.html'.length)
    : normalized.replace(/\.html$/u, '');
  return withoutIndex === '' || withoutIndex === 'index'
    ? 'index'
    : withoutIndex.replaceAll('/', '-');
}
