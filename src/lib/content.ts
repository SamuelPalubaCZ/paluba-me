import { getEmDashCollection, getEmDashEntry } from 'emdash';

export type SiteEntry = {
  slug: string;
  title: string;
  description: string;
  body: string;
  kicker?: string;
  date?: string;
  tags?: string[];
  status?: string;
  repoUrl?: string;
  siteUrl?: string;
  featured?: boolean;
};

const bodyFromPortableText = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (!Array.isArray(value)) return '';

  return value
    .map((block) => {
      if (!block || typeof block !== 'object') return '';
      const children = 'children' in block ? block.children : undefined;
      if (!Array.isArray(children)) return '';
      return children
        .map((child) =>
          child && typeof child === 'object' && 'text' in child && typeof child.text === 'string'
            ? child.text
            : '',
        )
        .join('');
    })
    .filter(Boolean)
    .join('\n\n');
};

const normalizeEntry = (entry: any): SiteEntry => {
  const data = entry?.data ?? {};

  return {
    slug: String(entry?.slug ?? data.slug ?? entry?.id ?? ''),
    title: String(data.title ?? entry?.title ?? 'Untitled'),
    description: String(data.description ?? ''),
    body: bodyFromPortableText(data.body) || String(data.body ?? ''),
    kicker: data.kicker ? String(data.kicker) : undefined,
    date: data.published_at ? String(data.published_at) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : undefined,
    status: data.status ? String(data.status) : undefined,
    repoUrl: data.repo_url ? String(data.repo_url) : undefined,
    siteUrl: data.site_url ? String(data.site_url) : undefined,
    featured: Boolean(data.featured),
  };
};

export const fallbackPages: SiteEntry[] = [
  {
    slug: 'about',
    kicker: 'About',
    title: 'I build small, understandable systems.',
    description:
      'Personal notes and projects around open software, hardware, Bitcoin, and decentralized technology.',
    body:
      'I care about tools people can inspect, repair, and keep using. This site collects the public work, writing, and experiments that fit that direction.',
  },
  {
    slug: 'contact',
    kicker: 'Contact',
    title: 'Reach out about projects, writing, or open technology.',
    description:
      'The simplest path is best: email, GitHub, or X for public context.',
    body:
      'Useful notes are specific: what you are building, what you need, and where the current code or context lives.',
  },
];

export const fallbackPosts: SiteEntry[] = [
  {
    slug: 'first-note',
    title: 'First note',
    description: 'Why this site starts small and editable.',
    body:
      'The site is intentionally plain: a few routes, editable content, and Cloudflare-native hosting. More structure can wait until the writing needs it.',
    date: '2026-07-03',
    tags: ['notes'],
    featured: true,
  },
  {
    slug: 'tools-worth-owning',
    title: 'Tools worth owning',
    description: 'A note on open, durable, user-controlled tools.',
    body:
      'Good tools reward understanding. They keep data portable, expose the important moving parts, and avoid turning basic work into dependency on someone else’s dashboard.',
    date: '2026-07-03',
    tags: ['tools'],
  },
];

export const fallbackProjects: SiteEntry[] = [
  {
    slug: 'personal-site',
    title: 'paluba.me',
    description: 'An Astro 7, EmDash, Starwind UI, and Cloudflare Workers personal website.',
    body:
      'The site itself is the first project: editable content, Cloudflare-native hosting, and a small codebase that can evolve in public.',
    status: 'Building',
    repoUrl: 'https://github.com/SamuelPalubaCZ/paluba-me',
    siteUrl: 'https://paluba.me',
    tags: ['Astro', 'Cloudflare', 'EmDash'],
    featured: true,
  },
  {
    slug: 'open-systems-notes',
    title: 'Open systems notes',
    description: 'Research, experiments, and links around open technology.',
    body:
      'A place for practical notes on systems that remain understandable: protocols, tooling, hardware, and deployment choices that do not hide all the important details.',
    status: 'Drafting',
    tags: ['Research', 'Open tech'],
  },
];

export const getEntries = async (
  collection: 'pages' | 'posts' | 'projects',
  fallback: SiteEntry[],
) => {
  try {
    const result = await getEmDashCollection(collection, { status: 'published' } as never);
    if (result.error || !result.entries?.length) return fallback;
    return result.entries.map(normalizeEntry).filter((entry) => entry.slug);
  } catch {
    return fallback;
  }
};

export const getEntry = async (
  collection: 'pages' | 'posts' | 'projects',
  slug: string,
  fallback: SiteEntry[],
) => {
  try {
    const result = await getEmDashEntry(collection, slug);
    if (result.error || !result.entry) return fallback.find((entry) => entry.slug === slug);
    return normalizeEntry(result.entry);
  } catch {
    return fallback.find((entry) => entry.slug === slug);
  }
};
