// export { default } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextApiRequest, NextApiResponse } from "next";

export async function middleware(req: NextApiRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
  });
  console.log(token);
  // if (!session)
  //   return NextResponse.redirect(new URL("/api/auth/signin?callbackUrl=%2Fcollection%2Fadd", req.url));

  NextResponse.next();
}

export const config = {
  matcher: [
    "/user/manage",
    "/auth/verify-email",
    "/collection/add",
    "/auth/new-user",
  ],
};
