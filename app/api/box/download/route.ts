import { NextRequest, NextResponse } from "next/server";
import BoxSDK from "box-node-sdk";

const sdk = new BoxSDK({
  clientID: process.env.BOX_CLIENT_ID!,
  clientSecret: process.env.BOX_CLIENT_SECRET!,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    if (!categoryId) {
      return NextResponse.json(
        { error: "Category ID is required" },
        { status: 400 }
      );
    }

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

    // カテゴリ内のファイルを取得
    const files = await client.folders.getItems(categoryId, {
      fields: "id,name",
    });
    const csvFile = files.entries.find((file: { name: string }) =>
      file.name.endsWith(".csv")
    );

    if (!csvFile) {
      return NextResponse.json(
        { error: "CSV file not found in the selected category" },
        { status: 404 }
      );
    }

    // CSV ファイルのコンテンツを取得
    const fileStream = await client.files.getReadStream(csvFile.id);

    return new NextResponse(fileStream, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="\${csvFile.name}"`,
      },
    });
  } catch (error) {
    console.error("Error downloading CSV file:", error);
    return NextResponse.json(
      { error: "Failed to download CSV file" },
      { status: 500 }
    );
  }
}
