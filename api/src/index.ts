import "dotenv/config";
import express from "express";
import cors from "cors";
import { Contract, JsonRpcProvider, Wallet } from "ethers";

const app = express();
app.set('trust proxy', 1);
app.use(cors());
const port = Number(process.env.PORT) || 800;

type IssueCertificateRequest = {
	to: string;
	name: string;
	course: string;
	issuer: string;
	image: string; // URL or ipfs:// to the certificate image
};

const isNonEmptyString = (v: unknown): v is string =>
	typeof v === "string" && v.trim().length > 0;

const isAddress = (v: string): boolean => /^0x[a-fA-F0-9]{40}$/.test(v);

const parseTokenId = (v: string): bigint | null => {
	if (!/^\d+$/.test(v)) return null;
	const id = BigInt(v);
	return id >= 0n ? id : null;
};

const CERTIFICATE_NFT_ABI = [
	"function mint(address to, string ipfsURI) external returns (uint256)",
	"function tokenURI(uint256 tokenId) view returns (string)",
	"function revokeCert(uint256 tokenId) external",
	"event CertificateMinted(address indexed to, uint256 indexed tokenId, string ipfsURI)",
	"event CertificateRevoked(uint256 indexed tokenId)",
];

const getContractConfig = () => {
	const rpcUrl = process.env.RPC_URL;
	const contractAddress = process.env.CONTRACT_ADDRESS;
	if (!rpcUrl || !contractAddress || !isAddress(contractAddress)) return null;
	return { rpcUrl, contractAddress };
};

const getOwnerPrivateKey = (): string | null => {
	const key = process.env.OWNER_PRIVATE_KEY;
	return key?.trim().length ? key : null;
};

const getPinataJwt = (): string | null => {
	const jwt = process.env.PINATA_JWT;
	return jwt?.trim().length ? jwt : null;
};

async function pinMetadataToIPFS(metadata: object): Promise<string> {
	const jwt = getPinataJwt();
	if (!jwt) throw new Error("Missing PINATA_JWT environment variable.");

	const res = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${jwt}`,
		},
		body: JSON.stringify({
			pinataContent: metadata,
			pinataMetadata: { name: "certificate-metadata" },
		}),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Pinata error ${res.status}: ${text}`);
	}

	const data = (await res.json()) as { IpfsHash: string };
	return `ipfs://${data.IpfsHash}`;
}

app.use(express.json());
app.use(express.static("public"));

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.post("/api/mint", async (req, res) => {
	const { to, name, course, issuer, image } =
		req.body as Partial<IssueCertificateRequest>;

	if (
		!isNonEmptyString(to) ||
		!isAddress(to) ||
		!isNonEmptyString(name) ||
		!isNonEmptyString(course) ||
		!isNonEmptyString(issuer) ||
		!isNonEmptyString(image)
	) {
		res.status(400).json({
			error: "Invalid payload. Expected non-empty strings for name, course, issuer, image and a valid EVM address for to.",
		});
		return;
	}

	const config = getContractConfig();
	if (!config) {
		res.status(500).json({ error: "Missing RPC_URL or CONTRACT_ADDRESS." });
		return;
	}

	const privateKey = getOwnerPrivateKey();
	if (!privateKey) {
		res.status(500).json({ error: "Missing OWNER_PRIVATE_KEY." });
		return;
	}

	try {
		// Step 1: build ERC-721 standard metadata
		const metadata = {
			name: `Certificate - ${name}`,
			description: `${name} completed ${course}, issued by ${issuer}.`,
			image,
			attributes: [
				{ trait_type: "Course", value: course },
				{ trait_type: "Issuer", value: issuer },
				{ trait_type: "Recipient", value: name },
				{ trait_type: "Issued", value: new Date().toISOString() },
			],
		};

		// Step 2: pin to IPFS
		const ipfsURI = await pinMetadataToIPFS(metadata);

		// Step 3: call contract
		const provider = new JsonRpcProvider(config.rpcUrl);
		const signer = new Wallet(privateKey, provider);
		const contract = new Contract(
			config.contractAddress,
			CERTIFICATE_NFT_ABI,
			signer,
		);

		const tx = await contract.mint(to, ipfsURI);
		const receipt = await tx.wait();

		// Step 4: read tokenId from CertificateMinted event
		let tokenId: string | null = null;

		if (receipt) {
			for (const log of receipt.logs) {
				if (
					log.address.toLowerCase() !==
					config.contractAddress.toLowerCase()
				)
					continue;
				try {
					const parsed = contract.interface.parseLog(log);
					if (parsed?.name === "CertificateMinted") {
						tokenId = parsed.args.tokenId.toString();
						break;
					}
				} catch {
					continue;
				}
			}
		}

		res.status(202).json({
			status: "submitted",
			message: "Certificate minted successfully.",
			transactionHash: tx.hash,
			blockNumber: receipt?.blockNumber ?? null,
			tokenId,
			ipfsURI,
		});
	} catch (error) {
		res.status(500).json({
			error: "Failed to issue certificate.",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

app.get("/api/verify/:tokenId", async (req, res) => {
	const tokenId = parseTokenId(req.params.tokenId);
	if (tokenId === null) {
		res.status(400).json({ error: "Invalid tokenId." });
		return;
	}

	const config = getContractConfig();
	if (!config) {
		res.status(500).json({ error: "Missing RPC_URL or CONTRACT_ADDRESS." });
		return;
	}

	try {
		const provider = new JsonRpcProvider(config.rpcUrl);
		const contract = new Contract(
			config.contractAddress,
			CERTIFICATE_NFT_ABI,
			provider,
		);

		// tokenURI() now returns an HTTPS Pinata gateway URL
		const gatewayUrl = (await contract.tokenURI(tokenId)) as string;

		// Fetch the actual metadata JSON from IPFS via the gateway
		const ipfsRes = await fetch(gatewayUrl);
		if (!ipfsRes.ok) {
			throw new Error(`IPFS gateway error: ${ipfsRes.status}`);
		}
		const metadata = await ipfsRes.json();

		res.json({
			verified: true,
			tokenId: tokenId.toString(),
			gatewayUrl,
			metadata,
		});
	} catch (error) {
		res.status(404).json({
			verified: false,
			error: "Token could not be verified on-chain.",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

app.get("/api/revoke/:tokenId", async (req, res) => {
	const tokenId = parseTokenId(req.params.tokenId);
	if (tokenId === null) {
		res.status(400).json({ error: "Invalid tokenId." });
		return;
	}

	const config = getContractConfig();
	if (!config) {
		res.status(500).json({ error: "Missing RPC_URL or CONTRACT_ADDRESS." });
		return;
	}

	const privateKey = getOwnerPrivateKey();
	if (!privateKey) {
		res.status(500).json({ error: "Missing OWNER_PRIVATE_KEY." });
		return;
	}

	const jwt = getPinataJwt();

	try {
		const provider = new JsonRpcProvider(config.rpcUrl);
		const signer = new Wallet(privateKey, provider);
		const contract = new Contract(
			config.contractAddress,
			CERTIFICATE_NFT_ABI,
			signer,
		);

		let cid: string | null = null;
		try {
			const uri = (await contract.tokenURI(tokenId)) as string;
			console.log("Gateway URL:", uri);
			cid = uri.split("/ipfs/")[1] ?? null;
			console.log("CID:", cid);
		} catch {
			console.log("Could not fetch tokenURI before burn");
		}

		const tx = await contract.revokeCert(tokenId);
		const receipt = await tx.wait();

		let unpinned = false; // ← must be declared here
		if (cid && jwt) {
			const unpinRes = await fetch(
				`https://api.pinata.cloud/pinning/unpin/${cid}`,
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${jwt}` },
				},
			);
			const unpinText = await unpinRes.text();
			console.log("Unpin status:", unpinRes.status);
			console.log("Unpin response:", unpinText);
			unpinned = unpinRes.ok;
		} else {
			console.log(
				"Skipped unpin — cid:",
				cid,
				"jwt:",
				jwt ? "present" : "MISSING",
			);
		}

		res.json({
			revoked: true,
			tokenId: tokenId.toString(),
			transactionHash: tx.hash,
			blockNumber: receipt?.blockNumber ?? null,
			unpinned,
		});
	} catch (error) {
		res.status(500).json({
			revoked: false,
			error: "Failed to revoke certificate.",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

app.listen(port, "0.0.0.0", () => {
	console.log(`Server listening on http://localhost:${port}`);
});
