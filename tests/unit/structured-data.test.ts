import { existsSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  createCreativeWorkStructuredData,
  createHomeStructuredData,
} from '../../src/lib/structured-data';

const siteUrl = new URL('https://portfolio.example/');
const linkedin = 'https://www.linkedin.com/in/syuanci-chou-design';

describe('structured data', () => {
  it('creates the home Person and WebSite graph', () => {
    const data = createHomeStructuredData({
      siteUrl,
      title: '周泫淇 Syuan Ci｜UI/UX 設計師作品集',
      linkedin,
    });

    expect(data).toEqual({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          '@id': 'https://portfolio.example/#person',
          name: '周泫淇',
          alternateName: 'Syuan Ci',
          jobTitle: 'UI/UX 設計師',
          url: 'https://portfolio.example/',
          image: 'https://portfolio.example/og/home.v1.png',
          sameAs: [linkedin],
        },
        {
          '@type': 'WebSite',
          '@id': 'https://portfolio.example/#website',
          name: '周泫淇 Syuan Ci｜UI/UX 設計師作品集',
          url: 'https://portfolio.example/',
          inLanguage: 'zh-Hant-TW',
          author: { '@id': 'https://portfolio.example/#person' },
        },
      ],
    });
    expect(JSON.stringify(data)).not.toContain('<');
  });

  it('creates CreativeWork data for every project and existing share image', () => {
    const projectSlugs = readdirSync(
      new URL('../../src/content/projects/', import.meta.url),
    )
      .filter((file) => file.endsWith('.yaml'))
      .map((file) => file.replace(/\.yaml$/u, ''));

    expect(projectSlugs).toHaveLength(7);
    for (const slug of projectSlugs) {
      const data = createCreativeWorkStructuredData({
        siteUrl,
        slug,
        name: '88Win',
        nameZh: '線上娛樂城',
        description: '案例描述',
      });

      expect(data).toEqual({
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        name: '線上娛樂城 88Win',
        description: '案例描述',
        url: `https://portfolio.example/work/${slug}/`,
        image: expect.stringMatching(
          /^https:\/\/portfolio\.example\/og\/.+\.v\d+\.(?:png|jpg)$/u,
        ),
        inLanguage: 'zh-Hant-TW',
        creator: {
          '@type': 'Person',
          '@id': 'https://portfolio.example/#person',
          name: '周泫淇',
          url: 'https://portfolio.example/',
        },
      });
      expect(
        existsSync(
          new URL(
            `../../public${new URL(data.image).pathname}`,
            import.meta.url,
          ),
        ),
      ).toBe(true);
      expect(JSON.stringify(data)).not.toContain('<');
    }
  });
});
