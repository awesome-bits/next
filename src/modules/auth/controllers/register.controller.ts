import prisma from "@/lib/prisma";
import { ctxType } from "@/lib/router";

export async function register(ctx: ctxType) {
  const body = await ctx.req.json();

  prisma.user.create({
    data: {
      email: body?.email,
      password: body?.password,
    },
  });
}