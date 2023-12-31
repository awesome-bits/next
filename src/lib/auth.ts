import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { authLimiter } from "@/config/limiter";
import { db } from "@/server/db/connection";
import { verifyPassword } from "@/server/utils/auth";
import { database } from "@/server/middlewares";
import {
    getUserByEmail,
    getUserByUsername,
    registerVerifiedProviderUser
} from "@/server/db/queries/user";

export const authOptions: AuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                const tokens = await authLimiter.removeTokens(1);
                await database(null, null);
                if (tokens < 0) {
                    throw new Error("Too Many Requests");
                }

                const { email, password } = credentials!;
                if (!email || !password) {
                    throw new Error("Bad Request");
                }

                const user = await db.collection("users").findOne({
                    email
                });

                if (!user) throw new Error("Invalid Credentials");

                const isPasswordValid = await verifyPassword(
                    password,
                    user.password
                );

                if (!isPasswordValid) throw new Error("Invalid Credentials");

                return {
                    id: user._id.toString(),
                    email: user.email,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailVerified: user.emailVerified,
                    role: user.role
                };
            }
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_ID!,
            clientSecret: process.env.GITHUB_SECRET!
        })
    ],

    pages: {
        signIn: "/auth/signin",
        error: "/auth/error"
    },

    session: {
        strategy: "jwt"
    },

    callbacks: {
        async signIn({ profile, account }) {
            if (account?.provider == "credentials") return true;

            await database(null, null);

            const existingUser = await getUserByEmail(profile?.email as string);

            if (existingUser && !existingUser?.emailVerified) {
                throw new Error("Sign in using password and username");
            }

            if (existingUser) return true;

            let username = profile?.email?.split("@")[0] as string;

            if (await getUserByUsername(username)) {
                username +=
                    Math.floor(Math.random() * (999999 - 100000 + 1)) + 100000;
            }

            const user = await registerVerifiedProviderUser({
                username: username,
                email: profile?.email as string,
                role: "user"
            });
            return !!user;
        },
        async jwt({ token, trigger, user, session, account }) {
            switch (trigger) {
                case "signIn":
                    if (
                        user &&
                        account &&
                        account?.provider !== "credentials"
                    ) {
                        const dbUser = await getUserByEmail(user.email);
                        token.sub = dbUser._id;
                        token.username = dbUser.username;
                        token.email = dbUser.email;
                        token.firstName = dbUser.firstName;
                        token.lastName = dbUser.lastName;
                        token.emailVerified = dbUser.emailVerified;
                        token.role = dbUser.role;
                    } else if (user) {
                        token.username = user.username;
                        token.email = user.email;
                        token.firstName = user.firstName;
                        token.lastName = user.lastName;
                        token.emailVerified = user.emailVerified;
                        token.role = user.role;
                    }
                    break;
                case "update":
                    if (session?.user) {
                        token.username = session.user.username;
                        token.email = session.user.email;
                        token.firstName = session.user.firstName;
                        token.lastName = session.user.lastName;
                        token.emailVerified = session.user.emailVerified;
                        token.role = session.user.role;
                    }
                    break;
            }

            return token;
        },

        async session({ session, trigger, token, newSession }) {
            session.user.id = token.sub;
            session.user.username = token.username;
            session.user.email = token.email;
            session.user.firstName = token.firstName;
            session.user.lastName = token.lastName;
            session.user.emailVerified = token.emailVerified;
            session.user.role = token.role;

            if (trigger == "update" && session?.user) {
                session.user = newSession;
            }

            return session;
        }
    },

    debug: false,
    secret: process.env.NEXTAUTH_SECRET
};