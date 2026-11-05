import { z } from 'astro/zod';

export const expectedMediaFile = z
  .string()
  .regex(/^(?:src\/assets\/projects|public\/media)\/[a-z0-9-]+\/.+/);

export const mediaAspectRatio = z
  .string()
  .regex(/^\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?$/);

export function createImageMediaSchemas<TImage extends z.ZodType>(
  image: () => TImage,
) {
  const readyImageMedia = z.object({
    kind: z.literal('image'),
    src: image(),
    alt: z.string(),
    decorative: z.boolean().optional(),
    aspectRatio: mediaAspectRatio.optional(),
    objectPosition: z.enum(['center', 'top']).optional(),
  });

  const pendingImageMedia = z.object({
    kind: z.literal('image'),
    src: image(),
    alt: z.string(),
    decorative: z.boolean().optional(),
    aspectRatio: mediaAspectRatio,
    status: z.literal('pending'),
    expectedFile: expectedMediaFile,
    objectPosition: z.enum(['center', 'top']).optional(),
  });

  const imageMedia = z
    .union([pendingImageMedia, readyImageMedia])
    .superRefine((value, context) => {
      if (value.alt.length === 0 && value.decorative !== true) {
        context.addIssue({
          code: 'custom',
          message: 'An empty alt requires decorative: true.',
          path: ['decorative'],
        });
      }
    });

  return { imageMedia, pendingImageMedia, readyImageMedia };
}
