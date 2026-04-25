// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CertificateNFT is ERC721 {
    uint256 public nextTokenId;
    address public owner;

    // ─── Events ──────────────────────────────────────────────────────────────
    // All three fields indexed so The Graph (and queryFilter) can filter
    // by recipient wallet, tokenId, or both.
    event CertificateMinted(
        address indexed to,
        uint256 indexed tokenId,
        string          ipfsURI    // not indexed — strings can't be indexed
    );

    event CertificateRevoked(
        uint256 indexed tokenId
    );

    // ─── Storage ──────────────────────────────────────────────────────────────
    // All cert metadata lives in the IPFS JSON blob.
    // On-chain we only keep the gateway URI + timestamp (cheap).
    struct Certificate {
        string  ipfsURI;    // "ipfs://Qm..."
        uint256 issuedAt;
    }

    mapping(uint256 => Certificate) public certificates;

    // ─── Modifiers ────────────────────────────────────────────────────────────
    modifier onlyOwner() {
        require(msg.sender == owner, "Only issuer");
        _;
    }

    // ─── Constructor ──────────────────────────────────────────────────────────
    constructor() ERC721("Certify", "CERT") {
        owner = msg.sender;
    }

    // ─── Mint ─────────────────────────────────────────────────────────────────
    // Backend pins metadata JSON to IPFS, gets back a CID,
    // then calls mint(recipientWallet, "ipfs://Qm...")
    function mint(
        address to,
        string memory ipfsURI
    ) external onlyOwner returns (uint256 tokenId) {
        require(bytes(ipfsURI).length > 0, "URI required");

        tokenId = nextTokenId++;
        _safeMint(to, tokenId);

        certificates[tokenId] = Certificate({
            ipfsURI:  ipfsURI,
            issuedAt: block.timestamp
        });

        // The Graph indexes this event to answer:
        // "give me all certs for wallet 0xABC..."
        emit CertificateMinted(to, tokenId, ipfsURI);
        return tokenId;
    }

    // ─── tokenURI ─────────────────────────────────────────────────────────────
    // Strips "ipfs://" prefix and returns a Pinata HTTPS gateway URL.
    // Wallets + marketplaces call this automatically.
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(ownerOf(tokenId) != address(0), "Token does not exist");

        bytes memory raw = bytes(certificates[tokenId].ipfsURI);
        require(raw.length > 7, "Invalid URI");

        // Slice off "ipfs://" (7 chars) to get the bare CID
        bytes memory cid = new bytes(raw.length - 7);
        for (uint256 i = 7; i < raw.length; i++) {
            cid[i - 7] = raw[i];
        }

        return string(abi.encodePacked(
            "https://gateway.pinata.cloud/ipfs/",
            string(cid)
        ));
    }

    // ─── Revoke ───────────────────────────────────────────────────────────────
    // Burns the token. The Graph mapping handles this event
    // to mark the cert as revoked in the subgraph.
    function revokeCert(uint256 tokenId) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        _burn(tokenId);
        emit CertificateRevoked(tokenId);
    }

    // ─── Non-transferable ─────────────────────────────────────────────────────
    // Allows mint (from == 0) and burn (to == 0) only.
    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address) {
        address from = super._update(to, tokenId, auth);
        if (from != address(0) && to != address(0)) {
            revert("This token is non-transferable");
        }
        return from;
    }
}