import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PromiseQuery } from "../../../lib/database";
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

        console.log("Test");
        const sql = `SELECT * FROM user_accounts WHERE username=?`;
        const [rows, fields] = await PromiseQuery(sql, [credentials?.username]);
        if (rows.length <= 0) return null;
        const user = rows[0];
        const result = await compare(credentials.password, user.password);
        if (result) {
          console.log(user.username);
          const session_user = {
            name: user.username,
            email: user.email,
            username: user.username,
          };
          return session_user;
        }
        console.log(rows);
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        console.log("Logged in");
        const sql = `
        with user_data as (
            select iduser_accounts user_id from user_accounts
            where username = ?
        )
        select role_name from user_roles
        right join user_active_roles on
        user_active_roles.role_id = user_roles.role_id
        right join user_data
        on user_active_roles.user_id = user_data.user_id`;
        if (token && token.name) {
          const [rows, fields] = await PromiseQuery(sql, [token.name]);
          console.log(token);
          console.log(token.name);
          console.log(rows);
          let roles: string[] = [];
          rows.forEach((role) => roles.push(role["role_name"]));
          token.userRoles = roles;
          console.log(roles);
        }
      }
      return token;
    },
    async session({ session, token, user }) {
      session.user.roles = token.userRoles;
      console.log(user);
      return session;
    },
  },
});
