# UniversityDegreesSBT - ABI Reference

## Contract Info
- **Name:** UniversityDegreesSBT
- **Type:** ERC721 Soulbound Token (Non-transferable)
- **Solidity:** ^0.8.19

---

## Roles
```
MINISTRY_ROLE = keccak256("MINISTRY_ROLE")
UNIVERSITY_ROLE = keccak256("UNIVERSITY_ROLE")
```

---

## Structs

### Degree
```solidity
struct Degree {
    string universityName;
    string degreeName;
    string fieldOfStudy;
    string metadataURI;
    uint256 issuedAt;
    address issuer;
}
```

---

## Functions

### Ministry Functions

#### assignUniversity
```solidity
assignUniversity(address university) external
```
- **Type:** Write
- **Access:** MINISTRY_ROLE only
- **What:** Authorize a university to mint degrees
- **Emits:** `UniversityAssigned(ministry, university)`

---

#### revokeUniversity
```solidity
revokeUniversity(address university) external
```
- **Type:** Write
- **Access:** MINISTRY_ROLE only
- **What:** Remove university's minting permission
- **Emits:** `UniversityRevoked(ministry, university)`

---

#### createStateSnapshot
```solidity
createStateSnapshot() external
```
- **Type:** Write
- **Access:** MINISTRY_ROLE only
- **What:** Create backup snapshot of all degrees
- **Emits:** `StateSnapshot(snapshotId, totalDegrees, timestamp)`

---

### University Functions

#### mintDegree
```solidity
mintDegree(
    address to,
    string calldata universityName,
    string calldata degreeName,
    string calldata fieldOfStudy,
    string calldata metadataURI
) external returns (uint256)
```
- **Type:** Write
- **Access:** UNIVERSITY_ROLE only
- **Params:**
  - `to` - Student wallet address
  - `universityName` - University name
  - `degreeName` - Degree type (e.g., "B.Sc.")
  - `fieldOfStudy` - Major (e.g., "Computer Science")
  - `metadataURI` - IPFS link to metadata
- **Returns:** `uint256` - Token ID of new degree
- **What:** Issue a soulbound degree to student
- **Emits:** `DegreeIssued(tokenId, to, issuer)`

---

#### revokeDegree
```solidity
revokeDegree(uint256 tokenId) external
```
- **Type:** Write
- **Access:** MINISTRY_ROLE or issuing university
- **Params:**
  - `tokenId` - Degree token ID to revoke
- **What:** Burn/revoke a degree
- **Emits:** `DegreeRevoked(tokenId, student, revoker, timestamp)`

---

### Query Functions (Read-Only)

#### getDegreeIdsOf
```solidity
getDegreeIdsOf(address student) public view returns (uint256[])
```
- **Type:** Read
- **Access:** MINISTRY_ROLE, UNIVERSITY_ROLE, or student themselves
- **Params:**
  - `student` - Student wallet address
- **Returns:** `uint256[]` - Array of degree token IDs
- **What:** Get all degree IDs for a student

---

#### getDegreesOf
```solidity
getDegreesOf(address student) public view returns (Degree[])
```
- **Type:** Read
- **Access:** MINISTRY_ROLE, UNIVERSITY_ROLE, or student themselves
- **Params:**
  - `student` - Student wallet address
- **Returns:** `Degree[]` - Array of Degree structs
- **What:** Get full degree details for a student

---

#### getMyDegrees
```solidity
getMyDegrees() external view returns (Degree[])
```
- **Type:** Read
- **Access:** Anyone (returns caller's degrees)
- **Returns:** `Degree[]` - Array of caller's degrees
- **What:** Get your own degrees (convenience function)

---

#### tokenURI
```solidity
tokenURI(uint256 tokenId) public view returns (string)
```
- **Type:** Read
- **Access:** Anyone
- **Params:**
  - `tokenId` - Degree token ID
- **Returns:** `string` - Metadata URI
- **What:** Get metadata URI for a degree

---

#### supportsInterface
```solidity
supportsInterface(bytes4 interfaceId) public view returns (bool)
```
- **Type:** Read
- **Access:** Anyone
- **Params:**
  - `interfaceId` - Interface identifier
- **Returns:** `bool` - True if interface is supported
- **What:** ERC165 interface detection

---

### Disabled Functions (Soulbound)

#### approve
```solidity
approve(address, uint256) public pure
```
- **Type:** Disabled
- **What:** Reverts with "SBT: approval disabled"

---

#### setApprovalForAll
```solidity
setApprovalForAll(address, bool) public pure
```
- **Type:** Disabled
- **What:** Reverts with "SBT: approval disabled"

---

## Events

### UniversityAssigned
```solidity
event UniversityAssigned(
    address indexed ministry,
    address indexed university
)
```
**When:** Ministry authorizes a university

---

### UniversityRevoked
```solidity
event UniversityRevoked(
    address indexed ministry,
    address indexed university
)
```
**When:** Ministry removes university authorization

---

### DegreeIssued
```solidity
event DegreeIssued(
    uint256 indexed tokenId,
    address indexed to,
    address indexed issuer
)
```
**When:** University issues a degree

---

### DegreeRevoked
```solidity
event DegreeRevoked(
    uint256 indexed tokenId,
    address indexed student,
    address indexed revoker,
    uint256 revokedAt
)
```
**When:** Degree is revoked/burned

---

### StateSnapshot
```solidity
event StateSnapshot(
    uint256 indexed snapshotId,
    uint256 totalDegrees,
    uint256 timestamp
)
```
**When:** Ministry creates backup snapshot

---

## Quick Reference

| Function | Type | Access | Purpose |
|----------|------|--------|---------|
| `assignUniversity` | Write | Ministry | Add university |
| `revokeUniversity` | Write | Ministry | Remove university |
| `createStateSnapshot` | Write | Ministry | Create backup |
| `mintDegree` | Write | University | Issue degree |
| `revokeDegree` | Write | Ministry/Issuer | Revoke degree |
| `getDegreeIdsOf` | Read | Authorized | Get degree IDs |
| `getDegreesOf` | Read | Authorized | Get degree details |
| `getMyDegrees` | Read | Anyone | Get own degrees |
| `tokenURI` | Read | Anyone | Get metadata URI |
