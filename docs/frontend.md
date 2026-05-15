# Frontend Guide

The frontend is a Vite + React app in `frontend/`.

## Scripts
- `pnpm dev` - start Vite dev server
- `pnpm build` - production build
- `pnpm preview` - preview build

## Routes
- `/` - Dashboard overview
- `/issue` - Issue certificate form
- `/verify` - Verify on-chain token metadata
- `/public-verify` - Public PDF verification
- `/revoke` - Revoke a token

## API expectations

The UI calls these endpoints:

- `POST /api/mint` - from Issue Certificate
- `GET /api/verify/:tokenId` - from Verify Token
- `POST /api/verify` - from Public PDF Verification
- `POST /api/revoke` - from Revoke Token
- `GET /api/stats` - from Dashboard

Only the first two are currently implemented by the API. The others are documented in `docs/integration-notes.md`.

## PDF verification flow

`/public-verify` uses the browser Web Crypto API to compute a SHA-256 hash of the uploaded PDF and sends it to `POST /api/verify`.

Expected request body:

```json
{ "hash": "0x<sha256>" }
```

Expected response (success):

```json
{
  "valid": true,
  "data": {
    "studentName": "...",
    "recipientWallet": "0x...",
    "blockNumber": 123,
    "timestamp": 1700000000,
    "txHash": "0x..."
  }
}
```

Expected response (failure):

```json
{ "valid": false }
```
