import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Load knowledge base once
const knowledgeBase = JSON.parse(fs.readFileSync("knowledge.json", "utf-8"));
function findRelevantAnswer(userMessage) {
  const lowerMsg = userMessage.toLowerCase();
  for (const item of knowledgeBase) {
    if (lowerMsg.includes(item.topic.split("_")[0]) || lowerMsg.includes(item.topic.split("_")[1])) {
      return item.answer;
    }
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message } = req.body;

    const kbAnswer = findRelevantAnswer(message);
    if (kbAnswer) return res.json({ answer: kbAnswer });

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `You are UniGlobe, assistant for international students. Question: ${message}` }] }]
    });

    res.json({ answer: result.response.text() });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
}
