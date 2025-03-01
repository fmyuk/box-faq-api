"use client";

import { useState, useEffect } from "react";

interface Category {
  id: string;
  name: string;
}

export default function UploadPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // カテゴリ一覧を取得
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/box/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const data = await response.json();
        setCategories(data.categories);
      } catch (error) {
        console.error(error);
        setMessage("カテゴリの取得に失敗しました。");
      }
    };

    fetchCategories();
  }, []);

  // ファイルアップロード処理
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory || !file) {
      setMessage("カテゴリとファイルを選択してください。");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("categoryId", selectedCategory);
      formData.append("file", file);

      const response = await fetch("/api/box/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const data = await response.json();
      setMessage(`ファイル「${data.file.name}」をアップロードしました。`);
    } catch (error) {
      console.error(error);
      setMessage("ファイルのアップロードに失敗しました。");
    }
  };

  return (
    <div>
      <h1>FAQ アップロード</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleUpload}>
        <div>
          <label htmlFor="category">カテゴリを選択:</label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="">-- カテゴリを選択 --</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="file">CSV ファイルを選択:</label>
          <input
            id="file"
            type="file"
            accept=".csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
        </div>
        <button type="submit">アップロード</button>
      </form>
    </div>
  );
}
