# Integration Notes

This project has a few API/UI mismatches that are useful to track in one place.

## Missing API endpoints (UI expects these)
- `POST /api/verify` - used by Public PDF Verification
- `POST /api/revoke` - used by Revoke Token
- `GET /api/stats` - used by Dashboard

## API endpoint mismatch

The API currently implements:
- `GET /api/revoke/:tokenId`

The UI currently calls:
- `POST /api/revoke` with `{ "tokenId": "..." }`

Decide whether to:
- change the UI to call `GET /api/revoke/:tokenId`, or
- update the API to accept `POST /api/revoke`.

## Public PDF verification gap

`frontend/src/components/PublicVerify.tsx` expects `POST /api/verify` to:
- accept `hash` (hex string)
- return `{ valid: true, data: {...} }` on match

No API route exists yet, and the `CertificateRegistry` contract is not wired into the API.

## Dashboard stats gap

`frontend/src/components/Dashboard.tsx` fetches `/api/stats` every 10 seconds but no API route exists.

## Contract vs API usage

The API uses only `CertificateNFT` for minting and token metadata reads. `CertificateRegistry` is currently unused.
