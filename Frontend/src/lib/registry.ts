
// Simulated Blockchain Registry (No External Database)
// This uses localStorage to simulate standard on-chain persistence for the local environment.

export const registry = {
  // Simulate recording a hash on the blockchain
  issue: (hash: string, metadata: any) => {
    const existing = JSON.parse(localStorage.getItem('vproof_registry') || '{}');
    existing[hash] = {
      ...metadata,
      timestamp: new Date().toISOString(),
      blockNumber: Math.floor(Math.random() * 20000000) + 18000000
    };
    localStorage.setItem('vproof_registry', JSON.stringify(existing));
    return true;
  },

  // Simulate querying the blockchain for a hash
  verify: (hash: string) => {
    const existing = JSON.parse(localStorage.getItem('vproof_registry') || '{}');
    return existing[hash] || null;
  }
};
