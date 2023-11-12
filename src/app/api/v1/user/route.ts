import { NextRequest } from "next/server";
import { RouterNext, RouterRequest, RouterResponse, router } from "@/lib/router";

router.use(database);

function database(req: RouterRequest, res: RouterResponse, next: RouterNext) {
  return res?.json({ message: "database"});
}

function user0(req: RouterRequest, res: RouterResponse, next: RouterNext) {
  next();
}

function user(req: RouterRequest, res: RouterResponse, next: RouterNext) {
  next();
}

function user1(req: RouterRequest, res: RouterResponse, next: RouterNext) {
  next();
}

function user2(req: RouterRequest, res: RouterResponse, next: RouterNext) {
  return res.json({ message: "hello world" });
}

export const GET = (
  req: NextRequest,
  { params }: { params: { slug: string } }
) => router({ req, params }, user, user1, user2);
