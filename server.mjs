import "dotenv/config";
import express from "express";
import OpenAI from "openai";

const app = express();
const port = process.env.PORT || 3000;
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

function requireKey(res) {
  if (process.env.OPENAI_API_KEY) return true;
  res.status(500).json({ error: "Missing OPENAI_API_KEY. Add it to your .env file, then restart the app." });
  return false;
}

app.post("/api/chat", async (req, res) => {
  if (!requireKey(res)) return;
  const messages = Array.isArray(req.body.messages) ? req.body.messages.slice(-16) : [];
  if (!messages.length || !messages.at(-1)?.content?.trim()) return res.status(400).json({ error: "Write a message first." });
  try {
    const response = await client.responses.create({
      model: "gpt-5",
      instructions: "You are Pixel Pilot, a helpful, friendly AI assistant. Be concise unless the user asks for detail.",
      input: messages.map(({ role, content }) => ({ role: role === "assistant" ? "assistant" : "user", content }))
    });
    res.json({ text: response.output_text || "I couldn't produce a text response." });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "The chat request failed." });
  }
});

app.post("/api/image", async (req, res) => {
  if (!requireKey(res)) return;
  const prompt = String(req.body.prompt || "").trim();
  if (!prompt) return res.status(400).json({ error: "Describe the image you want to create." });
  try {
    const result = await client.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
      quality: "medium"
    });
    const image = result.data?.[0]?.b64_json;
    if (!image) throw new Error("No image was returned.");
    res.json({ image: `data:image/png;base64,${image}` });
  } catch (error) {
    res.status(error.status || 500).json({ error: error.message || "The image request failed." });
  }
});

app.listen(port, () => console.log(`Pixel Pilot is running at http://localhost:${port}`));
