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
	image: string;
};

type BulkIssueCertificateResult = {
	rowNumber: number;
	to: string;
	name: string;
	course: string;
	issuer: string;
	image: string;
	status: "submitted" | "failed";
	tokenId: string | null;
	transactionHash: string | null;
	error: string | null;
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

const BULK_MINT_COLUMNS = ["to", "name", "course", "issuer", "image"] as const;
const MAX_BULK_MINT_ROWS = 500;

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

const parseCsvValue = (value: string): string => {
	if (value.startsWith('"') && value.endsWith('"')) {
		return value.slice(1, -1).replace(/""/g, '"');
	}

	return value;
};

const parseCsvText = (csvText: string): Array<Array<string>> => {
	const rows: Array<Array<string>> = [];
	let currentRow: Array<string> = [];
	let currentValue = "";
	let inQuotes = false;

	for (let index = 0; index < csvText.length; index += 1) {
		const character = csvText[index];
		const nextCharacter = csvText[index + 1];

		if (inQuotes) {
			if (character === '"' && nextCharacter === '"') {
				currentValue += '"';
				index += 1;
				continue;
			}

			if (character === '"') {
				inQuotes = false;
				continue;
			}

			currentValue += character;
			continue;
		}

		if (character === '"') {
			inQuotes = true;
			continue;
		}

		if (character === ",") {
			currentRow.push(parseCsvValue(currentValue.trim()));
			currentValue = "";
			continue;
		}

		if (character === "\n") {
			currentRow.push(parseCsvValue(currentValue.trim()));
			rows.push(currentRow);
			currentRow = [];
			currentValue = "";
			continue;
		}

		if (character === "\r") {
			continue;
		}

		currentValue += character;
	}

	if (inQuotes) {
		throw new Error("Unterminated quoted value in CSV.");
	}

	if (currentValue.length > 0 || currentRow.length > 0) {
		currentRow.push(parseCsvValue(currentValue.trim()));
		rows.push(currentRow);
	}

	return rows.filter((row) => row.some((value) => value.trim().length > 0));
};

const parseBulkMintCsv = (csvText: string): Array<IssueCertificateRequest> => {
	const normalizedCsv = csvText.replace(/^\uFEFF/, "").trim();

	if (!normalizedCsv) {
		throw new Error("CSV payload is empty.");
	}

	const rows = parseCsvText(normalizedCsv);

	if (rows.length < 2) {
		throw new Error("CSV must include a header row and at least one data row.");
	}

	const header = rows[0].map((value) => value.trim().toLowerCase());
	const headerIndex = new Map<string, number>();

	header.forEach((columnName, index) => {
		headerIndex.set(columnName, index);
	});

	for (const requiredColumn of BULK_MINT_COLUMNS) {
		if (!headerIndex.has(requiredColumn)) {
			throw new Error(`CSV is missing required column: ${requiredColumn}`);
		}
	}

	const dataRows = rows.slice(1);

	if (dataRows.length > MAX_BULK_MINT_ROWS) {
		throw new Error(`CSV exceeds the maximum supported rows of ${MAX_BULK_MINT_ROWS}.`);
	}

	return dataRows.map((row) => ({
		to: row[headerIndex.get("to") ?? -1] ?? "",
		name: row[headerIndex.get("name") ?? -1] ?? "",
		course: row[headerIndex.get("course") ?? -1] ?? "",
		issuer: row[headerIndex.get("issuer") ?? -1] ?? "",
		image: row[headerIndex.get("image") ?? -1] ?? "",
	}));
};

const extractMintTokenIdFromReceipt = (
	receipt: { logs: Array<{ address: string; topics: readonly string[]; data: string }> } | null,
	contract: Contract,
	contractAddress: string,
): string | null => {
	if (!receipt) {
		return null;
	}

	for (const log of receipt.logs) {
		if (log.address.toLowerCase() !== contractAddress.toLowerCase()) {
			continue;
		}

		try {
			const parsedLog = contract.interface.parseLog(log);

			if (parsedLog?.name === "Transfer" && parsedLog.args.from === "0x0000000000000000000000000000000000000000") {
				return parsedLog.args.tokenId.toString();
			}
		} catch {
			continue;
		}
	}

	return null;
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

const getMintContract = async () => {
	const config = getContractConfig();

	if (!config) {
		return null;
	}

	const privateKey = getMintSignerPrivateKey();

	if (!privateKey) {
		return null;
	}

	const provider = new JsonRpcProvider(config.rpcUrl);
	const signer = new Wallet(privateKey, provider);
	const contract = new Contract(config.contractAddress, CERTIFICATE_NFT_ABI, signer);

	return { config, contract, provider, signer };
};

const getNextMintNonce = async (provider: JsonRpcProvider, signer: Wallet): Promise<number> => {
	const address = await signer.getAddress();
	return provider.getTransactionCount(address, "pending");
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

	const mintContext = await getMintContract();

	if (!mintContext) {
		response.status(500).json({
			error: "Missing blockchain config or OWNER_PRIVATE_KEY. Set RPC_URL, CONTRACT_ADDRESS, and OWNER_PRIVATE_KEY.",
		});
		return;
	}

	try {
		const tx = await mintContext.contract.mint(to, name, course, issuer, image);
		const receipt = await tx.wait();
		const tokenId = extractMintTokenIdFromReceipt(receipt, mintContext.contract, mintContext.config.contractAddress);

		response.status(202).json({
			status: "submitted",
			message: "Certificate mint transaction submitted.",
			transactionHash: tx.hash,
			blockNumber: receipt?.blockNumber ?? null,
			tokenId,
			data: { to, name, course, issuer, image },
		});
	} catch (error) {
		response.status(500).json({
			error: "Failed to issue certificate",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

app.post("/api/bulk-mint", express.text({ type: ["text/csv", "text/plain"], limit: "2mb" }), async (request, response) => {
	const csvText = typeof request.body === "string" ? request.body : "";

	if (!csvText.trim()) {
		response.status(400).json({
			error: "CSV payload is required in the request body.",
		});
		return;
	}

	let rows: Array<IssueCertificateRequest>;

	try {
		rows = parseBulkMintCsv(csvText);
	} catch (error) {
		response.status(400).json({
			error: "Invalid CSV payload.",
			details: error instanceof Error ? error.message : "Unknown error",
		});
		return;
	}

	const mintContext = await getMintContract();

	if (!mintContext) {
		response.status(500).json({
			error: "Missing blockchain config or OWNER_PRIVATE_KEY. Set RPC_URL, CONTRACT_ADDRESS, and OWNER_PRIVATE_KEY.",
		});
		return;
	}

	const results: Array<BulkIssueCertificateResult> = [];
	let nextNonce = await getNextMintNonce(mintContext.provider, mintContext.signer);

	for (let index = 0; index < rows.length; index += 1) {
		const row = rows[index];
		const rowNumber = index + 2;

		if (
			!isNonEmptyString(row.to) ||
			!isAddress(row.to) ||
			!isNonEmptyString(row.name) ||
			!isNonEmptyString(row.course) ||
			!isNonEmptyString(row.issuer) ||
			!isNonEmptyString(row.image)
		) {
			results.push({
				rowNumber,
				...row,
				status: "failed",
				tokenId: null,
				transactionHash: null,
				error:
					"Invalid row. Expected non-empty strings for to, name, course, issuer, image and a valid EVM address for to.",
			});
			continue;
		}

		try {
			const tx = await mintContext.contract.mint(row.to, row.name, row.course, row.issuer, row.image, {
				nonce: nextNonce,
			});
			nextNonce += 1;
			const receipt = await tx.wait();
			const tokenId = extractMintTokenIdFromReceipt(receipt, mintContext.contract, mintContext.config.contractAddress);

			results.push({
				rowNumber,
				...row,
				status: "submitted",
				tokenId,
				transactionHash: tx.hash,
				error: null,
			});
		} catch (error) {
			results.push({
				rowNumber,
				...row,
				status: "failed",
				tokenId: null,
				transactionHash: null,
				error: error instanceof Error ? error.message : "Unknown error",
			});
		}
	}

	response.status(200).json({
		status: "completed",
		message: "Bulk mint batch processed.",
		totalRows: rows.length,
		submitted: results.filter((result) => result.status === "submitted").length,
		failed: results.filter((result) => result.status === "failed").length,
		results,
	});
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
