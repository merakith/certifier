// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CertificateNFT is ERC721 {
    uint256 public nextTokenId;
    address public owner;

    struct Certificate {
        string name;
        string course;
        string issuer;
        string image;   
        uint256 issuedAt;
    }

    // TODO: store data offchain 
    // use ipfs
    // we are currently storing all data on chain
    mapping(uint256 => Certificate) public certificates;

    // modifiers are prechecks for functions
    modifier onlyOwner() {
        require(msg.sender == owner, "Only issuer");
        _; // run the actual function
    }

    constructor() ERC721("Certify", "CERT") {
        owner = msg.sender; // deployer becomes the owner
    }

    function uint2str(uint256 _i) internal pure returns (string memory str) {
        if (_i == 0) return "0";
        uint256 j = _i;
        uint256 length;
        while (j != 0) {
            length++;
            j /= 10;
        }
        bytes memory bstr = new bytes(length);
        uint256 k = length;
        while (_i != 0) {
            k--;
            bstr[k] = bytes1(uint8(48 + (_i % 10)));
            _i /= 10;
        }
        return string(bstr);
    }

    // external, part of ABI, onlyOwner modifier , allow only owner to mint
    function mint(address to, string memory name, string memory course, string memory issuer, string memory image) external onlyOwner {
        uint256 tokenId = nextTokenId++;

        _safeMint(to, tokenId);

        certificates[tokenId] = Certificate({
            name: name,
            course: course,
            issuer: issuer,
            image: image,
            issuedAt: block.timestamp
        });
    }


    // external, part of ABI, is automatically called by wallets
    // does not change blockchain state
    // overrides oppenzepplins tokenURI()
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");

        Certificate memory cert = certificates[tokenId];

        return string(
            abi.encodePacked(
                "data:application/json;utf8,{",
                    '"name":"Certificate - ', cert.name, '",',
                    '"description":"', cert.name, ' completed ', cert.course, ' issued by ', cert.issuer, '",',
                    '"image":"', cert.image, '",',
                    '"attributes":[',
                        '{"trait_type":"Course","value":"', cert.course, '"},',
                        '{"trait_type":"Issuer","value":"', cert.issuer, '"},',
                        '{"trait_type":"Issued On","value":"', uint2str(cert.issuedAt), '"}',
                    "]",
                "}"
            )
        );
    }

    function revokeCert(uint256 tokenId) external onlyOwner {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        _burn(tokenId);
    }

    // openzepplin calls this funtion 
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = super._update(to, tokenId, auth);

        // allow minting (from = 0) and burning (to = 0)
        if (from != address(0) && to != address(0)) {
            revert("This token is non-transferable");
        }

        return from;
    }
}