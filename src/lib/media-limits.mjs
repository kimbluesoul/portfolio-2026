/** @typedef {'key-screen' | 'motion-step' | 'preview'} MediaSlot */

export const MEDIA_SIZE_LIMITS = /** @type {const} */ ({
  'key-screen': 8 * 1024 * 1024,
  'motion-step': 4 * 1024 * 1024,
  preview: 3 * 1024 * 1024,
});

/**
 * @param {string} fileName
 * @returns {MediaSlot}
 */
export function inferMediaSlot(fileName) {
  if (fileName.includes('key-main') || fileName.startsWith('detail-'))
    return 'key-screen';
  if (fileName.includes('motion-')) return 'motion-step';
  return 'preview';
}
