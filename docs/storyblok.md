# Storyblok Integration Guide

This document covers the Storyblok CMS integration patterns, component architecture, and API usage in this portfolio project.

## Overview

Storyblok is the headless CMS powering all content in this project. The integration uses:
- **@storyblok/astro** - Official Astro integration
- **Conditional Output Mode** - Server mode for staging (live editing), static for production
- **@astrojs/cloudflare** - Adapter for SSR mode on Cloudflare Pages
- **EU Region** - API configured for European data center
- **Bridge Mode** - Live preview in Storyblok visual editor (staging only)
- **TypeScript Types** - Auto-generated from Storyblok schemas

## Configuration

### Astro Config (`astro.config.mjs`)

```javascript
import cloudflare from "@astrojs/cloudflare";
import { storyblok } from "@storyblok/astro";

const enableBridge = process.env.ENABLE_STORYBLOK_BRIDGE === "true";
const outputMode = enableBridge ? "server" : "static";

export default defineConfig({
  output: outputMode,
  adapter: outputMode !== "static" ? cloudflare() : undefined,
  integrations: [
    storyblok({
      accessToken: env.STORYBLOK_TOKEN,
      components: {
        link: "components/Link",
        page: "components/Page",
        textBackground: "components/TextBackground",
        blogPost: "components/BlogPost",
        blogPostList: "components/BlogPostList",
        header: "components/Header",
        navLink: "components/NavLink",
        footer: "components/Footer",
        intro: "components/Intro",
      },
      apiOptions: {
        region: "eu",
      },
      bridge: enableBridge,
    }),
  ],
});
```

**Key Configuration**:
- `output` - Conditional: `"server"` for live editing (staging), `"static"` for production
- `adapter` - Cloudflare adapter enabled when using server mode
- `accessToken` - Loaded from environment variable
- `components` - Maps Storyblok component names to Astro files
- `region: "eu"` - Uses EU API endpoint
- `bridge` - Controlled by `ENABLE_STORYBLOK_BRIDGE` environment variable

### Component Mapping

The `components` object maps Storyblok component names to Astro component paths:

```javascript
components: {
  link: "components/Link",  // Storyblok "link" → /src/components/Link.astro
  page: "components/Page",  // Storyblok "page" → /src/components/Page.astro
}
```

**Important**: Paths are relative to `src/`, don't include `.astro` extension.

### Environment Variables

Required in `.env`:

```bash
STORYBLOK_TOKEN=your_preview_token_here
STORYBLOK_SPACE_ID=285719928053161

# Enable Storyblok Bridge and SSR for live editing
# true: server mode with Bridge (local dev, staging)
# false: static mode (production)
ENABLE_STORYBLOK_BRIDGE=true
```

**Token**: Get from Storyblok Settings → Access Tokens → Preview token

**Space ID**: Used by `npm run types` command to generate TypeScript definitions

**ENABLE_STORYBLOK_BRIDGE**: Controls output mode and Bridge enablement
- Set to `true` in Cloudflare Pages staging environment for live preview
- Set to `false` in production for optimal static performance

## Content Architecture

### Content Structure in Storyblok

```
Stories/
├── home (page)
├── blog/ (folder)
│   ├── index (page)
│   └── my-post (blogPost)
├── global/ (folder)
│   ├── seo
│   ├── header
│   ├── footer
│   └── social-media
```

**Pattern**:
- **Pages**: Top-level content (home, about, etc.)
- **Blog**: Content type for blog posts
- **Global**: Shared content (header, footer, SEO, social media)

### Global Content Pattern

Global content is fetched in `Layout.astro` and used site-wide:

```astro
import { getStoryblokVersion } from "@/src/utils/env";

const { data: seoData } = await storyblokApi.get("cdn/stories/global/seo", {
  version: getStoryblokVersion(),
});

const { data: headerData } = await storyblokApi.get("cdn/stories/global/header", {
  version: getStoryblokVersion(),
});

const { data: footerData } = await storyblokApi.get("cdn/stories/global/footer", {
  version: getStoryblokVersion(),
});
```

**Why Global?**:
- DRY principle - Fetch once per page
- Consistent header/footer across site
- Centralized SEO management

## API Usage Patterns

### Getting the API Client

```astro
---
import { useStoryblokApi } from "@storyblok/astro";

const storyblokApi = useStoryblokApi();
---
```

**Note**: Call `useStoryblokApi()` in component frontmatter, not in global scope.

### Fetching a Single Story

```javascript
import { getStoryblokVersion } from "@/src/utils/env";

const { data } = await storyblokApi.get("cdn/stories/home", {
  version: getStoryblokVersion(),
});

const content = data.story.content;
```

**Response Structure**:
```javascript
{
  data: {
    story: {
      name: "Home",
      slug: "home",
      content: { /* Component data */ },
      published_at: "2024-01-01T00:00:00.000Z",
      // ... more metadata
    }
  }
}
```

### Fetching Stories by Content Type

```javascript
import { getStoryblokVersion } from "@/src/utils/env";

const { data } = await sbApi.get("cdn/stories", {
  content_type: "blogPost",
  version: getStoryblokVersion(),
});

const stories = Object.values(data.stories);
```

**Use Case**: Get all blog posts for listing or generating static paths.

### Version Control

All API calls use the `getStoryblokVersion()` helper:

```javascript
import { getStoryblokVersion } from "@/src/utils/env";

version: getStoryblokVersion()
```

The helper returns content version based on build mode:
- **Development** (`npm run dev` or `npm run build:staging`): Returns `'draft'` for unpublished content
- **Production** (`npm run build:production`): Returns `'published'` for production content

**Important**: Never hardcode `"draft"` or `"published"`.

## Component Patterns

### Basic Component Structure

```astro
---
import { storyblokEditable, type SbBlokData } from "@storyblok/astro";
import type { ComponentName } from "@/.storyblok/types/285719928053161/storyblok-components";

interface Props {
  blok: ComponentName;
}

const { blok } = Astro.props;
---

<section {...storyblokEditable(blok as SbBlokData)}>
  <h1>{blok.headline}</h1>
  <p>{blok.text}</p>
</section>
```

**Key Elements**:
1. Import `storyblokEditable` for visual editor compatibility
2. Import TypeScript type for component
3. Define `Props` interface with `blok` prop
4. Spread `{...storyblokEditable(blok)}` on root element
5. Access fields via `blok.fieldName`

### Container Component Pattern (Page)

The `Page` component dynamically renders child blocks:

```astro
---
import StoryblokComponent from "@storyblok/astro/StoryblokComponent.astro";
const { blok } = Astro.props;
---

{
  blok.body?.map((blok: any) => {
    return <StoryblokComponent blok={blok} />;
  })
}
```

**Pattern**:
- `Page` is a container with a `body` field (blocks array)
- Map over `body` to render each child component
- `StoryblokComponent` resolves component based on mapping

**Use Case**: Build flexible page layouts in Storyblok by adding/removing blocks.

### Nested Component Pattern

```astro
---
import StoryblokComponent from "@storyblok/astro/StoryblokComponent.astro";

const { blok } = Astro.props;
---

<section {...storyblokEditable(blok)}>
  <h2>{blok.headline}</h2>
  <ul>
    {blok.blocks?.map((block) => (
      <li>
        <StoryblokComponent blok={block} />
      </li>
    ))}
  </ul>
</section>
```

**Pattern**: Component has a blocks field (array) containing other components.

**Example**: `Intro` component has `blocks` field for link components.

### Passing Additional Props

```astro
<StoryblokComponent blok={link} variant="secondary" />
```

**Use Case**: Pass additional context to child components beyond `blok` data.

**In Child Component**:
```astro
---
interface Props {
  blok: NavLink;
  variant?: "primary" | "secondary";
}

const { blok, variant = "primary" } = Astro.props;
---
```

### Component with Extra Data

```astro
---
interface Props {
  blok: BlogPost;
  publishedAt: string; // Extra prop from story metadata
}

const { blok, publishedAt } = Astro.props;
---

<article {...storyblokEditable(blok)}>
  <time datetime={formatDateTime(publishedAt)}>
    {formatDate(publishedAt)}
  </time>
  <h1>{blok.headline}</h1>
</article>
```

**Pattern**: Pass story metadata (published date, author, etc.) as additional props.

**Usage**:
```astro
<StoryblokComponent blok={content} publishedAt={publishedAt} />
```

## Rich Text Rendering

### Basic Rich Text

```astro
---
import { renderRichText, type StoryblokRichTextNode } from "@storyblok/astro";

const { blok } = Astro.props;
---

<Fragment set:html={renderRichText(blok.copy as StoryblokRichTextNode)} />
```

**Important**:
- Use `Fragment` with `set:html` to render HTML
- Type as `StoryblokRichTextNode` for type safety
- Returns HTML string

### Rich Text with Image Optimization

```astro
<Fragment
  set:html={renderRichText(blok.copy as StoryblokRichTextNode, {
    optimizeImages: {
      width: 1024,
      height: 576,
      loading: "lazy",
      filters: {
        format: "webp",
        quality: 85,
      },
      srcset: [320, 640, 768, 1024, 1280],
      sizes: [
        "(max-width: 640px) 100vw",
        "(max-width: 1024px) 80vw",
        "1024px",
      ],
    },
  })}
/>
```

**Image Optimization Options**:
- `width` / `height` - Max dimensions
- `loading` - `"lazy"` or `"eager"`
- `filters` - Storyblok Image Service filters (format, quality, etc.)
- `srcset` - Array of widths for responsive images
- `sizes` - Media queries for image sizes

**Use Case**: Automatically optimize images embedded in rich text editors.

### Typography Styling

Wrap rich text in prose class for beautiful typography:

```astro
<div class="prose xl:prose-lg">
  <Fragment set:html={renderRichText(blok.copy)} />
</div>
```

## TypeScript Integration

### Generating Types

Run type generation after creating/modifying components in Storyblok:

```bash
npm run types
```

**This command**:
1. Pulls component schemas from Storyblok space 285719928053161
2. Generates TypeScript definitions
3. Outputs to `.storyblok/types/285719928053161/storyblok-components.d.ts`

### Using Generated Types

```astro
---
import type { BlogPost } from "@/.storyblok/types/285719928053161/storyblok-components";

interface Props {
  blok: BlogPost;
}
---
```

**Benefits**:
- IntelliSense for component fields
- Type safety at compile time
- Auto-completion in IDE

### Type Imports

Common type imports:

```typescript
import type { SbBlokData } from "@storyblok/astro";
import type { StoryblokRichTextNode } from "@storyblok/astro";
import type { BlogPost } from "@/.storyblok/types/285719928053161/storyblok-components";
```

## Visual Editor Integration

### Making Components Editable

```astro
---
import { storyblokEditable, type SbBlokData } from "@storyblok/astro";
---

<section {...storyblokEditable(blok as SbBlokData)}>
  <!-- Component content -->
</section>
```

**What it does**:
- Adds data attributes for visual editor
- Enables click-to-edit in Storyblok
- Makes component outline visible in editor

**Important**: Cast to `SbBlokData` for proper typing.

### Bridge Mode

Bridge mode is enabled in config (`bridge: true`), which:
- Loads Storyblok Bridge script in development
- Enables live preview and real-time updates
- Requires HTTPS (handled by `vite-plugin-mkcert`)

**Testing Bridge**:
1. Run `npm run dev`
2. Open Storyblok visual editor
3. Navigate to a story
4. Should see live preview with editable regions

## Working with Assets

### Image Fields

```astro
---
const { blok } = Astro.props;
---

<img src={blok.image.filename} alt={blok.image.alt} />
```

**Image Object Structure**:
```javascript
{
  filename: "https://a.storyblok.com/f/space-id/path/image.jpg",
  alt: "Alt text",
  title: "Title",
  // ... more metadata
}
```

### Optimizing Storyblok Images

```astro
---
import { generateResponsiveImageData } from "../utils/optimizeImage";
import { Image } from "astro:assets";

const image = generateResponsiveImageData(blok.image.filename, {
  breakpoints: [240, 320, 400, 560, 800, 1024, 1280],
  aspectRatio: 3 / 2,
  sizes: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px",
});
---

<Image src={image.src} alt={blok.image.alt} inferSize />
```

**Utility Function**:
- Generates optimized URLs via Storyblok Image Service
- Creates `srcset` for responsive images
- Adds WebP format conversion
- Calculates heights based on aspect ratio

### Link Fields

```astro
---
const { blok } = Astro.props;

const href = blok.link.linktype === "email"
  ? `mailto:${blok.link.url}`
  : blok.link.url;

const target = blok.link.target || "_self";
---

<a href={href} target={target}>
  {blok.text}
</a>
```

**Link Object Structure**:
```javascript
{
  linktype: "url" | "story" | "email" | "asset",
  url: "https://example.com",
  target: "_blank" | "_self",
  // ... more fields
}
```

**Link Types**:
- `url` - External URL
- `story` - Internal story link (slug path)
- `email` - Email address
- `asset` - Asset URL

## Advanced Patterns

### Extracting Anchor IDs from Rich Text

```astro
---
const headlineAnchorIds =
  blok.copy.content
    ?.filter((item) => item.type === "heading")
    .map((heading) => {
      const anchorMark = heading.content?.[0]?.marks?.find(
        (mark) => mark.type === "anchor",
      );
      return { id: anchorMark?.attrs?.id, text: heading.content?.[0]?.text };
    })
    .filter((anchorId) => anchorId !== null && anchorId !== undefined) || [];
---

<ul>
  {headlineAnchorIds.map((anchor) => (
    <li><a href={`#${anchor.id}`}>{anchor.text}</a></li>
  ))}
</ul>
```

**Use Case**: Generate table of contents from headings with anchors in rich text.

### Fetching Related Content

```astro
---
// Fetch main story
const { data: pageData } = await storyblokApi.get("cdn/stories/home");

// Fetch related content based on IDs from main story
const relatedIds = pageData.story.content.relatedPosts;
const relatedStories = await Promise.all(
  relatedIds.map(id => storyblokApi.get(`cdn/stories/${id}`))
);
---
```

**Pattern**: Fetch additional stories referenced by UUIDs in main story.

### Global Data in Non-Layout Components

```astro
---
import { getStoryblokVersion } from "@/src/utils/env";

// Footer.astro fetches its own global data
const { data: socialMediaData } = await storyblokApi.get(
  "cdn/stories/global/social-media",
  { version: getStoryblokVersion() }
);

const socialMedia = socialMediaData.story.content;
---
```

**Use Case**: Component-specific global data that's not needed site-wide.

## Deployment Modes

This project supports two deployment modes controlled by `ENABLE_STORYBLOK_BRIDGE`:

### Production Mode (Static)
When `ENABLE_STORYBLOK_BRIDGE=false`:
1. **Build Time**: All Storyblok API calls happen during `npm run build:production`
2. **Content Fetching**: Published content pulled via API
3. **Static HTML**: Generated for all routes
4. **No Runtime API**: No Storyblok API calls in production
5. **Optimal Performance**: Pre-rendered static pages

### Staging Mode (Server/SSR)
When `ENABLE_STORYBLOK_BRIDGE=true`:
1. **Server-Side Rendering**: Cloudflare adapter enables SSR
2. **Live Preview**: Storyblok Bridge loads for visual editing
3. **Draft Content**: Shows unpublished changes
4. **Real-time Updates**: Changes in Storyblok editor reflect immediately

### Dynamic Routes with SSG

```astro
// src/pages/blog/[...slug].astro
import { getStoryblokVersion } from "@/src/utils/env";

export async function getStaticPaths() {
  const sbApi = useStoryblokApi();

  const { data } = await sbApi.get("cdn/stories", {
    content_type: "blogPost",
    version: getStoryblokVersion(),
  });

  const stories = Object.values(data.stories);

  return stories.map((story: any) => ({
    params: { slug: story.slug },
  }));
}
```

**How it works**:
1. `getStaticPaths()` runs at build time
2. Fetches all stories of a content type
3. Returns array of paths to generate
4. Astro generates static HTML for each path

**Important**: Update content → rebuild site to see changes.

### Webhooks for Auto-Rebuild

To auto-rebuild on content changes:
1. Set up webhook in Storyblok (Settings → Webhooks)
2. Configure webhook to trigger build on your host (Netlify, Vercel, etc.)
3. Content publish → webhook fires → site rebuilds

## Best Practices

1. **Use Version Helper**: Always use `getStoryblokVersion()` from `@/src/utils/env` for content versioning
2. **Type Everything**: Run `npm run types` after component changes
3. **Use storyblokEditable**: Spread on root element of every component
4. **Optional Chaining**: Use `blok.field?.value` for nullable fields
5. **Global Content**: Fetch shared data (header, footer) in layout, not per page
6. **Image Optimization**: Use utility functions for responsive images
7. **Rich Text Typography**: Wrap in `prose` class for proper styling
8. **Bridge Mode**: Test in Storyblok visual editor regularly
9. **Semantic HTML**: Use proper HTML elements (`<article>`, `<section>`, etc.)
10. **Accessibility**: Use `alt` text for images, `aria-label` for icons

## Common Patterns Reference

### Fetching Content

```javascript
import { getStoryblokVersion } from "@/src/utils/env";

// Single story
const { data } = await storyblokApi.get("cdn/stories/home", {
  version: getStoryblokVersion(),
});

// Stories by content type
const { data } = await storyblokApi.get("cdn/stories", {
  content_type: "blogPost",
  version: getStoryblokVersion(),
});

// Nested path
const { data } = await storyblokApi.get("cdn/stories/blog/my-post", {
  version: getStoryblokVersion(),
});
```

### Component Rendering

```astro
<!-- Dynamic component -->
<StoryblokComponent blok={content} />

<!-- Loop over blocks -->
{blok.blocks?.map((block) => (
  <StoryblokComponent blok={block} />
))}

<!-- With additional props -->
<StoryblokComponent blok={content} variant="primary" />
```

### Rich Text

```astro
<!-- Basic -->
<Fragment set:html={renderRichText(blok.copy)} />

<!-- With optimization -->
<Fragment
  set:html={renderRichText(blok.copy, {
    optimizeImages: { /* options */ },
  })}
/>

<!-- With typography -->
<div class="prose">
  <Fragment set:html={renderRichText(blok.copy)} />
</div>
```

## Debugging Tips

### View Raw Storyblok Data

```astro
---
const { data } = await storyblokApi.get("cdn/stories/home");
console.log(JSON.stringify(data, null, 2));
---
```

**Note**: Output appears in terminal during dev/build, not browser console.

### Check Component Mapping

If component doesn't render:
1. Check `astro.config.mjs` for component mapping
2. Verify file path matches mapping
3. Check Storyblok component name (case-sensitive)
4. Ensure component is exported default

### Bridge Not Working

If visual editor preview fails:
1. Check `bridge: true` in config
2. Verify HTTPS is working (`https://localhost:4321`)
3. Check browser console for Bridge errors
4. Ensure `{...storyblokEditable(blok)}` is on component root

### Type Errors

If TypeScript errors after component changes:
1. Run `npm run types`
2. Check `.storyblok/types/` directory exists
3. Verify import path uses `@/` alias
4. Restart TypeScript server in IDE

## Migration Checklist

When adding new Storyblok components:

- [ ] Create component in Storyblok CMS
- [ ] Add mapping in `astro.config.mjs`
- [ ] Create Astro component file
- [ ] Run `npm run types`
- [ ] Import generated type
- [ ] Add `storyblokEditable` to root element
- [ ] Test in visual editor
- [ ] Verify static generation works

## Resources

- [Storyblok Astro Docs](https://github.com/storyblok/storyblok-astro)
- [Storyblok API Docs](https://www.storyblok.com/docs/api/content-delivery)
- [Rich Text Rendering](https://github.com/storyblok/storyblok-js-client#rendering-rich-text)
- [Image Service](https://www.storyblok.com/docs/image-service)
