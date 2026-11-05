import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { caseTitleSizesMobile, isCaseTitleSizeMobile } from './lib/case-title';

const projectSlug = z.enum([
  '88win',
  'hwa-fong',
  'fitzone',
  'sss',
  'jhanyu',
  'amd',
  'huifa',
]);

const stat = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
});

const contentUrl = z.union([z.url(), z.literal('TODO(CONTENT)')]);

const projects = defineCollection({
  loader: glob({
    base: './src/content/projects',
    pattern: '**/*.{yaml,yml}',
    generateId: ({ entry }) =>
      projectSlug.parse(entry.replace(/\.(?:yaml|yml)$/u, '')),
  }),
  schema: ({ image }) => {
    const expectedFile = z
      .string()
      .regex(/^(?:src\/assets\/projects|public\/media)\/[a-z0-9-]+\/.+/);
    const aspectRatio = z
      .string()
      .regex(/^\d+(?:\.\d+)?\s*\/\s*\d+(?:\.\d+)?$/);

    const readyImageMedia = z.object({
      kind: z.literal('image'),
      src: image(),
      alt: z.string(),
      decorative: z.boolean().optional(),
      aspectRatio: aspectRatio.optional(),
      objectPosition: z.enum(['center', 'top']).optional(),
    });

    const pendingImageMedia = z.object({
      kind: z.literal('image'),
      src: image(),
      alt: z.string(),
      decorative: z.boolean().optional(),
      aspectRatio,
      status: z.literal('pending'),
      expectedFile,
      objectPosition: z.enum(['center', 'top']).optional(),
    });

    const readyVideoMedia = z.object({
      kind: z.literal('video'),
      src: z.string().regex(/^\/media\/.+\.mp4$/),
      poster: image(),
      alt: z.string().min(1),
      aspectRatio: aspectRatio.optional(),
    });

    const pendingVideoMedia = z.object({
      kind: z.literal('video'),
      src: z.string().regex(/^\/media\/.+\.mp4$/),
      poster: image(),
      alt: z.string().min(1),
      aspectRatio,
      status: z.literal('pending'),
      expectedFile,
    });

    const swatchesMedia = z.object({
      kind: z.literal('swatches'),
      colors: z
        .array(
          z.object({
            name: z.string().min(1),
            hex: z.string().regex(/^#[0-9A-F]{6}$/u),
          }),
        )
        .min(1),
    });

    const media = z
      .union([
        pendingImageMedia,
        pendingVideoMedia,
        readyImageMedia,
        readyVideoMedia,
        swatchesMedia,
      ])
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

    const composite = z.object({
      kind: z.literal('composite'),
      alt: z.string().min(1),
      background: readyImageMedia,
      desktop: readyVideoMedia,
      phone: readyVideoMedia,
    });

    const captioned = z.object({
      title: z.string().min(1),
      caption: z.string().optional(),
      media,
    });

    const detailItem = z.object({
      eyebrow: z.string().min(1).optional(),
      title: z.string().min(1),
      caption: z.string().optional(),
      media,
      mobileMedia: media.optional(),
      size: z.enum(['third', 'half', 'half-tall', 'full']).optional(),
    });

    const compareDetailItem = z.object({
      label: z.string().min(1),
      media,
    });

    return z.object({
      order: z.number().int().min(1).max(7),
      name: z.string().min(1),
      nameZh: z.string(),
      card: z.object({
        summary: z.string().min(1),
        tags: z.array(z.string().min(1)).min(1),
        media: z.union([media, composite]),
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
        titleSizeMobile: z
          .number()
          .refine(isCaseTitleSizeMobile, {
            message: `Use one of ${caseTitleSizesMobile.join(', ')} (src/lib/case-title.ts).`,
          })
          .optional(),
        headline: z.string().min(1),
        subtitle: z.string().min(1),
        stats: z.tuple([stat, stat, stat, stat]),
        showcase: z.object({
          layout: z.enum(['isometric', 'single']),
          items: z.array(media).min(1).max(2),
          // Art-directed 390 crop for the first item (single layout).
          mobileMedia: media.optional(),
          mobileScale: z.literal(0.25).optional(),
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
        .union([
          z.object({
            variant: z.literal('compare'),
            eyebrow: z.string().min(1),
            heading: z.string().min(1),
            subtitle: z.string().min(1),
            items: z.array(compareDetailItem).length(2),
          }),
          z.object({
            variant: z.literal('cards').default('cards'),
            eyebrow: z.string().min(1),
            heading: z.string().min(1),
            subtitle: z.string().min(1),
            items: z.array(detailItem).min(1).max(8),
          }),
        ])
        .optional(),
      visualExtension: z
        .object({
          variant: z.enum(['mosaic', 'grid']),
          items: z.array(media).min(1),
          mobileMedia: media.optional(),
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
              eyebrow: z.string().min(1),
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

const resumeEntry = z.object({
  period: z.string().min(1),
  duration: z.string().min(1),
  title: z.string().min(1),
  badge: z.string().min(1).optional(),
  org: z.string().min(1),
  industry: z.string().min(1).optional(),
  body: z.string().min(1),
  projects: z
    .array(
      z.object({
        label: z.string().min(1),
        slug: projectSlug,
      }),
    )
    .optional(),
});

const resumeSection = z.object({
  heading: z.string().min(1),
  eyebrow: z.string().min(1),
});

const resume = defineCollection({
  loader: file('./src/content/resume.yaml'),
  schema: z.object({
    seo: z.object({
      title: z.string().min(1),
      description: z.string().min(1),
    }),
    header: z.object({
      eyebrow: z.string().min(1),
      nameZh: z.string().min(1),
      nameEn: z.string().min(1),
      role: z.string().min(1),
      focus: z.string().min(1),
      email: z.email(),
      location: z.string().min(1),
      download: z.object({
        label: z.string().min(1),
        href: z.literal('/files/Syuan-Ci-Resume.pdf'),
      }),
    }),
    summary: z.string().min(1),
    facts: z.tuple([stat, stat, stat, stat]),
    experience: resumeSection.extend({
      entries: z.array(resumeEntry).min(1),
    }),
    earlier: resumeSection.extend({ entries: z.array(resumeEntry) }).optional(),
    skills: resumeSection.extend({
      groups: z.array(
        z.object({
          label: z.string().min(1),
          tags: z.array(z.string().min(1)).min(1),
        }),
      ),
      note: z.string().min(1).optional(),
    }),
    education: resumeSection.extend({
      blocks: z.array(
        z.object({
          label: z.string().min(1),
          title: z.string().min(1),
          value: z.string().min(1).optional(),
          lines: z.array(z.string().min(1)).optional(),
        }),
      ),
    }),
    about: resumeSection.extend({ body: z.string().min(1) }),
  }),
});

export const collections = { projects, site, resume };
