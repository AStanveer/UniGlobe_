// Use CommonJS to avoid ES module issues
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client with error handling
let supabase;
try {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
    console.error("Missing Supabase environment variables");
  }
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
} catch (error) {
  console.error("Failed to initialize Supabase client:", error);
}

module.exports = async (req, res) => {
  try {
    console.log("Function started, method:", req.method);
    
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    // Handle preflight request
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    // Check if Supabase is initialized
    if (!supabase) {
      console.error("Supabase client not initialized");
      return res.status(500).json({ error: "Server configuration error" });
    }

    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    console.log("Attempting signup for email:", email);

    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${req.headers.origin || 'http://localhost:3000'}/index.html`
      }
    });

    if (error) {
      console.error("Supabase signup error:", error.message);
      return res.status(400).json({ error: error.message });
    }

    console.log("Signup successful for:", email);
    return res.status(200).json({ 
      message: "Signup successful", 
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
      needsConfirmation: !data.session
    });

  } catch (err) {
    console.error("Unhandled error in signup function:", err);
    return res.status(500).json({ 
      error: "Internal server error",
      details: err.message 
    });
  }
};
