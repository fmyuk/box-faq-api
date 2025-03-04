"use client";

import { Box, Button, Typography, Divider } from "@mui/material";
import Link from "next/link";

export default function HomePage() {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "20px",
      }}
    >
      <Typography className="text-gray-600" variant="h3" gutterBottom>
        トップページ
      </Typography>
      <Typography className="text-gray-600" variant="h6" gutterBottom>
        以下のリンクからページを選択してください。
      </Typography>

      {/* 管理者用セクション */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "600px",
          marginTop: "40px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography className="text-gray-600" variant="h5" gutterBottom>
          管理者用
        </Typography>
        <Typography className="text-gray-600" variant="body1" gutterBottom>
          管理者用の機能にアクセスするには、以下のリンクをクリックしてください。
        </Typography>
        <Link href="/admin" passHref>
          <Button variant="contained" color="primary" fullWidth>
            管理者用ページ
          </Button>
        </Link>
      </Box>

      <Divider sx={{ width: "100%", maxWidth: "600px", margin: "40px 0" }} />

      {/* ユーザー用セクション */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "600px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography className="text-gray-600" variant="h5" gutterBottom>
          ユーザー用
        </Typography>
        <Typography className="text-gray-600" variant="body1" gutterBottom>
          ユーザー用の機能にアクセスするには、以下のリンクをクリックしてください。
        </Typography>
        <Link href="/faq" passHref>
          <Button variant="contained" color="secondary" fullWidth>
            ユーザー用ページ
          </Button>
        </Link>
      </Box>

      <Divider sx={{ width: "100%", maxWidth: "600px", margin: "40px 0" }} />

      {/* 商品一覧 */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "600px",
          padding: "20px",
          backgroundColor: "white",
          borderRadius: "8px",
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Typography className="text-gray-600" variant="h5" gutterBottom>
          商品一覧
        </Typography>
        <Typography className="text-gray-600" variant="body1" gutterBottom>
          商品一覧の機能にアクセスするには、以下のリンクをクリックしてください。
        </Typography>
        <Link href="/product" passHref>
          <Button variant="contained" color="success" fullWidth>
            商品一覧ページ
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
