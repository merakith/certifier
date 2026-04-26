const API_BASE_URL = "https://mongrel-underfed-upwind.ngrok-free.dev";

export type IssueCertificateRequest = {
  to:     string;
  name:   string;
  course: string;
  issuer: string;
  image:  string;
};

export async function mintCertificate(req: IssueCertificateRequest) {
  const res = await fetch(`${API_BASE_URL}/api/mint`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to issue certificate");
  }
  return res.json();
}

export async function verifyCertificate(tokenId: string) {
  const res = await fetch(`${API_BASE_URL}/api/verify/${tokenId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Verification failed");
  }
  return res.json();
}

export async function bulkMint(csvText: string) {
  const res = await fetch(`${API_BASE_URL}/api/mint/bulk/csv`, {
    method: "POST",
    headers: { "Content-Type": "text/csv" },
    body: csvText,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Bulk minting failed");
  }
  return res.json();
}

export async function revokeCertificate(tokenId: string) {
  const res = await fetch(`${API_BASE_URL}/api/revoke/${tokenId}`);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Revocation failed");
  }
  return res.json();
}
