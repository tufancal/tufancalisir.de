import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { storyblok } from "@storyblok/astro";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import path from "path";
import { loadEnv } from "vite";
import mkcert from "vite-plugin-mkcert";

const env = loadEnv("", process.cwd(), "STORYBLOK");
const enableBridge = process.env.ENABLE_STORYBLOK_BRIDGE === "true";
const outputMode = enableBridge ? "server" : "static";

// Use server mode for staging (enables SSR for Bridge), static for production
const outputMode = enableBridge ? "server" : "static";

export default defineConfig({
  site: "https://tufancalisir.de",
  output: outputMode,
  adapter: outputMode !== "static" ? cloudflare() : undefined,
  integrations: [
    react(),
    sitemap(),
    storyblok({
      accessToken: env.STORYBLOK_TOKEN,
      components: {
        link: "components/atoms/Link",
        page: "components/Page",
        textBackground: "components/organisms/TextBackground",
        blogPost: "components/organisms/BlogPost",
        blogPostList: "components/organisms/BlogPostList",
        blogPostGrid: "components/organisms/BlogPostGrid",
        blogPostGridCategory: "components/organisms/BlogPostGridCategory",
        header: "components/organisms/Header",
        navLink: "components/atoms/NavLink",
        footer: "components/organisms/Footer",
        intro: "components/organisms/Intro",
        heroSection: "components/organisms/HeroSection",
        heroImage: "components/organisms/HeroImage",
        featureList: "components/organisms/FeatureList",
        featureItem: "components/molecules/FeatureItem",
        pricingGrid: "components/organisms/PricingGrid",
        pricingCard: "components/molecules/PricingCard",
        pricingCardFeature: "components/molecules/PricingCardFeature",
        contactForm: "components/organisms/ContactForm",
        collapsibleItem: "components/molecules/CollapsibleItem",
        collapsibleItemList: "components/organisms/CollapsibleItemList",
        socialMediaList: "components/organisms/SocialMediaList",
        careerItem: "components/molecules/CareerItem",
        careerTimeline: "components/organisms/CareerTimeline",
        techStackItem: "components/molecules/TechStackItem",
        techStack: "components/organisms/TechStack",
        infoCard: "components/molecules/InfoCard",
        infoCardList: "components/organisms/InfoCardList",
        richText: "components/organisms/RichText",
      },
      apiOptions: {
        region: "eu",
      },
      bridge: enableBridge,
    }),
  ],
  vite: {
    plugins: [tailwindcss(), ...(enableBridge ? [mkcert()] : [])],
    resolve: {
      alias: {
        "@": path.resolve("./"),
      },
    },
  },
});
