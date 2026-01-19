import fetch from "node-fetch";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.corpobuddy_token;

    if (!token) {
      return res.status(401).json({ error: "UNAUTHORIZED" });
    }

    const userRes = await fetch(
      `${process.env.SUPABASE_URL}/auth/v1/user`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          apikey: process.env.SUPABASE_ANON_KEY,
        },
      }
    );

    if (!userRes.ok) {
      return res.status(401).json({
        error: "INVALID_OR_EXPIRED_TOKEN",
      });
    }

    const user = await userRes.json();

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role ?? "authenticated",
    };

    next();
  } catch (err) {
    console.error("AUTH CHECK FAILED:", err);
    return res.status(401).json({
      error: "INVALID_OR_EXPIRED_TOKEN",
    });
  }
}
