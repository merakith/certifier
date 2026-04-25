# certifier-api

TypeScript Express API for issuing, verifying, and revoking certificate NFTs.

## Overview

The service exposes a small HTTP API for interacting with an on-chain certificate contract.

Available endpoints:

- `GET /health`
- `POST /api/mint`
- `POST /api/bulk-mint`
- `GET /api/verify/:tokenId`
- `GET /api/revoke/:tokenId`

The app also serves a browser-based test utility from `public/index.html`.

## Requirements

- Node.js 20+
- `pnpm`
- A deployed certificate NFT contract
- An RPC endpoint for the chain where the contract is deployed
- A signing wallet private key that is allowed to mint and revoke certificates

## Setup

Install dependencies:

```bash
pnpm install
```

Run in development mode:

```bash
pnpm dev
```

Build for production:

```bash
pnpm build
```

Start the compiled app:

```bash
pnpm start
```

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Port to bind the server to. Defaults to `800`. |
| `RPC_URL` | Yes | JSON-RPC endpoint for the target chain. |
| `CONTRACT_ADDRESS` | Yes | Deployed certificate NFT contract address. |
| `OWNER_PRIVATE_KEY` | Yes | Private key used to sign mint and revoke transactions. |

Example:

```bash
PORT=800
RPC_URL=https://your-rpc-endpoint.example
CONTRACT_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
OWNER_PRIVATE_KEY=0x...
```

## Common Response Shape

All JSON responses are returned by Express as standard API objects. Success responses usually include the transaction hash for write operations and token metadata for read operations.

For frontends calling the API through ngrok on the free plan, include this header on every request:

```http
ngrok-skip-browser-warning: true
```

## Endpoints

### `GET /health`

Simple liveness check.

#### Response

```json
{
  "status": "ok"
}
```

### `POST /api/mint`

Mint a single certificate NFT.

#### Request body

```json
{
  "to": "0x1111111111111111111111111111111111111111",
  "name": "Ada Lovelace",
  "course": "Blockchain 101",
  "issuer": "Certifier Academy",
  "image": "https://example.com/certificates/ada-lovelace.png"
}
```

#### Field requirements

- `to` must be a valid EVM address
- `name` must be a non-empty string
- `course` must be a non-empty string
- `issuer` must be a non-empty string
- `image` must be a non-empty string

#### Success response

Returns HTTP `202 Accepted`.

```json
{
  "status": "submitted",
  "message": "Certificate mint transaction submitted.",
  "transactionHash": "0xabc123...",
  "blockNumber": 12345678,
  "tokenId": "42",
  "data": {
    "to": "0x1111111111111111111111111111111111111111",
    "name": "Ada Lovelace",
    "course": "Blockchain 101",
    "issuer": "Certifier Academy",
    "image": "https://example.com/certificates/ada-lovelace.png"
  }
}
```

If the token ID cannot be extracted from the receipt, `tokenId` may be `null`.

#### Error responses

- `400 Bad Request` if the payload is invalid
- `500 Internal Server Error` if blockchain config or signing credentials are missing
- `500 Internal Server Error` if the mint transaction fails

#### Example

```bash
curl -X POST http://localhost:800/api/mint \
  -H 'Content-Type: application/json' \
  -H 'ngrok-skip-browser-warning: true' \
  -d '{
    "to": "0x1111111111111111111111111111111111111111",
    "name": "Ada Lovelace",
    "course": "Blockchain 101",
    "issuer": "Certifier Academy",
    "image": "https://example.com/certificates/ada-lovelace.png"
  }'
```

### `POST /api/bulk-mint`

Mint multiple certificates from a CSV payload.

The request body must be raw CSV text with a header row.

#### Required columns

- `to`
- `name`
- `course`
- `issuer`
- `image`

#### CSV example

```csv
to,name,course,issuer,image
0x1111111111111111111111111111111111111111,Ada Lovelace,Blockchain 101,Certifier Academy,https://example.com/certificates/ada-lovelace.png
0x2222222222222222222222222222222222222222,Grace Hopper,Smart Contract Security,Certifier Academy,https://example.com/certificates/grace-hopper.png
```

#### Limits and behavior

- Up to `500` rows per request
- Rows are processed sequentially
- Each mint uses an explicit nonce to avoid collisions during batch submission
- Invalid rows are returned as failed results without stopping the full batch

#### Request headers

Use one of the following content types:

- `text/csv`
- `text/plain`

#### Success response

Returns HTTP `200 OK`.

```json
{
  "status": "completed",
  "message": "Bulk mint batch processed.",
  "totalRows": 2,
  "submitted": 2,
  "failed": 0,
  "results": [
    {
      "rowNumber": 2,
      "to": "0x1111111111111111111111111111111111111111",
      "name": "Ada Lovelace",
      "course": "Blockchain 101",
      "issuer": "Certifier Academy",
      "image": "https://example.com/certificates/ada-lovelace.png",
      "status": "submitted",
      "tokenId": "42",
      "transactionHash": "0xabc123...",
      "error": null
    }
  ]
}
```

#### Error responses

- `400 Bad Request` if the CSV is empty, malformed, or missing required columns
- `500 Internal Server Error` if blockchain config or signing credentials are missing
- Individual rows may still fail and appear in the `results` array while the batch returns `200 OK`

#### Example

```bash
curl -X POST http://localhost:800/api/bulk-mint \
  -H 'Content-Type: text/csv' \
  -H 'ngrok-skip-browser-warning: true' \
  --data-binary @bulk_test.csv
```

### `GET /api/verify/:tokenId`

Fetch the token URI and decoded certificate metadata for a given token ID.

#### Path parameters

- `tokenId` must be a non-negative integer

#### Success response

```json
{
  "verified": true,
  "tokenId": "42",
  "tokenUri": "data:application/json;utf8,{\"name\":\"Ada Lovelace\"}",
  "metadata": {
    "name": "Ada Lovelace"
  }
}
```

#### Error responses

- `400 Bad Request` if `tokenId` is invalid
- `404 Not Found` if the token does not exist or cannot be read on-chain
- `500 Internal Server Error` if blockchain config is missing

#### Example

```bash
curl http://localhost:800/api/verify/42 \
  -H 'ngrok-skip-browser-warning: true'
```

### `GET /api/revoke/:tokenId`

Revoke a certificate NFT.

#### Path parameters

- `tokenId` must be a non-negative integer

#### Success response

```json
{
  "burned": true,
  "tokenId": "42"
}
```

#### Error responses

- `400 Bad Request` if `tokenId` is invalid
- `404 Not Found` if the token cannot be burned on-chain
- `500 Internal Server Error` if blockchain config is missing

#### Example

```bash
curl http://localhost:800/api/revoke/42 \
  -H 'ngrok-skip-browser-warning: true'
```

## Frontend Test Utility

Open `public/index.html` in a browser through the Express server to test the API manually.

The page includes forms for:

- Single mint
- Bulk mint via CSV upload
- Verify by token ID
- Revoke by token ID

## Notes

- The app enables CORS so local tooling and browser-based clients can call the API directly.
- Bulk issuance is intentionally sequential to keep the nonce handling stable.
- The contract ABI currently assumes a `mint(...)` function that emits or returns a token ID and a standard ERC-721 `Transfer` event.