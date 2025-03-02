import { NextRequest, NextResponse } from "next/server";
import BoxSDK from "box-node-sdk";
import csvParser from "csv-parser";
import { OpenAI } from "openai";

const sdk = new BoxSDK({
  clientID: process.env.BOX_CLIENT_ID!,
  clientSecret: process.env.BOX_CLIENT_SECRET!,
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const formData = await request.json();
    const categoryId = formData.categoryId as string;
    const userQuestion = formData.question as string;

    if (!categoryId || !userQuestion) {
      return NextResponse.json(
        { error: "Category ID and question are required" },
        { status: 400 }
      );
    }

    // 固定のファイル名を設定
    const fixedFileName = "faq.csv";

    // 同じ名前のファイルを検索
    const existingFiles = await client.folders.getItems(categoryId, {
      fields: "id,name",
    });
    const existingFile = existingFiles.entries.find(
      (item: { name: string }) => item.name === fixedFileName
    );

    if (!existingFile) {
      return NextResponse.json(
        { error: "FAQ file not found in the selected category" },
        { status: 404 }
      );
    }

    // ファイルのコンテンツを取得
    const fileStream = await client.files.getReadStream(existingFile.id);

    // CSV を解析してデータを取得
    const faqData: { question: string; answer: string }[] = [];
    const parseCsv = new Promise<void>((resolve, reject) => {
      fileStream
        .pipe(csvParser())
        .on("data", (row: { question: string; answer: string }) => {
          faqData.push({ question: row.question, answer: row.answer });
        })
        .on("end", resolve)
        .on("error", reject);
    });

    await parseCsv;

    // ChatGPT に渡すプロンプトを作成
    const prompt = `
以下は FAQ のリストです。ユーザーの質問に最も適切な回答を提供してください。
FAQ:
${faqData
  .map(
    (faq, index) =>
      `${index + 1}. 質問: ${faq.question}\n   回答: ${faq.answer}`
  )
  .join("\n")}

ユーザーの質問: ${userQuestion}
回答はユーザーに向けて丁寧に、かつ簡潔に要約してください。
あなたは回答のみを提供すれば良いです。質問は含めないでください。
適切な回答がない場合は、「恐れ入りますが、お問い合わせフォームよりお問い合わせください。」と回答してください。
`;

    // OpenAI API を呼び出して回答を生成
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const answer = completion.choices[0]?.message?.content;

    if (!answer) {
      return NextResponse.json({
        answer:
          "恐れ入りますが、お問い合わせフォームよりお問い合わせください。",
      });
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Error processing FAQ request:", error);
    return NextResponse.json(
      { error: "Failed to process FAQ request" },
      { status: 500 }
    );
  }
}
