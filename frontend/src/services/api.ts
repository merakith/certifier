export interface MintResponse {
  success: boolean;
  txHash?: string;
  tokenId?: string;
  error?: string;
}

export interface VerifyResponse {
  success: boolean;
  isValid: boolean;
  metadata?: {
    issuer: string;
    type: string;
    recipient: string;
    date: string;
    block: number;
    hash: string;
  };
  error?: string;
}

const API_BASE_URL = '/api';

async function handleResponse(response: Response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export async function issueCertificate(studentName: string, recipientAddress: string, fileHash: string): Promise<MintResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/mint`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentName,
        recipientAddress,
        fileHash,
      }),
    });
    return handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Server Connection Error: Unable to reach the minting service.');
    }
    throw error;
  }
}

export async function verifyCertificate(hash: string): Promise<VerifyResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/verify/${hash}`);
    return handleResponse(response);
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Server Connection Error: Unable to reach the verification service.');
    }
    throw error;
  }
}

export async function getCertificates(): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/certificates`);
    const data = await handleResponse(response);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Server Connection Error: Unable to reach the certificate registry.');
    }
    throw error;
  }
}
