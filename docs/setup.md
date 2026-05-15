# Local Setup

This repo contains three separate packages:

- `frontend/` - React + Vite UI
- `api/` - Express API
- `blockchain/` - Hardhat project

## Prerequisites
- Node.js 18+ (recommended)
- pnpm
- An EVM JSON-RPC endpoint for local or testnet

## Install dependencies

From the repo root, install per-package:

```bash
cd api && pnpm install
cd ../frontend && pnpm install
cd ../blockchain && pnpm install
```

## Configure API environment

The API reads its config from `api/.env`:

- `RPC_URL` - JSON-RPC endpoint for the chain
- `CONTRACT_ADDRESS` - deployed `CertificateNFT` address
- `OWNER_PRIVATE_KEY` - private key for the issuer account
- `PORT` - optional, defaults to 800

Example:

```bash
RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0xYourContractAddress
OWNER_PRIVATE_KEY=0xYourPrivateKey
PORT=800
```

## Run the stack

Start the blockchain (optional if using a remote RPC):

```bash
cd blockchain
npx hardhat node
```

Deploy the NFT contract:

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

Start the API:

```bash
cd api
pnpm dev
```

Start the frontend:

```bash
cd frontend
pnpm dev
```

The UI will call the API on the same host, so run them on the same machine or configure a proxy.

## Smoke checks
- API: `GET http://localhost:800/health`
- Mint: `POST http://localhost:800/api/mint`
- Verify: `GET http://localhost:800/api/verify/0`

API payloads are defined in `docs/api.md`.
