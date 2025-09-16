const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
const path = require("path");

// Load knowledge base
const kbPath = path.join(__dirname, "../knowledge.json");
const knowledgeBase = JSON.parse(fs.readFileSync(kbPath, "utf-8"));

function findRelevantAnswer(userMessage) {
  const lowerMsg = userMessage.toLowerCase();
  for (const item of knowledgeBase) {
    if (
      (item.topic.split("_")[0] && lowerMsg.includes(item.topic.split("_")[0])) ||
      (item.topic.split("_")[1] && lowerMsg.includes(item.topic.split("_")[1]))
    ) {
      return item.answer;
    }
  }
  return null;
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  systemInstruction: {
    role: "system",
    parts: [{ text: "You are UniGlobe assistant. Always answer as a helpful guide for international students, focusing on visa, housing, mental health, and academic support. Maintain a friendly tone and assure the students to feel at ease. Do not give false information and only respond with proven or reliable resources" }]
  }
});


module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { message } = req.body || {};
    if (!message) return res.status(400).json({ error: "Message is required" });

    // Check knowledge base
    const kbAnswer = findRelevantAnswer(message);
    if (kbAnswer) return res.status(200).json({ reply: kbAnswer });

    // Use Gemini
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: `You are UniGlobe assistant. Question: ${message}` }] }]
    });

    const reply = result.response.text();
    return res.status(200).json({ reply });
  } catch (err) {
    console.error("Chatbot error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
