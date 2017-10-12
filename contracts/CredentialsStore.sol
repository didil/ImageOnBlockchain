pragma solidity ^0.4.11;


contract CredentialsStore {
    struct Credential {
    address sender;
    bytes32 issuer;
    bytes32 recipient;
    bytes32 status;
    bytes imageHash;
    }

    mapping (bytes32 => uint[]) public credentialIdsByStatus;

    mapping (uint => Credential) public credentials;

    address public owner;

    uint public lastCredentialId;

    event NewCredentialStored(address indexed _sender, uint _credentialId);

    function CredentialsStore() public {
        owner = msg.sender;
        lastCredentialId = 0;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    // save the Credential
    function save(bytes32 issuer, bytes32 recipient, bytes32 status, bytes imageHash) public {
        // check status not null, important for indexation later
        require(status[0] != 0);

        uint credentialId = ++lastCredentialId;

        // add credential to the credentials mapping
        credentials[credentialId].sender = msg.sender;
        credentials[credentialId].issuer = issuer;
        credentials[credentialId].recipient = recipient;
        credentials[credentialId].status = status;
        credentials[credentialId].imageHash = imageHash;

        // index credential by status
        credentialIdsByStatus[status].push(credentialId);

        NewCredentialStored(credentials[credentialId].sender, credentialId);
    }

    // find a credential by id
    function find(uint credentialId) constant public returns (bytes32 issuer, bytes32 recipient, bytes32 status, bytes imageHash) {
        var credential = credentials[credentialId];
        return (credential.issuer, credential.recipient, credential.status, credential.imageHash);
    }

    // get number of credentials in a status
    function getCredentialsByStatusCount(bytes32 status) constant public returns (uint count) {
        return credentialIdsByStatus[status].length;
    }

    // get credential by status
    function getCredentialIdByStatus(bytes32 status, uint i) constant public returns (uint credentialId) {
        return credentialIdsByStatus[status][i];
    }
}
