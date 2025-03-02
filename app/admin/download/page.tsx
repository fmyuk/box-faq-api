"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ThemeProvider,
  CssBaseline,
  createTheme,
} from "@mui/material";

interface Category {
  id: string;
  name: string;
}

export default function DownloadPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
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

  // CSV ダウンロード処理
  const handleDownload = async () => {
    if (!selectedCategory) {
      setMessage("カテゴリを選択してください。");
      return;
    }

    try {
      const response = await fetch(
        `/api/box/download?categoryId=${selectedCategory}`
      );
      if (!response.ok) {
        throw new Error("Failed to download CSV");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${selectedCategory}_faq.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      setMessage("CSV ファイルをダウンロードしました。");
    } catch (error) {
      console.error(error);
      setMessage("CSV ファイルのダウンロードに失敗しました。");
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
      <Box
        sx={{
          padding: "20px",
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#f5f5f5",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography className="text-gray-600" variant="h4" gutterBottom>
          CSV ダウンロード
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
        <Button
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleDownload}
        >
          ダウンロード
        </Button>
      </Box>
    </ThemeProvider>
  );
}
