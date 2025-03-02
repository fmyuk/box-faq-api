"use client";

import { useState, useEffect } from "react";
import {
  TextField,
  Button,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Typography,
  ThemeProvider,
  CssBaseline,
  createTheme,
} from "@mui/material";

interface Category {
  id: string;
  name: string;
}

export default function FAQPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
      } catch (err) {
        console.error(err);
        setError("カテゴリの取得に失敗しました。");
      }
    };

    fetchCategories();
  }, []);

  // 質問を送信
  const handleAskQuestion = async () => {
    setAnswer(null);
    setError(null);

    if (!selectedCategory) {
      setError("カテゴリを選択してください。");
      return;
    }

    if (!question.trim()) {
      setError("質問を入力してください。");
      return;
    }

    try {
      const response = await fetch("/api/box/faq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          categoryId: selectedCategory,
          question,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch answer");
      }

      const data = await response.json();
      setAnswer(data.answer);
    } catch (err) {
      setError("回答を取得できませんでした。");
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
      <div
        className="text-white"
        style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}
      >
        <Typography className="text-gray-600" variant="h4" gutterBottom>
          FAQ AI チャット
        </Typography>

        {/* カテゴリ選択 */}
        <FormControl fullWidth style={{ marginBottom: "20px" }}>
          <InputLabel id="category-label">
            カテゴリを選択してください
          </InputLabel>
          <Select
            labelId="category-label"
            value={selectedCategory || ""}
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

        {/* 質問入力 */}
        <TextField
          fullWidth
          label="質問を入力してください"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          style={{ marginBottom: "20px" }}
        />
        <Button variant="contained" color="primary" onClick={handleAskQuestion}>
          質問する
        </Button>

        {/* 回答表示 */}
        {answer && (
          <div className="text-gray-600" style={{ marginTop: "20px" }}>
            <Typography variant="h6">回答:</Typography>
            <Typography>{answer}</Typography>
            {answer.includes("恐れ入ります") ? null : (
              <Typography>関連するリンクはこちら:</Typography>
            )}
          </div>
        )}
        {error && (
          <div style={{ marginTop: "20px", color: "red" }}>
            <Typography variant="h6">エラー:</Typography>
            <Typography>{error}</Typography>
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}
