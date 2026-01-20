import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.js";
import meRoutes from "./routes/me.js";

const app = express();

/* 🔐 MUST COME FIRST */
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

/* Routes AFTER CORS */
app.use("/auth", authRoutes);
app.use("/api", meRoutes);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
