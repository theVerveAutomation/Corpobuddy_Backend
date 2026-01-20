import fetch from "node-fetch";

export async function requireAuth(req, res, next) {
  try {
    const token = req.cookies.corpobuddy_token;
    if (!token) return res.status(401).json({ error: "UNAUTHORIZED" });

    // Get auth user
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
      return res.status(401).json({ error: "INVALID_OR_EXPIRED_TOKEN" });
    }

    const authUser = await userRes.json();

    // Get profile (role source of truth)
    const profileRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${authUser.id}&select=role,org_id`,
      {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      }
    );

    const [profile] = await profileRes.json();

    req.user = {
      id: authUser.id,
      email: authUser.email,
      role: profile?.role ?? "user",
      orgId: profile?.org_id,
    };

    next();
  } catch (err) {
    return res.status(401).json({ error: "INVALID_OR_EXPIRED_TOKEN" });
  }
}
