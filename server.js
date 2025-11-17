import express from "express";
import cors from "cors";
import multer from "multer";
import dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const upload = multer({ dest: "uploads/" });

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Chat message route
app.post("/chat", async (req, res) => {
  const { message } = req.body;

  try {
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: message }],
    });

    res.json({ reply: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "Chat error" });
  }
});

// File upload route
app.post("/upload", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).send("No file uploaded");

  try {
    const fileText = fs.readFileSync(req.file.path, "utf8");

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "user", content: "Explain this file content:\n" + fileText },
      ],
    });

    fs.unlinkSync(req.file.path);

    res.json({ reply: completion.choices[0].message.content });
  } catch (e) {
    res.status(500).json({ error: "File processing error" });
  }
});

app.listen(3000, () =>
  console.log("Server running at http://localhost:3000")
);
