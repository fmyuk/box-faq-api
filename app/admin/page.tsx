"use client";

import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";

export default function AdminPage() {
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
        管理者ページ
      </Typography>
      <Typography className="text-gray-600" variant="h6" gutterBottom>
        以下のリンクから管理者用機能を選択してください。
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginTop: "40px",
          width: "100%",
          maxWidth: "400px",
        }}
      >
        {/* アップロードページリンク */}
        <Link href="/admin/upload" passHref>
          <Button variant="contained" color="primary" fullWidth>
            FAQ アップロード
          </Button>
        </Link>

        {/* ダウンロードページリンク */}
        <Link href="/admin/download" passHref>
          <Button variant="contained" color="secondary" fullWidth>
            FAQ ダウンロード
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
