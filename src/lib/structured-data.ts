import { getShareImage } from './share-image';

const PERSON_NAME = '周泫淇';
const PERSON_ALTERNATE_NAME = 'Syuan Ci';
const PERSON_JOB_TITLE = 'UI/UX 設計師';
const LANGUAGE = 'zh-Hant-TW';

interface HomeStructuredDataInput {
  siteUrl: URL;
  title: string;
  linkedin: string;
}

interface CreativeWorkStructuredDataInput {
  siteUrl: URL;
  slug: string;
  name: string;
  nameZh: string;
  description: string;
}

export function createHomeStructuredData({
  siteUrl,
  title,
  linkedin,
}: HomeStructuredDataInput) {
  const rootUrl = new URL('/', siteUrl).href;
  const personId = new URL('/#person', siteUrl).href;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': personId,
        name: PERSON_NAME,
        alternateName: PERSON_ALTERNATE_NAME,
        jobTitle: PERSON_JOB_TITLE,
        url: rootUrl,
        image: new URL(getShareImage('home').path, siteUrl).href,
        sameAs: [linkedin],
      },
      {
        '@type': 'WebSite',
        '@id': new URL('/#website', siteUrl).href,
        name: title,
        url: rootUrl,
        inLanguage: LANGUAGE,
        author: { '@id': personId },
      },
    ],
  };
}

export function createCreativeWorkStructuredData({
  siteUrl,
  slug,
  name,
  nameZh,
  description,
}: CreativeWorkStructuredDataInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: `${nameZh} ${name}`,
    description,
    url: new URL(`/work/${slug}/`, siteUrl).href,
    image: new URL(getShareImage(slug).path, siteUrl).href,
    inLanguage: LANGUAGE,
    creator: {
      '@type': 'Person',
      '@id': new URL('/#person', siteUrl).href,
      name: PERSON_NAME,
      url: new URL('/', siteUrl).href,
    },
  };
}
