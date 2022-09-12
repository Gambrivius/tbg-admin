import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectMongo from "../../../lib/mongo";
import User from "../../../models/user";
import IUser from "../../../models/user";
import { hash, compare } from "bcryptjs";

export default NextAuth({
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // The credentials is used to generate a suitable form on the sign in page.
      // You can specify whatever fields you are expecting to be submitted.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials) return null;
        await connectMongo();

        let user = await User.findOne({
          username: credentials.username,
        });

        if (user) {
          const result = await compare(credentials.password, user.hash);
          if (result) {
            const session_user = {
              name: user.username,
              email: "",
              username: user.username,
            };
            return session_user;
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account && token && token.name) {
        await connectMongo();
        let user = await User.findOne({
          username: token.name,
        });
        if (user) {
          token.userRoles = user.roles;
        }
      }
      return token;
    },
    async session({ session, token, user }) {
      session.user.roles = token.userRoles;
      return session;
    },
  },
});
