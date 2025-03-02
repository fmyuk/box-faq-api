import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest): NextResponse {
  const accessToken = request.cookies.get("box_access_token");

  // アクセストークンが存在しない場合、Box の認証ページにリダイレクト
  if (!accessToken) {
    const clientId = process.env.BOX_CLIENT_ID!;
    const redirectUri = process.env.BOX_REDIRECT_URI!;

    const authUrl = `https://account.box.com/api/oauth2/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}`;

    return NextResponse.redirect(authUrl);
  }

  // アクセストークンが存在する場合はそのままリクエストを続行
  return NextResponse.next();
}

// Middleware を適用するルートを指定
export const config = {
  matcher: ["/protected/:path*", "/admin/:path*", "/faq"],
};
