# Blockchain Guide

Smart contracts live in `blockchain/contracts`.

## Contracts

### `CertificateNFT` (`nft.sol`)

Non-transferable ERC721 used for certificate issuance.

Key functions:
- `mint(address to, string name, string course, string issuer, string image)` - owner-only mint
- `tokenURI(uint256 tokenId)` - returns JSON metadata via data URI
- `revokeCert(uint256 tokenId)` - owner-only burn

Behavior:
- Tokens are soulbound by overriding `_update` to block transfers.
- Metadata is stored on-chain in `certificates` mapping.

### `CertificateRegistry` (`CertificateRegistry.sol`)

Simple hash registry for PDF verification.

Key functions:
- `issueCertificate(bytes32 certHash, address to)` - store hash -> recipient mapping
- `verifyCertificate(bytes32 certHash, address to)` - returns true if mapping matches

Note: The current API does not expose endpoints that use this contract yet.

## Deployment

Hardhat deployment script:

```bash
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

This deploys `CertificateNFT` only.

## Config

Hardhat config: `blockchain/hardhat.config.ts` sets Solidity 0.8.24.
