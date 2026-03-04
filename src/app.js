require("dotenv").config();
const express = require("express");
const dmsRoutes = require("./routes/dms.routes");

const loginDMS = require('./login/login')


const app = express();

// Parse body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Internal middleware
app.use((req, res, next) => {
  const key = req.headers["x-internal-key"];

  if (key !== process.env.INTERNAL_API_KEY) {
    return res.status(403).json({ message: "Token Forbidden" });
  }

  next();
});

app.get("/token", async (req, res) => {
  try {
    console.log("Internal request: generating new token...");
    const token = await loginDMS();
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

// Mount routes
app.use("/api", dmsRoutes);

app.listen(3000, () => {
  console.log("DMS Gateway running on port 3000");
});