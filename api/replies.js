import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { postId, author, text } = req.body;
  try {
    const { data, error } = await supabase.from("replies").insert([{ post_id: postId, author, text }]).select();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ reply: data[0] });
  } catch (err) {
    console.error("Reply error:", err);
    res.status(500).json({ error: "Failed to add reply" });
  }
}
