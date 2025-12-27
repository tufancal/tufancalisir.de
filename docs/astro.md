# Astro Architecture & Patterns

This document covers Astro-specific architecture, routing patterns, and development practices used in this portfolio project.

## Configuration

### astro.config.mjs

The project uses a focused Astro configuration with key integrations:

```javascript
export default defineConfig({
  integrations: [
    storyblok({
      output: "static",
      accessToken: env.STORYBLOK_TOKEN,
      components: { /* ... */ },
      apiOptions: { region: "eu" },
      bridge: true,
    }),
  ],
  vite: {
    plugins: [tailwindcss(), mkcert()],
    resolve: {
      alias: { "@": path.resolve("./") },
    },
  },
});
```

**Important Configuration Details**:
- **Static Output**: Site is fully static (SSG) - no SSR
- **Path Alias**: `@/` maps to project root (configured in both Astro and TypeScript)
- **Tailwind v4**: Uses Vite plugin instead of Astro integration
- **HTTPS Dev Server**: `vite-plugin-mkcert` enables HTTPS for Storyblok Bridge compatibility

## Project Structure

```
src/
├── components/       # Astro components
│   ├── atoms/       # (atomic design pattern)
│   ├── blocks/      # (atomic design pattern)
│   ├── molecules/   # (atomic design pattern)
│   └── organisms/   # (atomic design pattern)
├── icons/           # SVG icons
├── layouts/         # Layout components
│   └── Layout.astro # Main layout wrapper
├── pages/           # File-based routing
│   ├── index.astro
│   └── blog/
│       ├── index.astro
│       └── [...slug].astro
├── utils/           # Utility functions
│   ├── date.ts
│   └── optimizeImage.ts
└── styles.css       # Global styles (Tailwind + daisyUI)
```

## Routing Patterns

### Static Routes

Simple static pages fetch their content from Storyblok:

```astro
// src/pages/index.astro
---
import Layout from "@/src/layouts/Layout.astro";
import StoryblokComponent from "@storyblok/astro/StoryblokComponent.astro";
import { useStoryblokApi } from "@storyblok/astro";

const storyblokApi = useStoryblokApi();
const { data } = await storyblokApi.get("cdn/stories/home", {
  version: import.meta.env.DEV ? "draft" : "published",
});

const content = data.story.content;
---

<Layout seoPage={{ title: "Home", description: "Home" }}>
  <StoryblokComponent blok={content} />
</Layout>
```

**Pattern**: Fetch story by slug → Pass content to StoryblokComponent → Dynamically renders

### Dynamic Routes

Blog posts use dynamic routing with `getStaticPaths()`:

```astro
// src/pages/blog/[...slug].astro
export async function getStaticPaths() {
  const sbApi = useStoryblokApi();

  const { data } = await sbApi.get("cdn/stories", {
    content_type: "blogPost",
    version: import.meta.env.DEV ? "draft" : "published",
  });

  const stories = Object.values(data.stories);

  return stories.map((story: any) => ({
    params: { slug: story.slug },
  }));
}

const sbApi = useStoryblokApi();
const { slug } = Astro.params;
const { data } = await sbApi.get(`cdn/stories/blog/${slug}`, {
  version: import.meta.env.DEV ? "draft" : "published",
});
```

**Pattern**:
1. `getStaticPaths()` fetches all stories of a content type at build time
2. Returns array of `params` for each story
3. Component code fetches individual story by slug
4. Astro generates static HTML for each path

**Important**: This is a catch-all route (`[...slug].astro`), not `[slug].astro`, allowing nested paths if needed.

## Layout Pattern

### Main Layout (`src/layouts/Layout.astro`)

The layout handles:
- Global SEO metadata (fetched from Storyblok)
- Header and Footer (fetched globally)
- Font preloading
- Canonical URLs and Open Graph tags

**Key Pattern - Global Data Fetching**:

```astro
---
const storyblokApi = useStoryblokApi();

// Fetch global data in parallel
const { data: seoData } = await storyblokApi.get("cdn/stories/global/seo", {
  version: import.meta.env.DEV ? "draft" : "published",
});

const { data: footerData } = await storyblokApi.get("cdn/stories/global/footer", {
  version: import.meta.env.DEV ? "draft" : "published",
});

const { data: headerData } = await storyblokApi.get("cdn/stories/global/header", {
  version: import.meta.env.DEV ? "draft" : "published",
});

const seo = seoData.story.content;
const header = headerData.story.content;
const footer = footerData.story.content;
const { seoPage } = Astro.props; // Page-specific SEO from props
---

<html data-theme="nearanimal" lang="en">
  <head>
    <title>{seoPage.title} | {seo.siteName}</title>
    <meta name="description" content={seoPage.description} />
    <!-- ... more meta tags ... -->
  </head>
  <body class="bg-gallery">
    <StoryblokComponent blok={header} />
    <main>
      <slot />
    </main>
    <StoryblokComponent blok={footer} />
  </body>
</html>
```

**Layout Props Interface**:
```typescript
interface Props {
  seoPage: {
    title: string;
    description: string;
  };
}
```

Pages pass SEO data via props:
```astro
<Layout seoPage={{ title: "Blog", description: "Blog" }}>
```

### Font Preloading Strategy

The layout preloads critical fonts for performance:

```astro
<link
  rel="preload"
  href="/fonts/subset-Hind-SemiBold.woff2"
  as="font"
  type="font/woff2"
  crossorigin
/>
```

**Font Strategy**:
1. Subset fonts (optimized) declared last in CSS to take precedence
2. Full fonts as fallback
3. Critical fonts preloaded in `<head>`
4. `font-display: swap` for all fonts

## Component Patterns

### Component Props Typing

Components use TypeScript interfaces for strong typing:

```astro
---
import type { BlogPost } from "@/.storyblok/types/285719928053161/storyblok-components";

interface Props {
  blok: BlogPost;
  publishedAt: string;
}

const { blok, publishedAt } = Astro.props;
---
```

**Pattern**: Import generated Storyblok types from `.storyblok/types/` directory (generated via `npm run types`).

### Conditional Rendering

```astro
{
  blok.navLinks?.map((link: any) => (
    <li>
      <StoryblokComponent blok={link} variant="secondary" />
    </li>
  ))
}
```

**Pattern**: Use optional chaining (`?.`) for arrays that might not exist. Map over Storyblok arrays to render child components.

### Passing Additional Props to Storyblok Components

```astro
<StoryblokComponent blok={link} variant="secondary" />
```

Storyblok components can receive additional props beyond `blok`. These props are available in the child component via `Astro.props`.

## Utility Functions

### Date Utilities (`src/utils/date.ts`)

Two formatting functions for consistent date display:

```typescript
// For display: "01.01.1970"
formatDate(dateString: string): string

// For datetime attributes: "1970-01-01"
formatDateTime(dateString: string): string
```

**Usage in components**:
```astro
<time datetime={formatDateTime(publishedAt)}>
  {formatDate(publishedAt)}
</time>
```

### Image Optimization (`src/utils/optimizeImage.ts`)

**Function**: `optimizeStoryblokImage(filename, options)`
- Resizes Storyblok images via Image Service
- Adds WebP format filter
- Returns optimized URL

**Function**: `generateResponsiveImageData(filename, options)`
- Generates responsive `srcset` and `sizes`
- Calculates heights based on aspect ratio
- Returns `{ src, srcset, sizes }` object

**Usage with Astro Image**:
```astro
const image = generateResponsiveImageData(blok.image.filename, {
  breakpoints: [240, 320, 400, 560, 800, 1024, 1280],
  aspectRatio: 3 / 2,
  sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px",
});
---
<Image src={image.src} alt={blok.image.alt} inferSize />
```

## Development Workflow

### Environment-Based Content Versioning

All Storyblok API calls use this pattern:

```javascript
version: import.meta.env.DEV ? "draft" : "published"
```

- **Development** (`npm run dev`): Fetches draft content (unpublished changes visible)
- **Production** (`npm run build`): Fetches published content only

### Type Generation Workflow

1. Create/modify components in Storyblok CMS
2. Run `npm run types` to:
   - Pull component schemas via Storyblok CLI
   - Generate TypeScript types in `.storyblok/types/`
3. Import types in components for type safety

### Build Process

```bash
npm run build      # Builds to ./dist/
npm run preview    # Serves built site locally
```

**Build Details**:
- Generates static HTML for all routes
- `getStaticPaths()` determines which pages to build
- All Storyblok content fetched at build time (no runtime API calls)

## Performance Optimizations

### Image Loading Strategy

```astro
<Image class="mb-8" src={image.src} alt={blok.image.alt} inferSize />
```

- Use `inferSize` to let Astro automatically determine dimensions
- Responsive images via `generateResponsiveImageData()`
- WebP format for all Storyblok images

### Rich Text Image Optimization

```astro
<Fragment
  set:html={renderRichText(blok.copy, {
    optimizeImages: {
      width: 1024,
      height: 576,
      loading: "lazy",
      filters: { format: "webp", quality: 85 },
      srcset: [320, 640, 768, 1024, 1280],
      sizes: ["(max-width: 640px) 100vw", "(max-width: 1024px) 80vw", "1024px"],
    },
  })}
/>
```

**Pattern**: Pass `optimizeImages` config to `renderRichText()` to automatically optimize images in rich text content.

## Common Patterns

### Fetching Content by Content Type

```javascript
const { data } = await sbApi.get("cdn/stories", {
  content_type: "blogPost",
  version: import.meta.env.DEV ? "draft" : "published",
});
```

### Fetching Single Story by Path

```javascript
const { data } = await sbApi.get("cdn/stories/blog/my-post", {
  version: import.meta.env.DEV ? "draft" : "published",
});
```

### Fetching Global Content

```javascript
const { data } = await sbApi.get("cdn/stories/global/header", {
  version: import.meta.env.DEV ? "draft" : "published",
});
```

**Pattern**: Global content (header, footer, SEO) stored under `cdn/stories/global/*` path in Storyblok.

## TypeScript Configuration

### tsconfig.json

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

**Important**:
- Extends Astro's strict config (recommended)
- Path alias `@/*` matches Vite alias configuration
- Allows imports like `@/src/utils/date.ts` from anywhere

## Debugging Tips

### Console Logging Storyblok Data

```astro
---
const { data } = await storyblokApi.get("cdn/stories/home");
console.log(data.story.content); // Logs during build/dev
---
```

**Note**: Console logs appear in terminal during build/dev, not in browser.

### Checking Generated Types

After running `npm run types`, inspect generated types:
```
.storyblok/types/285719928053161/storyblok-components.d.ts
```

These types provide IntelliSense for Storyblok component fields.

## Best Practices

1. **Always Use Type Safety**: Import and use generated Storyblok types
2. **Environment-Based Versioning**: Use `import.meta.env.DEV` for content version
3. **Global Data in Layout**: Fetch shared data (header, footer, SEO) in layout, not per page
4. **Optional Chaining**: Use `?.` when mapping over Storyblok arrays
5. **Responsive Images**: Always use `generateResponsiveImageData()` for hero/large images
6. **Lazy Loading**: Enable lazy loading for images in rich text content
7. **Font Preloading**: Preload critical fonts in layout `<head>`
8. **SEO Props**: Pass page-specific SEO to Layout via props
