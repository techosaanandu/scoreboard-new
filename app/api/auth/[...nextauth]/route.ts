import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/mongodb";
import Admin from "@/models/Admin";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
            throw new Error('Please enter a username and password')
        }
        await dbConnect();
        
        const user = await Admin.findOne({ username: credentials.username });

        if (user && user.password === credentials.password) {
          return { id: user._id.toString(), name: user.username, email: user.username };
        }
        
        // Fallback: If no admin exists at all, allows the specific hardcoded credential for bootstrap if needed?
        // No, strict adherence to DB.
        
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin", // Custom signin page we will create
  },
  session: {
      strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
