export type MediaSlot = 'key-screen' | 'motion-step' | 'preview';

export const MEDIA_SIZE_LIMITS = {
  'key-screen': 8 * 1024 * 1024,
  'motion-step': 4 * 1024 * 1024,
  preview: 3 * 1024 * 1024,
} as const satisfies Record<MediaSlot, number>;

export interface PendingMedia {
  expectedFile: string;
  path: string;
  project: string;
}

export function pendingVideoPoster(expectedFile: string): string | null {
  const match = expectedFile.match(/^public\/media\/([a-z0-9-]+)\/(.+)\.mp4$/u);
  if (!match?.[1] || !match[2]) return null;
  return `src/assets/projects/${match[1]}/${match[2]}-poster.jpg`;
}

export function inferMediaSlot(fileName: string): MediaSlot {
  if (fileName.includes('key-main') || fileName.startsWith('detail-'))
    return 'key-screen';
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
  const current: PendingMedia[] =
    (record.kind === 'video' || record.kind === 'image') &&
    record.status === 'pending' &&
    typeof record.expectedFile === 'string'
      ? (() => {
          const project =
            record.expectedFile.match(
              /(?:projects|media)\/([a-z0-9-]+)\//u,
            )?.[1] ?? 'unknown';
          const files = [record.expectedFile];
          const poster =
            record.kind === 'video'
              ? pendingVideoPoster(record.expectedFile)
              : null;
          if (poster) files.push(poster);
          return files.map((expectedFile) => ({
            expectedFile,
            path,
            project,
          }));
        })()
      : [];

  const nested = Object.entries(record).flatMap(([key, nestedValue]) =>
    collectPendingMedia(nestedValue, `${path}.${key}`),
  );

  return [...current, ...nested];
}
