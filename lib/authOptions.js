import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prismaDB } from "@/lib/prismaDB";
import { syncNextAuthUrlFromFrontendBase } from "@/lib/frontendBaseUrl";
import { getIpFromHeaders, getUserAgentFromHeaders, logAuditEvent } from "@/lib/auditLog";

syncNextAuthUrlFromFrontendBase();

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  image: true,
  isActive: true,
};

function applyUserToToken(token, user) {
  if (!user) return token;
  token.id = user.id;
  token.role = user.role || "USER";
  token.name = user.name ?? token.name;
  token.email = user.email ?? token.email;
  token.picture = user.image ?? token.picture;
  return token;
}

async function findAdminUserByEmail(email) {
  if (!email) return null;
  const user = await prismaDB.user.findFirst({
    where: {
      email: { equals: String(email).trim(), mode: "insensitive" },
    },
    select: userSelect,
  });
  if (!user || user.role !== "ADMIN" || user.isActive === false) return null;
  return user;
}

export const authOptions = {
  // No OAuth providers — prevents NextAuth from creating new users.
  adapter: PrismaAdapter(prismaDB),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const ip = getIpFromHeaders(req?.headers);
        const userAgent = getUserAgentFromHeaders(req?.headers);
        const email = credentials?.email ? String(credentials.email).trim() : null;

        if (!credentials?.email || !credentials?.password) {
          await logAuditEvent({ eventType: "login_failure", email, ip, userAgent, metadata: { reason: "missing_credentials" } });
          return null;
        }

        const user = await prismaDB.user.findFirst({
          where: {
            email: { equals: email, mode: "insensitive" },
          },
        });

        // Only existing ADMIN accounts may sign in — never create users here.
        if (!user?.hashedPassword) {
          await logAuditEvent({ eventType: "login_failure", email, ip, userAgent, metadata: { reason: "no_such_user" } });
          return null;
        }
        if (user.role !== "ADMIN") {
          await logAuditEvent({ eventType: "login_failure", userId: user.id, email, ip, userAgent, metadata: { reason: "not_admin" } });
          return null;
        }
        if (user.isActive === false) {
          await logAuditEvent({ eventType: "login_failure", userId: user.id, email, ip, userAgent, metadata: { reason: "inactive" } });
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );
        if (!passwordMatch) {
          await logAuditEvent({ eventType: "login_failure", userId: user.id, email, ip, userAgent, metadata: { reason: "bad_password" } });
          return null;
        }

        await logAuditEvent({ eventType: "login_success", userId: user.id, email, ip, userAgent, metadata: { provider: "credentials" } });
        return user;
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const admin = await findAdminUserByEmail(user?.email);
      return Boolean(admin);
    },
    async jwt({ token, user, trigger }) {
      if (user) {
        if (user.id) {
          try {
            const dbUser = await prismaDB.user.findUnique({
              where: { id: user.id },
              select: userSelect,
            });
            if (!dbUser || dbUser.role !== "ADMIN" || dbUser.isActive === false) {
              return {};
            }
            return applyUserToToken(token, dbUser);
          } catch (error) {
            console.error("jwt sign-in user load failed:", error);
          }
        }
        if (user.role !== "ADMIN") return {};
        return applyUserToToken(token, user);
      }

      if (token.id) {
        try {
          const dbUser = await prismaDB.user.findUnique({
            where: { id: token.id },
            select: userSelect,
          });
          if (!dbUser || dbUser.role !== "ADMIN" || dbUser.isActive === false) {
            return {};
          }
          if (trigger === "update") {
            return applyUserToToken(token, dbUser);
          }
        } catch (error) {
          console.error("jwt refresh failed:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (!session.user) return session;

      if (!token?.id || token.role !== "ADMIN") {
        return { ...session, user: undefined };
      }

      session.user = {
        ...session.user,
        id: token.id,
        role: "ADMIN",
        name: token.name ?? session.user.name,
        email: token.email ?? session.user.email,
        image: token.picture ?? session.user.image,
      };

      return session;
    },
  },
  events: {
    async signOut({ token }) {
      await logAuditEvent({
        eventType: "logout",
        userId: token?.id || null,
        email: token?.email || null,
      });
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NEXTAUTH_DEBUG === "true",
};

export default NextAuth(authOptions);
