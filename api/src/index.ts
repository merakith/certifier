import "dotenv/config";
import express from "express";
import { Contract, JsonRpcProvider, Wallet } from "ethers";

const app = express();
const port = Number(process.env.PORT) || 800;

type IssueCertificateRequest = {
	to: string;
	name: string;
	course: string;
	issuer: string;
	image: string;
};

const isNonEmptyString = (value: unknown): value is string => {
	return typeof value === "string" && value.trim().length > 0;
};

const isAddress = (value: string): boolean => {
	return /^0x[a-fA-F0-9]{40}$/.test(value);
};

const CERTIFICATE_NFT_ABI = [
	"function mint(address to, string name, string course, string issuer, string image) external returns (uint256)",
	"function tokenURI(uint256 tokenId) view returns (string)",
	"function revokeCert(uint256 tokenId) external",
	"event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
];

const parseTokenId = (value: string): bigint | null => {
	if (!/^\d+$/.test(value)) {
		return null;
	}

	const tokenId = BigInt(value);
	return tokenId >= 0n ? tokenId : null;
};

const parseCertificateMetadata = (tokenUri: string): Record<string, unknown> | null => {
	const prefix = "data:application/json;utf8,";

	if (!tokenUri.startsWith(prefix)) {
		return null;
	}

	const jsonPart = tokenUri.slice(prefix.length);

	try {
		return JSON.parse(jsonPart) as Record<string, unknown>;
	} catch {
		return null;
	}
};

const getContractConfig = (): { rpcUrl: string; contractAddress: string } | null => {
	const rpcUrl = process.env.RPC_URL;
	const contractAddress = process.env.CONTRACT_ADDRESS;

	if (!rpcUrl || !contractAddress || !isAddress(contractAddress)) {
		return null;
	}

	return { rpcUrl, contractAddress };
};

const getMintSignerPrivateKey = (): string | null => {
	const privateKey = process.env.OWNER_PRIVATE_KEY;
	if (!privateKey || privateKey.trim().length === 0) {
		return null;
	}

	return privateKey;
};

app.use(express.json());
app.use(express.static("public"));

app.get("/health", (_request, response) => {
	response.json({ status: "ok" });
});

app.post("/api/mint", async (request, response) => {
	const { to, name, course, issuer, image } = request.body as Partial<IssueCertificateRequest>;

	if (
		!isNonEmptyString(to) ||
		!isAddress(to) ||
		!isNonEmptyString(name) ||
		!isNonEmptyString(course) ||
		!isNonEmptyString(issuer) ||
		!isNonEmptyString(image)
	) {
		response.status(400).json({
			error:
				"Invalid payload. Expected non-empty strings for to, name, course, issuer, image and a valid EVM address for to.",
		});
		return;
	}

	const config = getContractConfig();

	if (!config) {
		response.status(500).json({
			error: "Missing blockchain config. Set RPC_URL and CONTRACT_ADDRESS environment variables.",
		});
		return;
	}

	try {
		const provider = new JsonRpcProvider(config.rpcUrl);
		const privateKey = getMintSignerPrivateKey();

		if (!privateKey) {
			response.status(500).json({
				error: "Missing OWNER_PRIVATE_KEY for mint transaction signing.",
			});
			return;
		}

		const signer = new Wallet(privateKey, provider);
		const contract = new Contract(config.contractAddress, CERTIFICATE_NFT_ABI, signer);

		const tx = await contract.mint(to, name, course, issuer, image);
		const receipt = await tx.wait();

		let tokenId: string | null = null;

		if (receipt) {
			for (const log of receipt.logs) {
				if (log.address.toLowerCase() !== config.contractAddress.toLowerCase()) {
					continue;
				}

				try {
					const parsedLog = contract.interface.parseLog(log);

					if (parsedLog?.name === "Transfer" && parsedLog.args.from === "0x0000000000000000000000000000000000000000") {
						tokenId = parsedLog.args.tokenId.toString();
						break;
					}
				} catch {
					continue;
				}
			}
		}

		response.status(202).json({
			status: "submitted",
			message: "Certificate mint transaction submitted.",
			transactionHash: tx.hash,
			blockNumber: receipt?.blockNumber ?? null,
			tokenId: tokenId,
			data: { to, name, course, issuer, image },
		});
	} catch (error) {
		response.status(500).json({
			error: "Failed to issue certificate",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

app.get("/api/verify/:tokenId", async (request, response) => {
	const tokenId = parseTokenId(request.params.tokenId);

	if (tokenId === null) {
		response.status(400).json({
			error: "Invalid tokenId. Expected a non-negative integer.",
		});
		return;
	}

	const config = getContractConfig();

	if (!config) {
		response.status(500).json({
			error: "Missing blockchain config. Set RPC_URL and CONTRACT_ADDRESS environment variables.",
		});
		return;
	}

	try {
		const provider = new JsonRpcProvider(config.rpcUrl);
		const contract = new Contract(config.contractAddress, CERTIFICATE_NFT_ABI, provider);

		const tokenUri = (await contract.tokenURI(tokenId)) as string;
		const metadata = parseCertificateMetadata(tokenUri);

		response.json({
			verified: true,
			tokenId: tokenId.toString(),
			tokenUri,
			metadata,
		});
	} catch (error) {
		response.status(404).json({
			verified: false,
			error: "Token could not be verified on-chain",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

app.get("/api/revoke/:tokenId", async (request, response) => {
	const tokenId = parseTokenId(request.params.tokenId);

	if (tokenId === null) {
		response.status(400).json({
			error: "Invalid tokenId. Expected a non-negative integer.",
		});
		return;
	}

	const config = getContractConfig();

	if (!config) {
		response.status(500).json({
			error: "Missing blockchain config. Set RPC_URL and CONTRACT_ADDRESS environment variables.",
		});
		return;
	}

	try {
		const privateKey = getMintSignerPrivateKey();

		if (!privateKey) {
			response.status(500).json({
				error: "Missing OWNER_PRIVATE_KEY for mint transaction signing.",
			});
			return;
		}

		const provider = new JsonRpcProvider(config.rpcUrl);
		const signer = new Wallet(privateKey, provider);
		const contract = new Contract(config.contractAddress, CERTIFICATE_NFT_ABI, signer);

		await contract.revokeCert(tokenId);

		response.json({
			burned: true,
			tokenId: tokenId.toString()
		});
	} catch (error) {
		response.status(404).json({
			burned: false,
			error: "Token could not be burned on-chain, maybe it doesn't exist.",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

app.listen(port, '0.0.0.0', () => {
	console.log(`Server listening on http://localhost:${port}`);
});
