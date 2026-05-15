# API Reference

Base URL defaults to `http://localhost:800`.

## Health

`GET /health`

Response:

```json
{ "status": "ok" }
```

## Mint certificate

`POST /api/mint`

Request body:

```json
{
  "to": "0xRecipientAddress",
  "name": "Student Name",
  "course": "Course Title",
  "issuer": "Issuer Name",
  "image": "https://..."
}
```

Response (202):

```json
{
  "status": "submitted",
  "message": "Certificate mint transaction submitted.",
  "transactionHash": "0x...",
  "blockNumber": 123,
  "data": { "to": "0x...", "name": "...", "course": "...", "issuer": "...", "image": "..." }
}
```

Errors:
- `400` invalid payload
- `500` missing chain config or signing key

## Verify token

`GET /api/verify/:tokenId`

Response (200):

```json
{
  "verified": true,
  "tokenId": "1",
  "tokenUri": "data:application/json;utf8,...",
  "metadata": { "name": "Certificate - ...", "attributes": [] }
}
```

Response (404):

```json
{
  "verified": false,
  "error": "Token could not be verified on-chain",
  "details": "..."
}
```

## Revoke token

`GET /api/revoke/:tokenId`

Response (200):

```json
{ "burned": true, "tokenId": "1" }
```

Response (404):

```json
{ "burned": false, "error": "Token could not be burned on-chain, maybe it doesn't exist.", "details": "..." }
```

## Not implemented in API

The frontend calls these endpoints, but the API does not define them yet:

- `POST /api/verify` (used by Public PDF Verification)
- `POST /api/revoke` (used by Revoke Token UI)
- `GET /api/stats` (used by Dashboard)

See `docs/integration-notes.md` for details.
