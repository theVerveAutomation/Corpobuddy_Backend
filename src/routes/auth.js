import express from "express";
import fetch from "node-fetch";
import { SUPABASE_URL, ANON_KEY } from "../utils/supabase.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { orgId, username, password } = req.body;

    // Check for missing fields individually
    if (!orgId) {
      return res.status(400).json({
        errorCode: "MISSING_ORG_ID",
      });
    }

    if (!username) {
      return res.status(400).json({
        errorCode: "MISSING_USERNAME",
      });
    }

    if (!password) {
      return res.status(400).json({
        errorCode: "MISSING_PASSWORD",
      });
    }

    // First check if org exists
    const orgCheckUrl = `${SUPABASE_URL}/rest/v1/profiles?org_id=eq.${encodeURIComponent(orgId)}&select=org_id`;
    const orgCheckRes = await fetch(orgCheckUrl, {
      headers: {
        apikey: ANON_KEY,
        Authorization: `Bearer ${ANON_KEY}`,
      },
    });
    const orgExists = await orgCheckRes.json();

    if (!orgExists || orgExists.length === 0) {
      return res.status(401).json({
        errorCode: "INVALID_ORG_ID",
      });
    }

    // Then check if username exists in that org
    const profileUrl =
      `${SUPABASE_URL}/rest/v1/profiles` +
      `?org_id=eq.${encodeURIComponent(orgId)}` +
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
        errorCode: "INVALID_USERNAME",
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