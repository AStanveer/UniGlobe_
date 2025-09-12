const { createClient } = require("@supabase/supabase-js");
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      const { data, error } = await supabase.from("posts").select("*, replies(*)").order("created_at", { ascending: false });
      if (error) return res.status(400).json({ error: error.message });
      return res.status(200).json({ posts: data });
    }

    if (req.method === "POST") {
      const { title, content, category, author } = req.body || {};
      if (!title || !content || !category || !author) return res.status(400).json({ error: "All fields are required" });

      const { data, error } = await supabase.from("posts").insert([{ title, content, category, author }]).select();
      if (error) return res.status(400).json({ error: error.message });

      return res.status(200).json({ post: data[0] });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("Posts API error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
