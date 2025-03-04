import BoxSDK from "box-node-sdk";
import { createClient } from "@supabase/supabase-js";

// Box API の設定
const sdk = new BoxSDK({
  clientID: process.env.BOX_CLIENT_ID!,
  clientSecret: process.env.BOX_CLIENT_SECRET!,
});
const client = sdk.getBasicClient(process.env.BOX_ACCESS_TOKEN!);

// Supabase の設定
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
);

// Box フォルダ ID
const UPLOAD_FOLDER_ID = "309992989615";
const REGISTERED_FOLDER_ID = "309995620565";

// 商品マスタテーブル名
const PRODUCT_TABLE = "products";

async function processImages() {
  try {
    console.log("画像処理を開始します...");

    // 1. Box の upload_folder 内のファイルを取得
    const files = await client.folders.getItems(UPLOAD_FOLDER_ID, {
      fields: "id,name",
    });

    for (const file of files.entries) {
      if (file.type === "file") {
        const fileName = file.name.split(".")[0]; // 拡張子を除いたファイル名（商品コード）

        console.log(`処理中のファイル: ${file.name}`);

        // 2. Supabase の商品マスタで商品コードを検索
        const { data: product, error } = await supabase
          .from(PRODUCT_TABLE)
          .select("*")
          .eq("product_code", fileName)
          .single();

        if (error || !product) {
          console.log(`商品コード ${fileName} が見つかりませんでした。`);
          continue;
        }

        console.log(`商品コード ${fileName} が見つかりました。`);

        // 3. Box の登録フォルダに画像を移動
        const movedFile = await client.files.move(
          file.id,
          REGISTERED_FOLDER_ID
        );
        console.log(`ファイル ${file.name} を登録フォルダに移動しました。`);

        // 4. Supabase に file_id を保存
        const { error: updateError } = await supabase
          .from(PRODUCT_TABLE)
          .update({ file_id: movedFile.id })
          .eq("product_code", fileName);

        if (updateError) {
          console.error(
            `商品コード ${fileName} の file_id 更新に失敗しました:`,
            updateError
          );
        } else {
          console.log(`商品コード ${fileName} の file_id を登録しました。`);
        }
      }
    }

    console.log("画像処理が完了しました。");
  } catch (error) {
    console.error("画像処理中にエラーが発生しました:", error);
  }
}

// スクリプトを実行
processImages();
