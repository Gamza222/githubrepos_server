import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/github-oauth", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Missing code parameter" });
  }

  try {
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_SECRET,
          code: code,
          redirect_uri: process.env.GITHUB_REDIRECT_URI_DEV,
        }),
      }
    );

    const tokenData = await tokenResponse.text();
    const params = new URLSearchParams(tokenData);
    const accessToken = params.get("access_token");

    if (accessToken) {
      res.status(200).json({ access_token: accessToken });
    } else {
      res.status(400).json({ error: "Failed to obtain access token" });
    }
  } catch (error) {
    console.error("Error during token exchange:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
