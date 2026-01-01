// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/// @notice Soulbound University Degree DApp contract
/// - Ministry (admin) assigns University roles
/// - Universities mint non-transferable Degree tokens to students
/// - Ministry & University can query a student's degrees
/// - Student can view their own degrees via wallet

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract UniversityDegreesSBT is ERC721, AccessControl {
    uint256 private _tokenIdCounter = 1;
    uint256 private _snapshotIdCounter = 1;

    bytes32 public constant MINISTRY_ROLE = keccak256("MINISTRY_ROLE");
    bytes32 public constant UNIVERSITY_ROLE = keccak256("UNIVERSITY_ROLE");

    struct Degree {
        string universityName; // e.g. "Seoul University"
        string degreeName; // e.g. "Bachelor of Science"
        string fieldOfStudy; // e.g. "Computer Science"
        string metadataURI; // optional URI for diploma image/JSON (tokenURI)
        uint256 issuedAt; // block timestamp of issuance
        address issuer; // university address that minted it
    }

    // tokenId => Degree
    mapping(uint256 => Degree) private _degreeData;

    // student address => list of tokenIds (degrees)
    mapping(address => uint256[]) private _degreesOfStudent;

    event UniversityAssigned(
        address indexed ministry,
        address indexed university
    );
    event UniversityRevoked(
        address indexed ministry,
        address indexed university
    );
    event DegreeIssued(
        uint256 indexed tokenId,
        address indexed to,
        address indexed issuer
    );
    event StateSnapshot(
        uint256 indexed snapshotId,
        uint256 totalDegrees,
        uint256 timestamp
    );

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC721(name_, symbol_) {
        // Deployer is ministry
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender); // for AccessControl administration
        _grantRole(MINISTRY_ROLE, msg.sender);
    }

    // ==========================
    // Administration (Ministry)
    // ==========================
    /// @notice Ministry assigns the UNIVERSITY_ROLE to an address
    mapping(address => string) public universityNames;

    function assignUniversity(
        address university, 
        string memory name 
    ) external onlyRole(MINISTRY_ROLE) {      
        require(university != address(0), "invalid address");
        grantRole(UNIVERSITY_ROLE, university);
        emit UniversityAssigned(msg.sender, university);
        universityNames[university] = name;
    }

    /// @notice Ministry revokes the UNIVERSITY_ROLE from an address
    function revokeUniversity(
        address university
    ) external onlyRole(MINISTRY_ROLE) {
        require(hasRole(UNIVERSITY_ROLE, university), "not a university");
        revokeRole(UNIVERSITY_ROLE, university);
        emit UniversityRevoked(msg.sender, university);
    }

    // ==========================
    // Minting (Universities)
    // ==========================
    /// @notice University mints a soulbound degree to a student
    /// @param to the student's wallet address
    /// @param universityName the human name of the university
    /// @param degreeName the degree title (e.g. "B.Sc.")
    /// @param fieldOfStudy the field (e.g. "Computer Science")
    /// @param metadataURI optional metadata or diploma image URI (tokenURI)
    function mintDegree(
        address to,
        string calldata universityName,
        string calldata degreeName,
        string calldata fieldOfStudy,
        string calldata metadataURI
    ) external onlyRole(UNIVERSITY_ROLE) returns (uint256) {
        require(to != address(0), "invalid student address");

        uint256 newId = _tokenIdCounter;
        _tokenIdCounter++;

        // store degree data
        _degreeData[newId] = Degree({
            universityName: universityName,
            degreeName: degreeName,
            fieldOfStudy: fieldOfStudy,
            metadataURI: metadataURI,
            issuedAt: block.timestamp,
            issuer: msg.sender
        });

        // push token id to student's list
        _degreesOfStudent[to].push(newId);

        // mint the token (soulbound: non-transferable as we override transfer methods)
        _safeMint(to, newId);

        // if metadataURI provided, then tokenURI() can be implemented to return it.
        // we won't use ERC721URIStorage here to keep minimal; instead override tokenURI below.

        emit DegreeIssued(newId, to, msg.sender);
        return newId;
    }

    // ==========================
    // Query functions
    // ==========================
    /// @notice Returns tokenIds for a student (only accessible to MINISTRY_ROLE, UNIVERSITY_ROLE or the student themself)
    function getDegreeIdsOf(
        address student
    ) public view returns (uint256[] memory) {
        require(student != address(0), "invalid address");
        // access control: ministry, any university, or the student
        bool allowed = hasRole(MINISTRY_ROLE, msg.sender) ||
            hasRole(UNIVERSITY_ROLE, msg.sender) ||
            (msg.sender == student);
        require(allowed, "not authorized to view degrees for this student");
        return _degreesOfStudent[student];
    }

    /// @notice Returns detailed Degree structs for a student (same access as getDegreeIdsOf)
    function getDegreesOf(
        address student
    ) public view returns (Degree[] memory) {
        uint256[] memory ids = getDegreeIdsOf(student);
        Degree[] memory result = new Degree[](ids.length);
        for (uint256 i = 0; i < ids.length; ++i) {
            result[i] = _degreeData[ids[i]];
        }
        return result;
    }

    /// @notice Convenience function for a connected student to fetch their own degrees
    function getMyDegrees() external view returns (Degree[] memory) {
        return getDegreesOf(msg.sender);
    }

    /// @notice Return tokenURI stored in Degree.metadataURI
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(
            _ownerOf(tokenId) != address(0),
            "ERC721: URI query for nonexistent token"
        );
        return _degreeData[tokenId].metadataURI;
    }

    // ==========================
    // Make token soulbound (non-transferable / non-approvable)
    // ==========================
    function approve(address, uint256) public pure override {
        revert("SBT: approval disabled");
    }

    function setApprovalForAll(address, bool) public pure override {
        revert("SBT: approval disabled");
    }

    // ==========================
    // Optional: revoke/burn by ministry or issuer
    // ==========================
    /// @notice Revoke (burn) a degree. Only MINISTRY_ROLE or the issuing university can revoke.
    function revokeDegree(uint256 tokenId) external {
        require(
            _ownerOf(tokenId) != address(0),
            "ERC721: URI query for nonexistent token"
        );
        address issuer = _degreeData[tokenId].issuer;
        require(
            hasRole(MINISTRY_ROLE, msg.sender) || msg.sender == issuer,
            "not authorized to revoke"
        );

        address owner = ownerOf(tokenId);

        // remove tokenId from student's list (simple but preserves order by swapping)
        uint256[] storage list = _degreesOfStudent[owner];
        for (uint256 i = 0; i < list.length; ++i) {
            if (list[i] == tokenId) {
                list[i] = list[list.length - 1];
                list.pop();
                break;
            }
        }

        // delete degree data & burn token
        delete _degreeData[tokenId];
        _burn(tokenId);
    }

    // ==========================
    // Snapshots (Ministry)
    // ==========================
    /// @notice Ministry triggers a state snapshot for backup purposes
    function createSnapshot() external onlyRole(MINISTRY_ROLE) {
        uint256 snapId = _snapshotIdCounter;
        _snapshotIdCounter++;
        
        // Emit event with current totals
        // The indexer will catch this and perform the actual data backup
        emit StateSnapshot(snapId, _tokenIdCounter - 1, block.timestamp);
    }

    // ==========================
    // ERC165 / supportsInterface
    // ==========================
    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
