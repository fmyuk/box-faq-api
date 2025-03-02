import { NextRequest, NextResponse } from "next/server";

interface BoxTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  refresh_token?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code"); // 認証コードを取得

  if (!code) {
    return NextResponse.json(
      { error: "Authorization code not found" },
      { status: 400 }
    );
  }

  try {
    // Box API にリクエストを送信してアクセストークンを取得
    const response = await fetch("https://api.box.com/oauth2/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_id: process.env.BOX_CLIENT_ID!,
        client_secret: process.env.BOX_CLIENT_SECRET!,
        redirect_uri: process.env.BOX_REDIRECT_URI!,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch access token");
    }

    const data: BoxTokenResponse = await response.json();

    // アクセストークンを Cookie に保存
    const responseWithCookie = NextResponse.redirect(
      process.env.NEXT_PUBLIC_APP_URL!
    );
    responseWithCookie.cookies.set("box_access_token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: data.expires_in, // トークンの有効期限を設定
    });

    return responseWithCookie;
  } catch (error) {
    console.error("Error fetching access token:", error);
    return NextResponse.json(
      { error: "Failed to fetch access token" },
      { status: 500 }
    );
  }
}
