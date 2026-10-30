import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projectSlug = z.enum([
  '88win',
  'hwa-fong',
  'fitzone',
  'sss',
  'jhanyu',
  'amd',
  'huifa',
]);

const contentUrl = z.union([z.url(), z.literal('TODO(CONTENT)')]);

const projects = defineCollection({
  loader: glob({
    base: './src/content/projects',
    pattern: '**/*.{yaml,yml}',
    generateId: ({ entry }) =>
      projectSlug.parse(entry.replace(/\.(?:yaml|yml)$/u, '')),
  }),
  schema: ({ image }) => {
    const imageMedia = z.object({
      kind: z.literal('image'),
      src: image(),
      alt: z.string(),
      decorative: z.boolean().optional(),
    });

    const videoMedia = z.object({
      kind: z.literal('video'),
      src: z.string().regex(/^\/media\/.+\.mp4$/),
      poster: image(),
      alt: z.string().min(1),
      status: z.enum(['ready', 'pending']).optional(),
    });

    const media = z
      .union([imageMedia, videoMedia])
      .superRefine((value, context) => {
        if (
          value.kind === 'image' &&
          value.alt.length === 0 &&
          value.decorative !== true
        ) {
          context.addIssue({
            code: 'custom',
            message: 'An empty alt requires decorative: true.',
            path: ['decorative'],
          });
        }
      });

    const captioned = z.object({
      title: z.string().min(1),
      caption: z.string().optional(),
      media,
    });

    const stat = z.object({
      label: z.string().min(1),
      value: z.string().min(1),
    });

    return z.object({
      order: z.number().int().min(1).max(7),
      name: z.string().min(1),
      nameZh: z.string(),
      card: z.object({
        summary: z.string().min(1),
        tags: z.array(z.string().min(1)).min(1),
        media,
        featured: z.boolean().optional(),
      }),
      seo: z.object({
        title: z.string().min(1),
        description: z.string().min(1),
        ogImage: image().optional(),
      }),
      next: z.object({
        oneLiner: z.string().min(1),
        meta: z.string().min(1),
        media,
      }),
      hero: z.object({
        eyebrow: z.string().min(1),
        title: z.string().min(1),
        headline: z.string().min(1),
        subtitle: z.string().min(1),
        stats: z.tuple([stat, stat, stat, stat]),
        showcase: z.object({
          layout: z.enum(['isometric', 'single']),
          items: z.array(media).min(1).max(2),
        }),
      }),
      overview: z.object({
        heading: z.string().min(1),
        blocks: z
          .array(
            z.object({ title: z.string().min(1), body: z.string().min(1) }),
          )
          .min(2)
          .max(3),
        outputs: z.array(z.string().min(1)).min(1),
      }),
      keyScreens: z.object({
        eyebrow: z.string().min(1),
        heading: z.string().min(1),
        subtitle: z.string().min(1),
        main: media,
        closeups: z.array(captioned).min(2).max(3),
      }),
      mobile: z
        .object({
          eyebrow: z.string().min(1),
          heading: z.string().min(1),
          subtitle: z.string().min(1),
          panels: z.tuple([captioned, captioned, captioned]),
        })
        .optional(),
      motion: z
        .object({
          eyebrow: z.string().min(1),
          heading: z.string().min(1),
          subtitle: z.string().min(1),
          steps: z
            .array(
              z.object({
                title: z.string().min(1),
                body: z.string().min(1),
                media,
              }),
            )
            .min(1)
            .max(3),
        })
        .optional(),
      details: z
        .object({
          eyebrow: z.string().min(1),
          heading: z.string().min(1),
          subtitle: z.string().min(1),
          items: z
            .array(captioned)
            .refine((items) => items.length === 3 || items.length === 6, {
              message: 'Details must contain exactly 3 or 6 items.',
            }),
        })
        .optional(),
      visualExtension: z
        .object({
          variant: z.enum(['mosaic', 'grid']),
          items: z.array(media).min(1),
        })
        .optional(),
      links: z.object({
        eyebrow: z.string().min(1),
        heading: z.string().min(1),
        subtitle: z.string().min(1),
        cards: z
          .array(
            z.object({
              kind: z.enum(['prototype', 'live', 'demo']),
              label: z.string().min(1),
              description: z.string().min(1),
              url: contentUrl,
            }),
          )
          .min(1)
          .max(2),
        note: z.string().optional(),
      }),
    });
  },
});

const site = defineCollection({
  loader: file('./src/content/site.yaml'),
  schema: z.object({
    seo: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    }),
    nav: z.array(
      z.object({
        label: z.string().min(1),
        href: z.string().min(1),
      }),
    ),
    hero: z.object({
      eyebrow: z.string().min(1),
      heading: z.string().min(1),
      introduction: z.string().min(1),
    }),
    credentials: z.array(
      z.object({
        label: z.string().min(1),
        value: z.string().min(1),
      }),
    ),
    about: z.object({
      heading: z.string().min(1),
      body: z.string().min(1),
      skills: z.array(z.string().min(1)),
      tools: z.array(z.string().min(1)),
      resumeLabel: z.string().min(1),
    }),
    contact: z.object({
      email: z.email(),
      linkedin: z.url(),
    }),
    footer: z.object({
      heading: z.string().min(1),
      subheading: z.string().min(1),
      copyright: z.string().min(1),
      resumeLabel: z.string().min(1),
      backToTopLabel: z.string().min(1),
    }),
  }),
});

export const collections = { projects, site };
