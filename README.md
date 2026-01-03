# tufancalisir.de

A modern portfolio website built with Astro 5, Tailwind CSS 4, daisyUI 5, and Storyblok CMS. Features a blog system with search, RSS feeds, and comment functionality.

## ✨ Features

- **Astro 5** - Fast, modern static site generator with SSR support
- **Storyblok CMS** - Headless CMS integration with live preview
- **Tailwind CSS 4** - Latest Tailwind with CSS-first configuration
- **daisyUI 5** - Component library with custom theme (`nearanimal`)
- **Blog System** - Full-featured blog with categories, search, and RSS
- **Search** - Pagefind integration for fast site search
- **Comments** - Giscus integration for GitHub-based comments
- **TypeScript** - Full type safety with auto-generated Storyblok types
- **Responsive Design** - Mobile-first approach with semantic HTML
- **SEO Optimized** - Meta tags, Open Graph, structured data (JSON-LD)
- **RSS Feed** - Auto-generated feed for blog posts

## 🚀 Quick Start

### Prerequisites

- Node.js (Latest LTS version recommended)
- Storyblok account and access token

### Installation

1. Clone the repository:
```sh
git clone git@github.com:tufancal/astro-storyblok-boilerplate.git
cd tufancalisir.de
```

2. Install dependencies:
```sh
npm install
```

3. Set up environment variables:
```sh
cp .env.sample .env
```

Edit `.env` and add your credentials:
```env
STORYBLOK_TOKEN=your_token_here
STORYBLOK_SPACE_ID=your_space_id_here
ENABLE_STORYBLOK_BRIDGE=true
EMAILJS_SERVICE_ID=your_emailjs_service_id
EMAILJS_TEMPLATE_ID=your_emailjs_template_id
EMAILJS_PUBLIC_KEY=your_emailjs_public_key
```

4. Generate TypeScript types from Storyblok (ensure `.env` is configured first):
```sh
npm run types
```

5. Start the development server:
```sh
npm run dev
```

Visit [https://localhost:4321](https://localhost:4321) (HTTPS is required for Storyblok Bridge)

## 📁 Project Structure

```text
/
├── docs/                        # Documentation
│   ├── astro.md                # Astro architecture & patterns
│   ├── components.md           # Component system guide
│   ├── styling.md              # Tailwind & daisyUI guide
│   ├── storyblok.md           # Storyblok integration guide
│   └── git-workflow.md        # Git workflow & conventions
├── public/                      # Static assets
│   ├── fonts/                  # Custom fonts (Hind, Cardo)
│   └── favicon.svg
├── src/
│   ├── components/             # Component library (Atomic Design)
│   │   ├── atoms/             # Basic UI elements
│   │   │   ├── Link.astro
│   │   │   ├── NavLink.astro
│   │   │   ├── Pagefind.astro
│   │   │   └── SocialMedia.astro
│   │   ├── molecules/         # Composite components
│   │   │   ├── BlogPostCard.astro
│   │   │   ├── Breadcrumb.astro
│   │   │   ├── CareerItem.astro
│   │   │   ├── CollapsibleItem.astro
│   │   │   ├── FeatureItem.astro
│   │   │   ├── InfoCard.astro
│   │   │   └── PricingCard.astro
│   │   ├── organisms/         # Complex sections
│   │   │   ├── Header.astro
│   │   │   ├── Footer.astro
│   │   │   ├── BlogPost.astro
│   │   │   ├── BlogPostGrid.astro
│   │   │   ├── BlogPostList.astro
│   │   │   ├── HeroSection.astro
│   │   │   ├── RichText.astro
│   │   │   └── ...
│   │   └── Page.astro         # Page wrapper
│   ├── icons/                  # SVG icons
│   ├── layouts/
│   │   └── Layout.astro       # Main layout with SEO
│   ├── pages/                 # File-based routing
│   │   ├── index.astro        # Homepage
│   │   ├── [...slug].astro    # Dynamic pages
│   │   ├── blog/
│   │   │   ├── index.astro    # Blog listing
│   │   │   ├── [...slug].astro # Blog posts
│   │   │   └── kategorie/     # Category pages
│   │   ├── rss.xml.js         # RSS feed
│   │   └── 404.astro
│   ├── utils/                 # Helper functions
│   │   ├── date.ts           # Date formatting
│   │   ├── env.ts            # Environment variables
│   │   ├── jsonld.ts         # Structured data
│   │   ├── optimizeImage.ts  # Image optimization
│   │   ├── richTextResolvers.ts
│   │   ├── storyblok.ts      # Storyblok helpers
│   │   └── highlightCodeBlocks.ts
│   └── styles.css            # Global styles & Tailwind setup
├── astro.config.mjs          # Astro configuration
├── tsconfig.json             # TypeScript config
├── CLAUDE.md                 # Claude Code instructions
└── package.json
```

## 🧞 Commands

All commands run from the project root:

| Command                     | Action                                                    |
| :-------------------------- | :-------------------------------------------------------- |
| `npm install`               | Install dependencies                                       |
| `npm run dev`               | Start local dev server at `https://localhost:4321`        |
| `npm run build`             | Build production site to `./dist/`                        |
| `npm run build:production`  | Build with production config                              |
| `npm run build:staging`     | Build with staging config                                 |
| `npm run preview`           | Preview production build locally                          |
| `npm run types`             | Generate TypeScript types from Storyblok components       |
| `npm run astro ...`         | Run Astro CLI commands (e.g., `astro add`, `astro check`) |

## 🎨 Styling System

- **Tailwind CSS 4**: CSS-first configuration via `@import "tailwindcss"` in [src/styles.css](src/styles.css)
- **daisyUI 5**: Loaded as plugin with custom `nearanimal` theme
- **Typography**: Custom fonts (Hind, Cardo) with subsets for performance
- **Semantic Colors**: Uses daisyUI semantic color system (`bg-base-100`, `text-base-content`, etc.)
- **No Config File**: Tailwind v4 uses CSS-only configuration (no `tailwind.config.js`)

See [docs/styling.md](docs/styling.md) for detailed styling guidelines.

## 🧩 Component Architecture

Follows **Atomic Design** principles:

- **Atoms**: Basic UI elements (buttons, links, inputs)
- **Molecules**: Simple component combinations (cards, breadcrumbs)
- **Organisms**: Complex sections (header, footer, blog lists)
- **Page**: Layout wrapper that renders Storyblok blocks

All components use daisyUI 5 components and semantic colors for theme compatibility.

See [docs/components.md](docs/components.md) for component patterns and examples.

## 📝 Content Management

### Storyblok Integration

- **Region**: EU region
- **Live Preview**: Storyblok Bridge enabled in development
- **Type Safety**: Auto-generated TypeScript types via `npm run types`
- **Global Content**: Header, footer, and SEO data fetched from `cdn/stories/global/*`
- **Version Control**: Draft content in dev, published in production

### Component Mapping

All Storyblok components are mapped to Astro components in [astro.config.mjs](astro.config.mjs). When you create a new component in Storyblok, add the mapping and regenerate types.

See [docs/storyblok.md](docs/storyblok.md) for integration details and patterns.

## 🔧 Configuration

### Environment Variables

- `STORYBLOK_TOKEN`: Your Storyblok access token
- `STORYBLOK_SPACE_ID`: Your Storyblok space ID
- `ENABLE_STORYBLOK_BRIDGE`: Enable live preview (`true` in dev, `false` in production)
- `EMAILJS_SERVICE_ID`, `EMAILJS_TEMPLATE_ID`, `EMAILJS_PUBLIC_KEY`: EmailJS configuration

### Build Modes

- **Static Mode** (default): Pre-renders all pages at build time
- **SSR Mode**: Enabled when `ENABLE_STORYBLOK_BRIDGE=true` for live preview
- **Adapter**: Uses Cloudflare adapter in SSR mode

## 📚 Documentation

Comprehensive guides available in the `docs/` directory:

- [**Astro Guide**](docs/astro.md) - Architecture, routing, utilities, and build process
- [**Component Guide**](docs/components.md) - Atomic design structure and daisyUI patterns
- [**Styling Guide**](docs/styling.md) - Tailwind CSS 4 and daisyUI 5 usage
- [**Storyblok Guide**](docs/storyblok.md) - CMS integration and component patterns
- [**Git Workflow**](docs/git-workflow.md) - Branching strategy and conventions

## 🚢 Deployment

The site is optimized for static deployment on platforms like:
- Cloudflare Pages (recommended)
- Vercel
- Netlify
- Any static hosting service

For SSR deployment (Bridge mode), use Cloudflare Workers or compatible platforms.

## 📄 License

This is a personal portfolio project. Please respect the author's work.

## 🔗 Links

- [Astro Documentation](https://docs.astro.build)
- [Storyblok Documentation](https://www.storyblok.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [daisyUI](https://daisyui.com)
