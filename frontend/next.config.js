/** @type {import('next').NextConfig} */
const nextConfig = {
  // 1. THIS IS THE MISSING LINK.
  // It forces the variables to exist at runtime.
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    AUTH_TRUST_HOST: "true",
  },
  // ... keep any other config you had ...
};

export default nextConfig;