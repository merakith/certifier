# Certifier Docs

Certifier is a three-part system for issuing, verifying, and revoking non-transferable certificate NFTs.

## Docs map
- `docs/setup.md` - local setup and prerequisites
- `docs/api.md` - API endpoints and payloads
- `docs/frontend.md` - UI routes, behaviors, and API expectations
- `docs/blockchain.md` - smart contracts and deployment
- `docs/integration-notes.md` - known gaps and mismatches

## Architecture at a glance
- Frontend (Vite + React) calls `/api/*` routes
- API (Express + ethers) talks to the `CertificateNFT` contract
- Smart contracts live in `blockchain/contracts`

## Primary flows
- Issue certificate: UI -> `POST /api/mint` -> `CertificateNFT.mint`
- Verify token: UI -> `GET /api/verify/:tokenId` -> `CertificateNFT.tokenURI`
- Revoke token: UI -> `POST /api/revoke` (expected) -> `CertificateNFT.revokeCert`
- Public PDF verify: UI computes SHA-256 -> `POST /api/verify` (expected) -> registry lookup

For details, start with `docs/setup.md` and `docs/api.md`.
