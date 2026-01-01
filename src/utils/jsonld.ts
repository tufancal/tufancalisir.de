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

export type JSONLDSchema =
  | PersonSchema
  | WebsiteSchema
  | BlogPostingSchema
  | BreadcrumbListSchema
  | Array<PersonSchema | WebsiteSchema | BlogPostingSchema | BreadcrumbListSchema>;

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
 * Converts schema object(s) to JSON string for use in script tag
 */
export function schemaToJson(schema: JSONLDSchema): string {
  return JSON.stringify(schema);
}
