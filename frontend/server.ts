import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const API_BASE_URL = "http://192.168.0.244:7890";

// API Routes
app.post("/api/mint", async (req, res) => {
  console.log("Proxying mint request to:", `${API_BASE_URL}/api/mint`);
  try {
    const response = await fetch(`${API_BASE_URL}/api/mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    console.log("External API Response:", { status: response.status, data });
    
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error("External Minting proxy failed:", error);
    res.status(500).json({ success: false, error: `PROXY_CONNECTION_ERROR: ${error.message}` });
  }
});

app.post("/api/verify", async (req, res) => {
  console.log("Proxying verify request to:", `${API_BASE_URL}/api/verify`);
  try {
    const response = await fetch(`${API_BASE_URL}/api/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    console.log("External API Response:", { status: response.status, data });
    
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error("External Verification proxy failed:", error);
    res.status(500).json({ valid: false, error: `PROXY_CONNECTION_ERROR: ${error.message}` });
  }
});

app.post("/api/revoke", async (req, res) => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error("External Revocation failed:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    // Attempt to fetch stats from external API if it exists, otherwise return fallback
    const response = await fetch(`${API_BASE_URL}/api/stats`).catch(() => null);
    if (response && response.ok) {
      const data = await response.json();
      return res.json(data);
    }
    
    res.json({
      success: true,
      totalVerified: "---",
      blockHeight: "L1_SYNCED",
      network: "EXTERNAL_NODE"
    });
  } catch (error: any) {
    res.json({
      success: false,
      totalVerified: "0",
      blockHeight: "0",
      network: "OFFLINE"
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
