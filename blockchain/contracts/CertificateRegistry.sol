// SPDX-License-Identifier: MIT License
pragma solidity ^0.8.24;

contract CertificateRegistry {
    address public immutable owner;
    mapping(bytes32 => address) public recipients;
    mapping(address => bool) private _validIssuers;
    address[] public validIssuers;

    struct Certificate {
        bytes32 hash;
        address issuer;
        bool isValid;
    }

    event CertificateIssued(
        address indexed issuer,
        bytes32 certificateHash,
        address indexed recipient
    );
    event IssuerApproved(address indexed issuer);
    event IssuerRevoked(address indexed issuer);

    constructor() {
        owner = msg.sender;
        approveIssuer(msg.sender);
    }

    modifier validIssuer() {
        require(_validIssuers[msg.sender], "Not a valid issuer!");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the owner!");
        _;
    }

    function approveIssuer(address issuer) public onlyOwner {
        require(issuer != address(0), "Zero address!");
        require(!_validIssuers[issuer], "Already approved!");
        _validIssuers[issuer] = true;
        validIssuers.push(issuer);
        emit IssuerApproved(issuer);
    }

    function revokeIssuer(address issuer) public onlyOwner {
        require(_validIssuers[issuer], "Not approved!");
        _validIssuers[issuer] = false;
        emit IssuerRevoked(issuer);
    }

    function issueCertificate(bytes32 certHash, address to) public validIssuer {
        require(to != address(0), "Zero address!");
        recipients[certHash] = to;
        emit CertificateIssued(msg.sender, certHash, to);
    }

    // function to check validity of certhash
    function verifyCertificate(bytes32 certHash, address to) public view returns (bool verified){
        return recipients[certHash] == to;
    }
}
