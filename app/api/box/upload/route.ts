import { NextRequest, NextResponse } from "next/server";
import BoxSDK from "box-node-sdk";
import { Readable } from "stream";

const sdk = new BoxSDK({
  clientID: process.env.BOX_CLIENT_ID!,
  clientSecret: process.env.BOX_CLIENT_SECRET!,
});

// Utility function to convert ReadableStream to AsyncIterable
async function* readableStreamToAsyncIterable(stream: ReadableStream) {
  const reader = stream.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

export async function POST(request: NextRequest) {
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

    const formData = await request.formData();
    const categoryId = formData.get("categoryId") as string;
    const file = formData.get("file") as File;

    if (!categoryId || !file) {
      return NextResponse.json(
        { error: "Category ID and file are required" },
        { status: 400 }
      );
    }

    // 固定のファイル名を設定
    const fixedFileName = "faq.csv";

    // Convert the browser's ReadableStream to a Node.js Readable stream
    const asyncIterable = readableStreamToAsyncIterable(file.stream());
    const readableStream = Readable.from(asyncIterable);

    // 同じ名前のファイルが存在するか確認
    const existingFiles = await client.folders.getItems(categoryId, {
      fields: "id,name",
    });
    const existingFile = existingFiles.entries.find(
      (item: { name: string }) => item.name === fixedFileName
    );

    if (existingFile) {
      // ファイルが存在する場合、新しいバージョンとして上書き
      const updatedFile = await client.files.uploadNewFileVersion(
        existingFile.id,
        readableStream
      );
      return NextResponse.json({ success: true, file: updatedFile });
    } else {
      // ファイルが存在しない場合、新規アップロード
      const uploadedFile = await client.files.uploadFile(
        categoryId,
        fixedFileName,
        readableStream
      );
      return NextResponse.json({ success: true, file: uploadedFile });
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
