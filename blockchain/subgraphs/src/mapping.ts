import { CertificateMinted, CertificateRevoked } from "../generated/CertificateNFT/CertificateNFT";
import { Certificate } from "../generated/schema";

export function handleCertificateMinted(event: CertificateMinted): void {
  let cert = new Certificate(event.params.tokenId.toString());
  cert.owner       = event.params.to;
  cert.ipfsURI     = event.params.ipfsURI;
  cert.issuedAt    = event.block.timestamp;
  cert.blockNumber = event.block.number;
  cert.revoked     = false;
  cert.save();
}

export function handleCertificateRevoked(event: CertificateRevoked): void {
  let cert = Certificate.load(event.params.tokenId.toString());
  if (cert != null) {
    cert.revoked = true;
    cert.save();
  }
}