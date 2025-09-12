const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async (req, res) => {
  try {
    if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

    const { postId, author, text } = req.body || {};
    if (!postId || !author || !text) return res.status(400).json({ error: "All fields are required" });

    const { data, error } = await supabase.from("replies").insert([{ post_id: postId, author, text }]).select();
    if (error) return res.status(400).json({ error: error.message });

    return res.status(200).json({ reply: data[0] });
  } catch (err) {
    console.error("Replies API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
