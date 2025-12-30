import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
  ],
  // We use the variable we baked in Step 1
  secret: process.env.NEXTAUTH_SECRET,
  
  // Enable debug to see the real error in Amplify Logs
  debug: true, 

  // If 'trustHost' failed for you, we remove it here.
  // The 'AUTH_TRUST_HOST' env var in Step 1 handles it automatically.
});

export { handler as GET, handler as POST };