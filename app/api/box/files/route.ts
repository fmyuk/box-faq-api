import { NextRequest, NextResponse } from "next/server";

interface BoxFile {
  id: string;
  name: string;
  type: string;
}

interface BoxFolderResponse {
  entries: BoxFile[];
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const boxAccessToken = request.cookies.get("box_access_token"); // Cookie からアクセストークンを取得

  if (!boxAccessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch("https://api.box.com/2.0/folders/0", {
      headers: {
        Authorization: `Bearer ${boxAccessToken.value}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch files");
    }

    const data: BoxFolderResponse = await response.json();
    return NextResponse.json({ files: data.entries });
  } catch (error) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { error: "Failed to fetch files" },
      { status: 500 }
    );
  }
}
