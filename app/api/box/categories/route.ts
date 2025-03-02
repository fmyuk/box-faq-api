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
export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get("box_access_token")?.value;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Unauthorized: Access token is missing" },
        { status: 401 }
      );
    }

    const client = sdk.getBasicClient(accessToken);
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // Box API を使用して新しいフォルダを作成
    const folderId = "309674553231";
    const newFolder = await client.folders.create(folderId, name);

    return NextResponse.json({
      category: { id: newFolder.id, name: newFolder.name },
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
