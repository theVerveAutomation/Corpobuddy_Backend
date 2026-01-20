import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import fetch from "node-fetch";

const router = express.Router();

router.get("/me", requireAuth, async (req, res) => {
  try {
    // Fetch profile first
    const profileRes = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/profiles?id=eq.${req.user.id}`,
      {
        headers: {
          apikey: process.env.SUPABASE_ANON_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!profileRes.ok) {
      console.error("Profile fetch failed:", await profileRes.text());
      return res.status(500).json({ error: "Failed to fetch profile" });
    }

    const profileData = await profileRes.json();
    const profile = profileData[0];

    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    // Fetch organization using org_code
    let organizationName = null;
    if (profile.org_id) {
      const orgRes = await fetch(
        `${process.env.SUPABASE_URL}/rest/v1/organizations?org_code=eq.${profile.org_id}&select=name`,
        {
          headers: {
            apikey: process.env.SUPABASE_ANON_KEY,
            Authorization: `Bearer ${process.env.SUPABASE_ANON_KEY}`,
          },
        }
      );

      if (orgRes.ok) {
        const orgData = await orgRes.json();
        organizationName = orgData[0]?.name || null;
      } else {
        console.error("Organization fetch failed:", await orgRes.text());
      }
    }

    res.json({
      authenticated: true,
      user: {
        id: profile.id,
        email: profile.email,
        username: profile.username,
        full_name: profile.full_name,
        org_id: profile.org_id,
        role: profile.role,
        organization_logo: profile.organization_logo,
        organization_name: organizationName,
      },
    });
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;