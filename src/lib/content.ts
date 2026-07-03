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
    title: 'A personal site for work, notes, and experiments.',
    description:
      'Placeholder copy for a site about open software, hardware, Bitcoin, and decentralized technology.',
    body:
      'This page is intentionally editable through EmDash. Replace this placeholder with a sharper biography, current focus, and the problems worth working on.',
  },
  {
    slug: 'contact',
    kicker: 'Contact',
    title: 'Reach out about projects, writing, or open technology.',
    description:
      'The first version keeps contact simple: GitHub, public social links, and a short note that can be edited later.',
    body:
      'Use this page for a short personal contact note, preferred channels, and the kinds of conversations that are useful.',
  },
];

export const fallbackPosts: SiteEntry[] = [
  {
    slug: 'first-note',
    title: 'First note',
    description: 'A placeholder post for the EmDash-backed blog.',
    body:
      'This is a starter post. Replace it in EmDash with a real note about what you are building, reading, or testing.',
    date: '2026-07-03',
    tags: ['notes'],
    featured: true,
  },
  {
    slug: 'tools-worth-owning',
    title: 'Tools worth owning',
    description: 'A placeholder topic for open, durable, user-controlled tools.',
    body:
      'A short draft can live here about software and hardware that rewards understanding instead of lock-in.',
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
    repoUrl: 'https://github.com/SamuelPalubaCZ/paluba.me',
    siteUrl: 'https://paluba.me',
    tags: ['Astro', 'Cloudflare', 'EmDash'],
    featured: true,
  },
  {
    slug: 'open-systems-notes',
    title: 'Open systems notes',
    description: 'A placeholder collection for research, experiments, and links around open technology.',
    body:
      'Use EmDash to turn this into a real project page with links, screenshots, and implementation notes.',
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
