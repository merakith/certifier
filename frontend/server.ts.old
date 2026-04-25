import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

const API_BASE_URL = "http://10.187.116.168:800";

// API Routes
app.post("/api/mint", async (req, res) => {
  console.log("Proxying mint request to:", `${API_BASE_URL}/api/mint`);
  try {
    const response = await fetch(`${API_BASE_URL}/api/mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body),
      signal: AbortSignal.timeout(30000)
    });
    
    const data = await response.json();
    console.log("External Mint API Response:", { status: response.status, data });
    
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error("External Minting proxy failed:", error);
    res.status(500).json({ 
      success: false, 
      error: `PROXY_CONNECTION_ERROR: ${error.message}`, 
      cause: error.cause ? error.cause.message || JSON.stringify(error.cause) : null,
      stack: error.stack 
    });
  }
});

app.get("/api/verify/:tokenId", async (req, res) => {
  const { tokenId } = req.params;
  console.log("Proxying verify GET request to:", `${API_BASE_URL}/api/verify/${tokenId}`);
  try {
    const response = await fetch(`${API_BASE_URL}/api/verify/${tokenId}`, {
      method: 'GET',
      signal: AbortSignal.timeout(30000)
    });
    
    const data = await response.json();
    console.log("External Verify API Response:", { status: response.status, data });
    
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error("External Verification proxy failed:", error);
    res.status(500).json({ 
      verified: false, 
      error: `PROXY_CONNECTION_ERROR: ${error.message}`, 
      cause: error.cause ? error.cause.message || JSON.stringify(error.cause) : null,
      stack: error.stack 
    });
  }
});

app.post("/api/verify", async (req, res) => {
  console.log("Proxying verify POST request (fallback) to:", `${API_BASE_URL}/api/verify`);
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
  console.log("Proxying revoke request to:", `${API_BASE_URL}/api/revoke`);
  try {
    const response = await fetch(`${API_BASE_URL}/api/revoke`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    
    const data = await response.json();
    console.log("External API Response:", { status: response.status, data });
    
    res.status(response.status).json(data);
  } catch (error: any) {
    console.error("External Revocation proxy failed:", error);
    res.status(500).json({ success: false, error: `PROXY_CONNECTION_ERROR: ${error.message}` });
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    // Very short timeout for stats to keep dashboard responsive
    const response = await fetch(`${API_BASE_URL}/api/stats`, { 
      signal: AbortSignal.timeout(2000) 
    }).catch(() => null);
    
    if (response && response.ok) {
      const data = await response.json();
      return res.json({
        success: true,
        totalVerified: data.totalVerified || "0",
        blockHeight: data.blockHeight || "---",
        network: data.network || "ONLINE"
      });
    }
    
    // Fallback if external API is unreachable or times out
    return res.json({
      success: true,
      totalVerified: "---",
      blockHeight: "L1_SYNCED",
      network: "STANDBY"
    });
  } catch (error: any) {
    // Final safety fallback
    res.json({
      success: true,
      totalVerified: "0",
      blockHeight: "SYNCING",
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
