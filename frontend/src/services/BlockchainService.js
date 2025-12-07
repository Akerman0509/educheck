import { ethers } from 'ethers';

//load .env variables
import dotenv from 'dotenv';
dotenv.config();

class BlockchainService {
  static instance = null;

  constructor() {
    if (BlockchainService.instance) {
      return BlockchainService.instance;
    }

    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.address = null;
    this.abi = null;
    this.roles = null;

    BlockchainService.instance = this;
  }

  async initialize(contractAddress, contractABI) {
    if (this.contract) return this; 
    if (!window.ethereum && typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask or Web3 provider not detected');
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);
    this.address = contractAddress;
    this.abi = contractABI;

    this.contract = new ethers.Contract(this.address, this.abi, this.provider);

    await this._fetchRoles();

    return this;
  }

  // Connect wallet and upgrade to signer
  async connectWallet() {
    if (!this.provider) throw new Error('BlockchainService not initialized');

    const accounts = await this.provider.send('eth_requestAccounts', []);
    if (accounts.length === 0) throw new Error('No account found');

    this.signer = await this.provider.getSigner();
    const userAddress = await this.signer.getAddress();

    // Upgrade contract with signer
    this.contract = new ethers.Contract(this.address, this.abi, this.signer);

    return userAddress;
  }

  // Get current signer address
  async getCurrentUser() {
    if (!this.signer) throw new Error('Wallet not connected');
    return await this.signer.getAddress();
  }

  // Private: fetch and cache roles
  async _fetchRoles() {
    if (this.roles) return this.roles;

    const [defaultAdmin, ministry, university] = await Promise.all([
      this.contract.DEFAULT_ADMIN_ROLE(),
      this.contract.MINISTRY_ROLE(),
      this.contract.UNIVERSITY_ROLE(),
    ]);

    this.roles = {
      DEFAULT_ADMIN_ROLE: defaultAdmin,
      MINISTRY_ROLE: ministry,
      UNIVERSITY_ROLE: university,
    };

    return this.roles;
  }

  // Grant MINISTRY_ROLE (admin only)
  async grantMinistryRole(ministryAddress) {
    await this._ensureSigner();
    const { MINISTRY_ROLE } = await this._fetchRoles();
    const tx = await this.contract.grantRole(MINISTRY_ROLE, ministryAddress);
    return await tx.wait();
  }

  // Assign university (ministry only)
  async assignUniversity(universityAddress) {
    await this._ensureSigner();
    try {
      const tx = await this.contract.assignUniversity(universityAddress);
      return await tx.wait();
    } catch (err) {
      console.error('assignUniversity failed:', err.message || err);
      try {
        await this.contract.estimateGas.assignUniversity(universityAddress);
      } catch (estimateErr) {
        console.error('estimateGas also failed:', estimateErr.message);
      }
      throw err;
    }
  }

  // Grant UNIVERSITY_ROLE directly (admin fallback)
  async grantUniversityRole(universityAddress) {
    await this._ensureSigner();
    const { UNIVERSITY_ROLE } = await this._fetchRoles();
    const tx = await this.contract.grantRole(UNIVERSITY_ROLE, universityAddress);
    return await tx.wait();
  }

  // Mint degree SBT with IPFS metadata

  async mintDegree(studentAddress, universityName, degreeName, fieldOfStudy, metadataURI = '') {
    await this._ensureSigner();

    let tokenId;
    try {
      tokenId = await this.contract.callStatic.mintDegree(
        studentAddress,
        universityName,
        degreeName,
        fieldOfStudy,
        metadataURI
      );
    } catch (err) {
      console.warn('callStatic failed (normal if revert expected):', err.message);
    }

    const tx = await this.contract.mintDegree(
      studentAddress,
      universityName,
      degreeName,
      fieldOfStudy,
      metadataURI
    );

    const receipt = await tx.wait();

    const event = receipt.logs
      .map(log => {
        try { return this.contract.interface.parseLog(log); } catch { return null; }
      })
      .find(e => e?.name === 'DegreeIssued');

    const finalTokenId = event?.args?.tokenId?.toString() || tokenId?.toString();
    if (!finalTokenId) {
      throw new Error('mintDegree: tokenId not found in event or callStatic');
    }

    return {
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      tokenId: finalTokenId,
      event,
    };
  }

  // Get all degrees of a student
  async getStudentDegrees(studentAddress) {
    const degrees = await this.contract.getDegreesOf(studentAddress);
    return degrees.map(d => ({
      universityName: d.universityName,
      degreeName: d.degreeName,
      fieldOfStudy: d.fieldOfStudy,
      metadataURI: d.metadataURI,
      issuedAt: Number(d.issuedAt) * 1000,
      issuer: d.issuer,
    }));
  }

  async getMyDegrees() {
    await this._ensureSigner();
    const degrees = await this.contract.getMyDegrees();
    return degrees.map(d => ({
      universityName: d.universityName,
      degreeName: d.degreeName,
      fieldOfStudy: d.fieldOfStudy,
      metadataURI: d.metadataURI,
      issuedAt: Number(d.issuedAt) * 1000,
      issuer: d.issuer,
    }));
  }

  async hasRole(roleName, address) {
    const { MINISTRY_ROLE, UNIVERSITY_ROLE, DEFAULT_ADMIN_ROLE } = await this._fetchRoles();
    let role;
    if (roleName === 'ministry') role = MINISTRY_ROLE;
    else if (roleName === 'university') role = UNIVERSITY_ROLE;
    else if (roleName === 'admin') role = DEFAULT_ADMIN_ROLE;
    else throw new Error(`Unknown role: ${roleName}`);
    return await this.contract.hasRole(role, address);
  }

  async revokeDegree(tokenId) {
    await this._ensureSigner();
    const tx = await this.contract.revokeDegree(tokenId);
    return await tx.wait();
  }

  async getContractInfo() {
    const [name, symbol] = await Promise.all([
      this.contract.name(),
      this.contract.symbol(),
    ]);
    return { name, symbol };
  }

  async getTokenURI(tokenId) {
    return await this.contract.tokenURI(tokenId);
  }

  async getOwnerOf(tokenId) {
    return await this.contract.ownerOf(tokenId);
  }

  // Private helpers
  async _ensureSigner() {
    if (!this.signer) {
      throw new Error('Wallet not connected. Call connectWallet() first.');
    }
  }
  
  // Fetch full metadata from IPFS URI (handles ipfs:// and https:// URLs)
  async fetchMetadataFromURI(metadataURI) {
    try {
      let url = `https://${process.env.GATEWAY_URL}/ipfs/` + metadataURI;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }
      const metadata = await response.json();
      return metadata; // return full metadata object {degreeFileCID, universityName, ...}
    } catch (error) {
      console.error('Error fetching metadata from URI:', error);
      throw error;
    }
  }

  // Helper: get degree file CID from metadata
  async getDegreeFileCID(metadataURI) {
    try {
      const metadata = await this.fetchMetadataFromURI(metadataURI);
      return metadata.degreeFileCID || null;
    } catch (error) {
      console.error('Error getting degree file CID:', error);
      return null;
    }
  }

}

export default new BlockchainService();


