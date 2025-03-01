import { NextRequest, NextResponse } from "next/server";
import BoxSDK from "box-node-sdk";

const sdk = new BoxSDK({
  clientID: process.env.BOX_CLIENT_ID!,
  clientSecret: process.env.BOX_CLIENT_SECRET!,
});

export async function GET(request: NextRequest) {
  try {
    // Cookie から accessToken を取得
    const accessToken = request.cookies.get("box_access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized: Access token is missing" },
        { status: 401 }
      );
    }

    // Box クライアントを作成
    const client = sdk.getBasicClient(accessToken);

    // Box のルートフォルダ (ID: 0) からカテゴリ (フォルダ) を取得
    const folderId = "309674553231"; // ルートフォルダの ID
    const folders = await client.folders.getItems(folderId, {
      fields: "id,name,type",
    });

    // フォルダのみをフィルタリング
    const categories = folders.entries.filter(
      (item: { type: string }) => item.type === "folder"
    );

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}
