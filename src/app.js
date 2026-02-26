require("dotenv").config();
const express = require("express");
const login = require("./login");

const app = express();
app.use(express.json());

// Middleware bảo vệ nội bộ
app.use((req, res, next) => {

  const key = req.headers["x-internal-key"];

  if (key !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({ message: "Forbidden" });
  }

  next();
});

// API cấp token
app.get("/token", async (req, res) => {
  try {
    console.log("Internal request: generating new token...");

    const token = await login();

    res.json({
      access_token: token,
      success: true
    });

  } catch (err) {
    console.error("Login failed:", err.message);

    res.status(500).json({
      success: false
    });
  }
});

app.listen(3000, () => {
  console.log("DMS Auth Service running on port 3000");
});