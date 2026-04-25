import express from "express";

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

app.use(express.json());

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

	try {
		// TODO: contract invocation from ../blockchain:
		// mint(to, name, course, issuer, image)

		response.status(202).json({
			status: "accepted",
			message: "Certificate issuance request accepted.",
			data: { to, name, course, issuer, image },
		});
	} catch (error) {
		response.status(500).json({
			error: "Failed to issue certificate",
			details: error instanceof Error ? error.message : "Unknown error",
		});
	}
});

app.listen(port, () => {
	console.log(`Server listening on http://localhost:${port}`);
});
