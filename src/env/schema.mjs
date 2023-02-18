// @ts-check
import { z } from "zod";

/**
 * Specify your server-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 */
export const serverSchema = z.object({
  DATABASE_URL: z.string().url(),
  NODE_ENV: z.enum(["development", "test", "production"]),
  NEXTAUTH_SECRET: z.string(),
  NEXTAUTH_URL: z.preprocess(
    // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
    // Since NextAuth automatically uses the VERCEL_URL if present.
    (str) => process.env.VERCEL_URL ?? str,
    // VERCEL_URL doesnt include `https` so it cant be validated as a URL
    process.env.VERCEL ? z.string() : z.string().url()
  ),
  COGNITO_CLIENT_ID: z.string(),
  COGNITO_CLIENT_SECRET: z.string(),
  COGNITO_ISSUER: z.string(),
  DISCORD_CLIENT_ID: z.string(),
  DISCORD_CLIENT_SECRET: z.string(),
  DISCORD_REDIRECT_URI: z.string(),
  DO_SPACES_REGION: z.string(),
  DO_SPACES_BUCKET: z.string(),
  DO_SPACES_ACCESS_KEY_ID: z.string(),
  DO_SPACES_SECRET_KEY: z.string(),
  ADMIN_USERS_EMAILS: z.string(),
  WARWICK_SU_API_KEY: z.string(),
});

/**
 * Specify your client-side environment variables schema here.
 * This way you can ensure the app isn't built with invalid env vars.
 * To expose them to the client, prefix them with `NEXT_PUBLIC_`.
 */
export const clientSchema = z.object({
  NEXT_PUBLIC_URL: z.string(),
  NEXT_PUBLIC_DISCORD_CLIENT_ID: z.string(),
  NEXT_PUBLIC_DISCORD_REDIRECT_URI: z.string(),
  NEXT_PUBLIC_HOME_PAGE_ROUTE: z.string().optional(),
  NEXT_PUBLIC_CDN_URL: z.string(),
});

/**
 * You can't destruct `process.env` as a regular object, so you have to do
 * it manually here. This is because Next.js evaluates this at build time,
 * and only used environment variables are included in the build.
 * @type {{ [k in keyof z.infer<typeof clientSchema>]: z.infer<typeof clientSchema>[k] | undefined }}
 */
export const clientEnv = {
  // NEXT_PUBLIC_BAR: process.env.NEXT_PUBLIC_BAR,
  NEXT_PUBLIC_URL: process.env.NEXT_PUBLIC_URL,
  NEXT_PUBLIC_DISCORD_CLIENT_ID: process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID,
  NEXT_PUBLIC_DISCORD_REDIRECT_URI:
    process.env.NEXT_PUBLIC_DISCORD_REDIRECT_URI,
  NEXT_PUBLIC_HOME_PAGE_ROUTE: process.env.NEXT_PUBLIC_HOME_PAGE_ROUTE,
  NEXT_PUBLIC_CDN_URL: process.env.NEXT_PUBLIC_CDN_URL,
};
