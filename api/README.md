# certifier-api

Basic Express app written in TypeScript.

## Scripts

- `pnpm dev` - start the app in watch mode
- `pnpm build` - compile TypeScript to `dist`
- `pnpm start` - run the compiled app

## Install

`pnpm install`

## Health check

`GET /health`

## Verify certificate

`GET /api/verify/:tokenId`

Required environment variables:

- `RPC_URL` - JSON-RPC endpoint for your chain
- `CONTRACT_ADDRESS` - deployed `CertificateNFT` contract address
- `OWNER_PRIVATE_KEY` - private key for the contract owner account (used by `POST /api/mint`)
