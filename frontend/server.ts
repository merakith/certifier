import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mock Database for development
const certificates:any[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // --- API ROUTES ---

  // Get recent certificates
  app.get('/api/certificates', (req, res) => {
    res.json(certificates);
  });

  // Mint a new certificate
  app.post('/api/mint', async (req, res) => {
    const { studentName, recipientAddress, fileHash } = req.body;

    if (!studentName || !recipientAddress || !fileHash) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Simulate blockchain delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newCert = {
      studentName,
      recipientAddress,
      fileHash,
      timestamp: new Date().toISOString(),
      txHash: '0x' + Math.random().toString(16).slice(2, 12) + '...' + Math.random().toString(16).slice(2, 6),
      tokenId: Math.floor(10000 + Math.random() * 90000).toString()
    };

    certificates.unshift(newCert);

    res.json({
      success: true,
      txHash: newCert.txHash,
      tokenId: newCert.tokenId
    });
  });

  // Verify a certificate
  app.get('/api/verify/:hash', (req, res) => {
    const { hash } = req.params;
    const cert = certificates.find(c => c.fileHash === hash);

    if (cert) {
      res.json({
        success: true,
        isValid: true,
        metadata: {
          issuer: 'GLOBAL_ACADEMIC_LEDGER',
          type: 'SECURE_CREDENTIAL',
          recipient: cert.studentName,
          date: cert.timestamp,
          block: 18242901,
          hash: cert.fileHash
        }
      });
    } else {
      res.json({
        success: true,
        isValid: false,
        error: 'No matching record found in ledger'
      });
    }
  });

  // --- VITE MIDDLEWARE ---

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
