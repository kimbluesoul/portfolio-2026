export type MediaSlot = 'key-screen' | 'motion-step' | 'preview';

export const MEDIA_SIZE_LIMITS = {
  'key-screen': 8 * 1024 * 1024,
  'motion-step': 4 * 1024 * 1024,
  preview: 3 * 1024 * 1024,
} as const satisfies Record<MediaSlot, number>;

export interface PendingMedia {
  path: string;
  src: string;
}

export function inferMediaSlot(fileName: string): MediaSlot {
  if (fileName.includes('key-main')) return 'key-screen';
  if (fileName.includes('motion-')) return 'motion-step';
  return 'preview';
}

export function isWithinMediaLimit(size: number, slot: MediaSlot): boolean {
  return size <= MEDIA_SIZE_LIMITS[slot];
}

export function collectPendingMedia(
  value: unknown,
  path = 'root',
): PendingMedia[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      collectPendingMedia(item, `${path}[${index}]`),
    );
  }

  if (typeof value !== 'object' || value === null) return [];

  const record = value as Record<string, unknown>;
  const current =
    record.kind === 'video' &&
    record.status === 'pending' &&
    typeof record.src === 'string'
      ? [{ path, src: record.src }]
      : [];

  const nested = Object.entries(record).flatMap(([key, nestedValue]) =>
    collectPendingMedia(nestedValue, `${path}.${key}`),
  );

  return [...current, ...nested];
}
