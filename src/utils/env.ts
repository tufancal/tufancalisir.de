/**
 * Gets the appropriate Storyblok content version based on build mode
 * - Dev server or staging build (--mode development): returns 'draft'
 * - Production build (--mode production): returns 'published'
 */
<<<<<<< HEAD
export const getStoryblokVersion = (): "draft" | "published" => {
  return import.meta.env.DEV || import.meta.env.MODE === "development"
    ? "draft"
    : "published";
=======
export const getStoryblokVersion = (): 'draft' | 'published' => {
  return import.meta.env.DEV || import.meta.env.MODE === 'development'
    ? 'draft'
    : 'published';
>>>>>>> ed2f3cf (fix: use versioning util)
};
