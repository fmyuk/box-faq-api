"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Card,
  CardMedia,
  CardContent,
  Button,
} from "@mui/material";

interface Product {
  id: number;
  product_code: string;
  name: string;
  description: string;
  image_url: string;
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    };

    fetchProducts();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen py-10">
      {/* 画像アップロードボタン */}
      <Button
        variant="contained"
        color="primary"
        style={{
          position: "fixed", // 画面の右上に固定
          top: "20px", // 上からの距離
          right: "20px", // 右からの距離
          zIndex: 1000, // 他の要素より前面に表示
        }}
        onClick={() => {
          // 指定されたリンクに遷移
          window.open("https://app.box.com/folder/309992989615", "_blank");
        }}
      >
        画像アップロード
      </Button>

      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-center mb-10 text-gray-800">
          Product List
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              {/* 商品画像を取得 */}
              <CardMedia
                component="img"
                src={`/api/products/image?productCode=\${product.product_code}`}
                alt={product.name}
                className="mx-auto object-cover"
                style={{
                  width: "100px",
                  height: "100px",
                }}
              />
              <CardContent>
                <Typography
                  variant="h6"
                  component="h2"
                  className="text-gray-800 font-semibold"
                >
                  {product.name}
                </Typography>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  className="text-gray-600 mt-2"
                >
                  Product Code: {product.product_code}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
