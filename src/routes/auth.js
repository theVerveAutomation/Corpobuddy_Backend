import express from "express";
import fetch from "node-fetch";
import { SUPABASE_URL, ANON_KEY } from "../utils/supabase.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { orgId, country, username, password } = req.body;

    if (!orgId || !country || !username || !password) {
      return res.status(400).json({
        errorCode: "MISSING_FIELDS",
      });
    }

    const profileUrl =
      `${SUPABASE_URL}/rest/v1/profiles` +
      `?org_id=eq.${encodeURIComponent(orgId)}` +
      `&country=eq.${encodeURIComponent(country)}` +
      `&username=eq.${encodeURIComponent(username)}` +
      `&select=*`;

    const profileRes = await fetch(profileUrl, {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
    });

    const profiles = await profileRes.json();
    const profile = profiles?.[0];

    if (!profile) {
      return res.status(401).json({
        errorCode: "USER_NOT_FOUND",
      });
    }

    const tokenRes = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: ANON_KEY,
        },
        body: JSON.stringify({
          email: profile.email,
          password,
        }),
      }
    );

    const token = await tokenRes.json();

    if (!tokenRes.ok) {
      return res.status(401).json({
        errorCode: "INVALID_PASSWORD",
      });
    }

    res.cookie("corpobuddy_token", token.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    return res.json({
      success: true,
      profile,
    });
  } catch (err) {
    return res.status(500).json({
      errorCode: "SERVER_ERROR",
      detail: err.message,
    });
  }
});

export default router;