"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Box,
  ThemeProvider,
  CssBaseline,
  createTheme,
} from "@mui/material";

interface Category {
  id: string;
  name: string;
}

export default function UploadPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState<string | null>(null);

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
      setMessage(
        `「${data.file.entries[0].parent.name}」にファイルをアップロードしました。`
      );
    } catch (error) {
      console.error(error);
      setMessage("ファイルのアップロードに失敗しました。");
    }
  };

  // 新しいカテゴリを追加
  const handleAddCategory = async () => {
    setCategoryError(null);

    if (!newCategoryName.trim()) {
      setCategoryError("カテゴリ名を入力してください。");
      return;
    }

    try {
      const response = await fetch("/api/box/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCategoryName,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add category");
      }

      const data = await response.json();

      setCategories((prevCategories) => [...prevCategories, data.category]);
      setNewCategoryName("");
    } catch (err) {
      setCategoryError("カテゴリの追加に失敗しました。");
      console.error(err);
    }
  };

  const theme = createTheme({
    palette: {
      mode: "light",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
        <Typography variant="h4" gutterBottom>
          FAQ アップロード
        </Typography>
        {message && (
          <Typography
            variant="body1"
            sx={{
              marginBottom: "20px",
              color: message.includes("失敗") ? "red" : "green",
            }}
          >
            {message}
          </Typography>
        )}
        <form onSubmit={handleUpload}>
          {/* カテゴリ選択 */}
          <FormControl fullWidth sx={{ marginBottom: "20px" }}>
            <InputLabel id="category-label">カテゴリを選択</InputLabel>
            <Select
              labelId="category-label"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <MenuItem value="">
                <em>-- カテゴリを選択 --</em>
              </MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* ファイル選択 */}
          <FormControl fullWidth sx={{ marginBottom: "20px" }}>
            <TextField
              type="file"
              inputProps={{ accept: ".csv" }}
              onChange={(e) =>
                setFile((e.target as HTMLInputElement).files?.[0] || null)
              }
            />
          </FormControl>

          {/* アップロードボタン */}
          <Button type="submit" variant="contained" color="primary" fullWidth>
            アップロード
          </Button>
        </form>

        <hr className="text-gray-300" style={{ margin: "40px 0" }} />

        {/* 新しいカテゴリを追加 */}
        <Typography className="text-gray-600" variant="h5" gutterBottom>
          新しいカテゴリを追加
        </Typography>
        <TextField
          fullWidth
          label="カテゴリ名"
          value={newCategoryName}
          onChange={(e) => setNewCategoryName(e.target.value)}
          style={{ marginBottom: "20px" }}
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={handleAddCategory}
        >
          カテゴリを追加
        </Button>
        {categoryError && (
          <div style={{ marginTop: "20px", color: "red" }}>
            <Typography>{categoryError}</Typography>
          </div>
        )}
      </Box>
    </ThemeProvider>
  );
}
