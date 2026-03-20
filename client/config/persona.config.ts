export const personaConfig = {
  // App identity
  appName: 'Austin XBT',
  tagline: 'Synthesis Agentic Judging',
  description: 'An AI trained on Austin Griffith to give you real builder feedback on your project idea.',
  siteUrl: 'https://austinxbt.xyz',
  blogUrl: 'https://austingriffith.com',

  // OG / SEO
  ogImagePath: '/og-image-1.1.png',
  favicon: {
    svg: '/favicon_io/favicon.svg',
    ico: '/favicon_io/favicon.ico',
    apple: '/favicon_io/apple-touch-icon.png',
  },

  // Landing page
  heroTitle: 'Austin XBT',
  heroSubtitle: 'Synthesis Agentic Judging',
  heroDescription: "Talk to Austin's AI avatar about your project idea and coin it on Zora.",
  heroAvatarImage: '/avatars/mellow.gif',
  heroAvatarAlt: 'Austin Avatar',
  startChatButtonLabel: 'ASK AUSTIN',

  // Footer
  footer: {
    credit: 'Devfolio',
    creditUrl: 'https://devfolio.co',
    socialLinks: [
      { label: 'Twitter / X', url: 'https://twitter.com/austingriffith' },
      { label: 'Farcaster', url: 'https://warpcast.com/austingriffith' },
    ],
    githubRepo: 'https://github.com/devfolioco/austingpt',
  },

  // Moods / personas
  moods: {
    excited: {
      label: 'Synthesis',
      subtitle: 'The enthusiastic builder mentor.',
      description:
        'Sees a buidler in everyone, bursting with hackathon energy, & ready to help you ship your first prototype.',
      avatarImage: '/avatars/happy.gif',
      accentClass: 'bg-synthesis text-white',
      visualizerVariant: 'synthesis' as const,
      visualizerBgColor: '#16A34A',
      connectingLabel: 'Enthusiastic Austin',
    },
    critical: {
      label: 'Tough Love',
      subtitle: 'The tough-love builder mentor.',
      description: 'Demands you understand the fundamentals, challenges every assumption.',
      avatarImage: '/avatars/skeptical.gif',
      accentClass: 'bg-synthesis-dark text-white',
      visualizerVariant: 'synthesis' as const,
      visualizerBgColor: '#15803D',
      connectingLabel: 'Tough Love Austin',
    },
  },

  // Social share copy templates
  shareCopies: [
    `Pitched my project to AustinXBT as part of Synthesis Agentic Judging.\n\n"Have you tried building it yet?"\n\nFair point.\n\nTry it here \u2192 austinxbt.xyz\n@devfolio`,
    `AustinXBT: "What does the simplest version look like?"\n\nMe: "...good question."\n\nGreat builder feedback.\nTry it: austinxbt.xyz`,
    `AustinXBT is like having a hackathon mentor on demand.\n\nPractical advice. Builder energy.\n\nGo vibe \u2192 austinxbt.xyz\n@devfolio`,
    `AustinXBT loved my idea.\n\nNow I have to actually build it.\n\nIf you need builder feedback, try it \u2192 austinxbt.xyz\n@devfolio`,
    `Picked Tough Love on Austin XBT.\n\nGot asked "but why does this need a blockchain?"\n\nOuch. But fair.\n\naustinxbt.xyz`,
  ],

  shareCopiesWithZora: [
    `Ran my idea through Austin GPT as part of Synthesis Agentic Judging.\nCame out with a plan to build.\n\nMinted this for the record \u2192 {{zora_link}}\n\n@devfolio\n\naustinxbt.xyz`,
    `Talked to AustinXBT.\nKept the receipts.\n\nMinted \u2192 {{zora_link}}\n\n@devfolio\n\naustinxbt.xyz`,
    `AustinXBT said "just build it."\nSo I'm minting the proof.\n\n\u2192 {{zora_link}}\n\n@devfolio\n\naustinxbt.xyz`,
  ],

  // Wallet metadata (for Reown AppKit)
  walletMetadata: {
    name: 'synthesis',
    description: 'Talk to Austin Griffith',
    url: 'https://austinxbt.xyz',
    icons: ['https://avatars.githubusercontent.com/u/2653167'],
  },

  // Share frame
  shareFrame: {
    title: 'Ethereum',
    subtitle: 'is for',
    excitedAvatarImage: '/frame/austin-t-excited.png',
    criticalAvatarImage: '/frame/austin-t-critical.png',
  },
};

export type PersonaConfig = typeof personaConfig;
export type MoodKey = keyof typeof personaConfig.moods;

export const isZoraMintingEnabled = process.env.NEXT_PUBLIC_ENABLE_ZORA_MINTING !== 'false';
