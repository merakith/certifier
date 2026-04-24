// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.28;

contract CertificateRegistry {
    // maps certificate hash -> recipient wallet address
    mapping(bytes32 => address) public recipients;

    // list of all approved issuers
    address[] public validIssuers;

    // certificate type
    struct Certificate {
        bytes32 hash;
        address issuer;
        bool isValid;
    }

    // events
    event CertificateIssued(
        address indexed issuer,
        bytes32 certifcateHash,
        address indexed recipient
    );

    constructor() {
        // add the contract owner to list of valid issuers
        validIssuers.push(msg.sender);
    }

    modifier validIssuer() {
        address issuer = msg.sender;
        bool isApproved = false;
        for (uint256 i = 0; i < validIssuers.length; i++) {
            if (validIssuers[i] == issuer) {
                isApproved = true;
                break;
            }
        }
        require(isApproved, "Not a valid issuer!");
        _;
    }

    // function to issue a certHash to a recipient
    function issueCertificate(bytes32 certHash, address to) public validIssuer {
        recipients[certHash] = to;

        emit CertificateIssued(msg.sender, certHash, to);
    }
}
