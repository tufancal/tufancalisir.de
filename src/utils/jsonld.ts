/**
 * JSON-LD Schema utilities for SEO
 * Generates structured data for different page types
 */

export interface PersonSchema {
  "@context": "https://schema.org";
  "@type": "Person";
  name: string;
  url: string;
  jobTitle?: string;
  description?: string;
  image?: string;
  sameAs?: string[];
}

export interface WebsiteSchema {
  "@context": "https://schema.org";
  "@type": "WebSite";
  name: string;
  url: string;
  description?: string;
  publisher?: {
    "@type": "Person" | "Organization";
    name: string;
    url?: string;
  };
}

export interface BlogPostingSchema {
  "@context": "https://schema.org";
  "@type": "BlogPosting";
  headline: string;
  description: string;
  author: {
    "@type": "Person";
    name: string;
    url?: string;
  };
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string;
  publisher?: {
    "@type": "Person" | "Organization";
    name: string;
    url?: string;
  };
  mainEntityOfPage?: {
    "@type": "WebPage";
    "@id": string;
  };
}

export interface BreadcrumbListSchema {
  "@context": "https://schema.org";
  "@type": "BreadcrumbList";
  itemListElement: Array<{
    "@type": "ListItem";
    position: number;
    name: string;
    item?: string;
  }>;
}

export interface OrganizationSchema {
  "@context": "https://schema.org";
  "@type": "Organization";
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  founder?: {
    "@type": "Person";
    name: string;
    url?: string;
  };
}

export interface WebPageSchema {
  "@context": "https://schema.org";
  "@type": "WebPage";
  name: string;
  url: string;
  description?: string;
  isPartOf?: {
    "@type": "WebSite";
    name: string;
    url: string;
  };
  breadcrumb?: {
    "@type": "BreadcrumbList";
    itemListElement: Array<{
      "@type": "ListItem";
      position: number;
      name: string;
      item?: string;
    }>;
  };
}

export interface CollectionPageSchema {
  "@context": "https://schema.org";
  "@type": "CollectionPage";
  name: string;
  url: string;
  description?: string;
  isPartOf?: {
    "@type": "WebSite";
    name: string;
    url: string;
  };
  mainEntity?: {
    "@type": "ItemList";
    itemListElement: Array<{
      "@type": "ListItem";
      position: number;
      url: string;
      name: string;
    }>;
  };
}

export type JSONLDSchema =
  | PersonSchema
  | WebsiteSchema
  | BlogPostingSchema
  | BreadcrumbListSchema
  | OrganizationSchema
  | WebPageSchema
  | CollectionPageSchema
  | Array<PersonSchema | WebsiteSchema | BlogPostingSchema | BreadcrumbListSchema | OrganizationSchema | WebPageSchema | CollectionPageSchema>;

/**
 * Creates a Person schema for the website owner/author
 */
export function createPersonSchema(data: {
  name: string;
  url: string;
  jobTitle?: string;
  description?: string;
  image?: string;
  sameAs?: string[];
}): PersonSchema {
  const schema: PersonSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: data.name,
    url: data.url,
  };

  if (data.jobTitle) schema.jobTitle = data.jobTitle;
  if (data.description) schema.description = data.description;
  if (data.image) schema.image = data.image;
  if (data.sameAs && data.sameAs.length > 0) schema.sameAs = data.sameAs;

  return schema;
}

/**
 * Creates a Website schema
 */
export function createWebsiteSchema(data: {
  name: string;
  url: string;
  description?: string;
  publisherName?: string;
  publisherUrl?: string;
}): WebsiteSchema {
  const schema: WebsiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: data.name,
    url: data.url,
  };

  if (data.description) schema.description = data.description;
  if (data.publisherName) {
    schema.publisher = {
      "@type": "Person",
      name: data.publisherName,
    };
    if (data.publisherUrl) schema.publisher.url = data.publisherUrl;
  }

  return schema;
}

/**
 * Creates a BlogPosting schema
 */
export function createBlogPostSchema(data: {
  headline: string;
  description: string;
  authorName: string;
  authorUrl?: string;
  datePublished: string;
  dateModified?: string;
  url: string;
  image?: string;
  publisherName?: string;
  publisherUrl?: string;
}): BlogPostingSchema {
  const schema: BlogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: data.headline,
    description: data.description,
    author: {
      "@type": "Person",
      name: data.authorName,
    },
    datePublished: data.datePublished,
    url: data.url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": data.url,
    },
  };

  if (data.authorUrl) schema.author.url = data.authorUrl;
  if (data.dateModified) schema.dateModified = data.dateModified;
  if (data.image) schema.image = data.image;
  if (data.publisherName) {
    schema.publisher = {
      "@type": "Person",
      name: data.publisherName,
    };
    if (data.publisherUrl) schema.publisher.url = data.publisherUrl;
  }

  return schema;
}

/**
 * Creates a BreadcrumbList schema
 */
export function createBreadcrumbSchema(
  items: Array<{ name: string; url?: string }>,
  baseUrl?: string
): BreadcrumbListSchema {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      let itemUrl = item.url;

      // Convert relative URLs to absolute URLs if baseUrl is provided
      if (itemUrl && baseUrl) {
        if (!itemUrl.startsWith('http://') && !itemUrl.startsWith('https://')) {
          itemUrl = new URL(itemUrl, baseUrl).toString();
        }
      }

      return {
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        ...(itemUrl && { item: itemUrl }),
      };
    }),
  };
}

/**
 * Creates an Organization schema for business/freelance entities
 */
export function createOrganizationSchema(data: {
  name: string;
  url: string;
  logo?: string;
  description?: string;
  sameAs?: string[];
  founderName?: string;
  founderUrl?: string;
}): OrganizationSchema {
  const schema: OrganizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: data.name,
    url: data.url,
  };

  if (data.logo) schema.logo = data.logo;
  if (data.description) schema.description = data.description;
  if (data.sameAs && data.sameAs.length > 0) schema.sameAs = data.sameAs;
  if (data.founderName) {
    schema.founder = {
      "@type": "Person",
      name: data.founderName,
    };
    if (data.founderUrl) schema.founder.url = data.founderUrl;
  }

  return schema;
}

/**
 * Creates a WebPage schema for general pages
 */
export function createWebPageSchema(data: {
  name: string;
  url: string;
  description?: string;
  siteName?: string;
  siteUrl?: string;
  breadcrumbs?: Array<{ name: string; url?: string }>;
  baseUrl?: string;
}): WebPageSchema {
  const schema: WebPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: data.name,
    url: data.url,
  };

  if (data.description) schema.description = data.description;
  if (data.siteName && data.siteUrl) {
    schema.isPartOf = {
      "@type": "WebSite",
      name: data.siteName,
      url: data.siteUrl,
    };
  }
  if (data.breadcrumbs && data.breadcrumbs.length > 0) {
    schema.breadcrumb = {
      "@type": "BreadcrumbList",
      itemListElement: data.breadcrumbs.map((item, index) => {
        let itemUrl = item.url;
        if (itemUrl && data.baseUrl) {
          if (!itemUrl.startsWith('http://') && !itemUrl.startsWith('https://')) {
            itemUrl = new URL(itemUrl, data.baseUrl).toString();
          }
        }
        return {
          "@type": "ListItem",
          position: index + 1,
          name: item.name,
          ...(itemUrl && { item: itemUrl }),
        };
      }),
    };
  }

  return schema;
}

/**
 * Creates a CollectionPage schema for blog index/listing pages
 */
export function createCollectionPageSchema(data: {
  name: string;
  url: string;
  description?: string;
  siteName?: string;
  siteUrl?: string;
  items?: Array<{ name: string; url: string }>;
  baseUrl?: string;
}): CollectionPageSchema {
  const schema: CollectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: data.name,
    url: data.url,
  };

  if (data.description) schema.description = data.description;
  if (data.siteName && data.siteUrl) {
    schema.isPartOf = {
      "@type": "WebSite",
      name: data.siteName,
      url: data.siteUrl,
    };
  }
  if (data.items && data.items.length > 0) {
    schema.mainEntity = {
      "@type": "ItemList",
      itemListElement: data.items.map((item, index) => {
        let itemUrl = item.url;
        if (data.baseUrl) {
          if (!itemUrl.startsWith('http://') && !itemUrl.startsWith('https://')) {
            itemUrl = new URL(itemUrl, data.baseUrl).toString();
          }
        }
        return {
          "@type": "ListItem",
          position: index + 1,
          url: itemUrl,
          name: item.name,
        };
      }),
    };
  }

  return schema;
}

/**
 * Converts schema object(s) to JSON string for use in script tag
 */
export function schemaToJson(schema: JSONLDSchema): string {
  return JSON.stringify(schema);
}
