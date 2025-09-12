import { createClient } from "@supabase/supabase-js";

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

export default async function handler(req, res) {
  if (req.method === "GET") {
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) return res.status(400).json({ error: error.message });
      return res.json({ posts: data });
    } catch (err) {
      console.error("Fetch posts error:", err);
      return res.status(500).json({ error: "Failed to fetch posts" });
    }
  }

  if (req.method === "POST") {
    const { title, content, category, author } = req.body;
    try {
      const { data, error } = await supabase.from("posts").insert([{ title, content, category, author }]).select();
      if (error) return res.status(400).json({ error: error.message });
      return res.json({ post: data[0] });
    } catch (err) {
      console.error("Create post error:", err);
      return res.status(500).json({ error: "Failed to create post" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
