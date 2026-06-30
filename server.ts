import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import axios from "axios";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));

  app.get("/api/model", async (req, res) => {
    if (req.query.ping) {
      return res.json({ status: "ok" });
    }
    try {
      const defaultUrl = "https://www.modelscope.ai/datasets/Xelszy/website/resolve/master/candijago1.glb";
      const targetUrl = (req.query.url as string) || defaultUrl;
      
      const response = await axios.get(targetUrl, {
        responseType: "stream",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3",
          "Accept": "*/*"
        }
      });
      
      res.setHeader("Content-Type", "model/gltf-binary");
      res.setHeader("Access-Control-Allow-Origin", "*");
      
      response.data.pipe(res);
    } catch (error: any) {
      console.error("Proxy error:", error.message);
      if (error.response) {
         console.error("Response data:", error.response.status, error.response.headers);
      }
      res.status(500).json({ error: "Failed to load model" });
    }
  });

  // Image scanning endpoint using Gemini
  app.post("/api/scan", async (req, res) => {
    try {
      const { imageBase64, mimeType } = req.body;
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Gemini API key not configured" });
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Strip the data URL prefix if present
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

      const response = await ai.models.generateContent({
        model: "gemini-2.5-pro",
        contents: [
          {
            role: "user",
            parts: [
              { text: "Tolong analisis gambar ini. Jika ini adalah situs bersejarah, candi, atau landmark, berikan detailnya. Secara spesifik identifikasi apakah ini Candi Jago atau bukan, lalu berikan sejarah singkat atau fakta menarik tentangnya." },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: mimeType || "image/jpeg",
                },
              },
            ],
          },
        ],
      });

      res.json({ result: response.text });
    } catch (error) {
      console.error("Scan error:", error);
      res.status(500).json({ error: "Failed to scan image" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
