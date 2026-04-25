export interface MintRequest {
  to: string;
  name: string;
  course: string;
  issuer: string;
  image: string;
}

export interface MintResponse {
  status: string;
  message: string;
  transactionHash: string;
  blockNumber?: number | null;
  data: MintRequest;
}

export interface VerifyResponse {
  verified: boolean;
  tokenId: string;
  tokenUri?: string;
  metadata?: any;
  error?: string;
  details?: string;
}

export interface RevokeResponse {
  burned: boolean;
  tokenId: string;
  error?: string;
  details?: string;
}

const API_BASE_URL = 'http://10.10.31.166:800/api';

async function handleResponse(response: Response) {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.details || data.error || `HTTP error! status: ${response.status}`);
  }
  return data;
}

export async function issueCertificate(request: MintRequest): Promise<MintResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/mint`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json',
        "ngrok-skip-browser-warning": "true", 
       },
      body: JSON.stringify(request),
    });
    return handleResponse(response);
  } catch (error: any) {
    console.error('Minting failed:', error);
    throw error;
  }
}

export async function verifyCertificate(tokenId: string): Promise<VerifyResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/verify/${tokenId}`,{
      headers: { 
        "ngrok-skip-browser-warning": "true", 
       },
  });
    return handleResponse(response);
  } catch (error: any) {
    console.error('Verification failed:', error);
    throw error;
  }
}

export async function revokeCertificate(tokenId: string): Promise<RevokeResponse> {
  try {
    // Backend uses GET for revoke per teammate snippet
    const response = await fetch(`${API_BASE_URL}/revoke/${tokenId}`,{
      headers: { 
        "ngrok-skip-browser-warning": "true", 
       },
  });
    return handleResponse(response);
  } catch (error: any) {
    console.error('Revocation failed:', error);
    throw error;
  }
}

export async function getCertificates(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/certificates`);
    return handleResponse(response);
  } catch (error: any) {
    console.error('Failed to fetch certificates:', error);
    return [];
  }
}
