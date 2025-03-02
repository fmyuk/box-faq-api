"use client";

import { useEffect, useState } from "react";

interface BoxFile {
  id: string;
  name: string;
  type: string;
}

export default function ProtectedPage() {
  const [files, setFiles] = useState<BoxFile[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch("/api/box/files");
        if (!response.ok) {
          throw new Error("Failed to fetch files");
        }
        const data = await response.json();
        setFiles(data.files);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    };

    fetchFiles();
  }, []);

  return (
    <div>
      <h1>Protected Box Files</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {files
          ? files.map((file) => (
              <li key={file.id}>
                {file.type === "folder" ? "📁" : "📄"} {file.name}
              </li>
            ))
          : null}
      </ul>
    </div>
  );
}
