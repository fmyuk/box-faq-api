import { supabase } from "@/lib/supabaseClient";
import { NextRequest, NextResponse } from "next/server";
import BoxSDK from "box-node-sdk";

const sdk = new BoxSDK({
  clientID: process.env.BOX_CLIENT_ID!,
  clientSecret: process.env.BOX_CLIENT_SECRET!,
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productCode = searchParams.get("productCode");
  const accessToken = req.cookies.get("box_access_token")?.value;

  if (!productCode) {
    return NextResponse.json(
      { error: "productCode is required" },
      { status: 400 }
    );
  }
  if (!accessToken) {
    return NextResponse.json(
      { error: "Unauthorized: Access token is missing" },
      { status: 401 }
    );
  }

  try {
    // Supabase から file_id を取得
    const { data: product, error } = await supabase
      .from("products")
      .select("file_id")
      .eq("product_code", productCode)
      .single();

    if (error || !product) {
      console.error("Error fetching file_id from Supabase:", error);
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileId = product.file_id;

    const client = sdk.getBasicClient(accessToken);
    // Box API を使用して画像データを取得
    const fileStream = await client.files.getReadStream(fileId);

    // レスポンスヘッダーを設定
    const headers = new Headers({
      "Content-Type": "image/jpeg",
    });

    return new NextResponse(fileStream, { headers });
  } catch (error) {
    console.error("Error fetching file from Box:", error);
    return NextResponse.json(
      { error: "Failed to fetch file from Box" },
      { status: 500 }
    );
  }
}
