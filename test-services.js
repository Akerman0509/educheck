import { ethers } from 'ethers';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pathToFileURL } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const IpfsServicePath = join(__dirname, 'frontend', 'src', 'services', 'IpfsService.js');
const IpfsServiceURL = pathToFileURL(IpfsServicePath).href;
const { default: IpfsService } = await import(IpfsServiceURL);

async function testBlockchainService() {
  console.log('='.repeat(80));
  console.log('BLOCKCHAIN SERVICE TEST SUITE (Node.js Mode)');
  console.log('='.repeat(80));

  try {
    // initialize BlockchainService
    console.log('Initialize Contract Connection');
    const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
    
    // ABI, hardhat
    const abiPath = join(__dirname, 'smartcontract', 'ignition', 'deployments', 'chain-31337', 'artifacts', 'UniversityDegreesSBTModule#UniversityDegreesSBT.json');
    const contractJSON = JSON.parse(readFileSync(abiPath, 'utf8'));
    const contractABI = contractJSON.abi;
    
    const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
    const contract = new ethers.Contract(contractAddress, contractABI, provider);
    
    console.log('Contract connected successfully');

    // Get Contract Info
    console.log('Get Contract Info');
    try {
      const name = await contract.name();
      const symbol = await contract.symbol();
      console.log(`Contract name: ${name}`);
      console.log(`Contract symbol: ${symbol}`);
    } catch (err) {
      console.log(`Could not fetch contract info: ${err.message}`);
    }

    // Get Accounts
    console.log('Get Accounts from Hardhat Node');
    const accounts = await provider.listAccounts();
    const adminAddr = accounts[0].address;
    const ministryAddr = accounts[1].address;
    const universityAddr = accounts[2].address;
    const studentAddr = accounts[3].address;
    
    console.log(`Admin: ${adminAddr}`);
    console.log(`Ministry: ${ministryAddr}`);
    console.log(`University: ${universityAddr}`);
    console.log(`Student: ${studentAddr}`);

    // Get signers
    const adminSigner = await provider.getSigner(adminAddr);
    const ministrySigner = await provider.getSigner(ministryAddr);
    const universitySigner = await provider.getSigner(universityAddr);
    const studentSigner = await provider.getSigner(studentAddr);

    // Check Roles
    console.log('Check Initial Roles');
    try {
      const DEFAULT_ADMIN_ROLE = await contract.DEFAULT_ADMIN_ROLE();
      const MINISTRY_ROLE = await contract.MINISTRY_ROLE();
      const UNIVERSITY_ROLE = await contract.UNIVERSITY_ROLE();
      
      console.log(`DEFAULT_ADMIN_ROLE: ${DEFAULT_ADMIN_ROLE}`);
      console.log(`MINISTRY_ROLE: ${MINISTRY_ROLE}`);
      console.log(`UNIVERSITY_ROLE: ${UNIVERSITY_ROLE}`);
      
      const isAdmin = await contract.hasRole(DEFAULT_ADMIN_ROLE, adminAddr);
      console.log(`Admin has admin role: ${isAdmin}`);
    } catch (err) {
      console.log(`Role check failed: ${err.message}`);
    }

    // Grant Ministry Role
    console.log('Grant Ministry Role');
    try {
      const MINISTRY_ROLE = await contract.MINISTRY_ROLE();
      const contractWithAdmin = contract.connect(adminSigner);
      const tx = await contractWithAdmin.grantRole(MINISTRY_ROLE, ministryAddr);
      await tx.wait();
      console.log(`Ministry role granted to ${ministryAddr}`);
      console.log(`   Tx Hash: ${tx.hash}`);
    } catch (err) {
      console.log(`Failed to grant ministry role: ${err.message}`);
    }

    // Grant University Role
    console.log('Grant University Role');
    try {
      const UNIVERSITY_ROLE = await contract.UNIVERSITY_ROLE();
      const contractWithAdmin = contract.connect(adminSigner);
      const tx = await contractWithAdmin.grantRole(UNIVERSITY_ROLE, universityAddr);
      await tx.wait();
      console.log(`University role granted to ${universityAddr}`);
      console.log(`   Tx Hash: ${tx.hash}`);
    } catch (err) {
      console.log(`Failed to grant university role: ${err.message}`);
    }

    // IPFS File Upload
    console.log('IPFS File Upload');
    let degreeFileCID;
    try {
      await IpfsService.initialized;
      
      //mock PDF
      const mockPdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\n');

      const mockFile = {
        name: 'test-degree.pdf',
        type: 'application/pdf',
        arrayBuffer: async () => mockPdfContent,
        stream: () => mockPdfContent,
      };
      
      const fileUpload = await IpfsService.uploadDegreeFile(mockFile);
      degreeFileCID = fileUpload.cid;
      console.log(`File uploaded to IPFS`);
      console.log(`   CID: ${degreeFileCID}`);
      console.log(`   URL: ${fileUpload.url}`);
    } catch (err) {
      console.log(`IPFS file upload failed: ${err.message}`);
      degreeFileCID = 'QmMockFileCID123';
    }

    // IPFS Metadata Upload
    console.log('IPFS Metadata Upload');
    let metadataCID;
    try {
      const metadata = {
        degreeFileCID: degreeFileCID,
        universityName: 'Test University',
        degreeName: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        issueDate: new Date().toISOString(),
      };
      
      const metadataUpload = await IpfsService.uploadDegreeMetadata(metadata);
      metadataCID = metadataUpload.cid;
      console.log(`Metadata uploaded to IPFS`);
      console.log(`   CID: ${metadataCID}`);
      console.log(`   URL: ${metadataUpload.url}`);
    } catch (err) {
      console.log(`IPFS metadata upload failed: ${err.message}`);
      metadataCID = 'QmMockMetadataCID123';
    }

    // Mint Degree
    console.log('Mint Degree');
    let mintedTokenId;
    try {
      const contractWithUniversity = contract.connect(universitySigner);
      
      let tokenId;
      try {
        tokenId = await contractWithUniversity.mintDegree.staticCall(
          studentAddr,
          'Test University',
          'Bachelor of Science',
          'Computer Science',
          metadataCID
        );
        console.log(`   Preflight tokenId: ${tokenId}`);
      } catch (err) {
        console.log(`   Preflight check skipped: ${err.message}`);
      }
      
      // Mint transaction
      const tx = await contractWithUniversity.mintDegree(
        studentAddr,
        'Test University',
        'Bachelor of Science',
        'Computer Science',
        metadataCID
      );
      
      const receipt = await tx.wait();
      
      // Parse event
      const event = receipt.logs
        .map(log => {
          try { return contract.interface.parseLog(log); } catch { return null; }
        })
        .find(e => e?.name === 'DegreeIssued');
      
      mintedTokenId = event?.args?.tokenId?.toString() || tokenId?.toString();
      
      console.log(`Degree minted successfully`);
      console.log(`   TokenId: ${mintedTokenId}`);
      console.log(`   Tx Hash: ${tx.hash}`);
      console.log(`   Block: ${receipt.blockNumber}`);
    } catch (err) {
      console.log(`Mint degree failed: ${err.message}`);
    }

    // Get Student Degrees
    console.log('Get Student Degrees');
    try {
      const degrees = await contract.getDegreesOf(studentAddr);
      console.log(`Retrieved ${degrees.length} degree(s) for student`);
      
      degrees.forEach((deg, idx) => {
        console.log(`\n   Degree ${idx + 1}:`);
        console.log(`   - University: ${deg.universityName}`);
        console.log(`   - Degree: ${deg.degreeName}`);
        console.log(`   - Field: ${deg.fieldOfStudy}`);
        console.log(`   - Issued At: ${new Date(Number(deg.issuedAt) * 1000).toLocaleString()}`);
        console.log(`   - Issuer: ${deg.issuer}`);
        console.log(`   - Metadata URI: ${deg.metadataURI}`);
      });
    } catch (err) {
      console.log(`Failed to get student degrees: ${err.message}`);
    }

    // Get My Degrees (as student)
    console.log('Get My Degrees (as student)');
    try {
      const contractWithStudent = contract.connect(studentSigner);
      const myDegrees = await contractWithStudent.getMyDegrees();
      console.log(`Retrieved ${myDegrees.length} degree(s) for caller`);
      
      myDegrees.forEach((deg, idx) => {
        console.log(`\n   Degree ${idx + 1}:`);
        console.log(`   - University: ${deg.universityName}`);
        console.log(`   - Degree: ${deg.degreeName}`);
      });
    } catch (err) {
      console.log(`Failed to get my degrees: ${err.message}`);
    }

    // Get Token URI
    console.log('Get Token URI');
    if (mintedTokenId) {
      try {
        const tokenURI = await contract.tokenURI(mintedTokenId);
        console.log(`Token URI: ${tokenURI}`);
      } catch (err) {
        console.log(`Failed to get token URI: ${err.message}`);
      }
    } else {
      console.log(`Skip (no token minted in this session)`);
    }

    // Get Token Owner
    console.log('Get Token Owner');
    if (mintedTokenId) {
      try {
        const owner = await contract.ownerOf(mintedTokenId);
        console.log(`Token owner: ${owner}`);
        console.log(`   Matches student: ${owner.toLowerCase() === studentAddr.toLowerCase()}`);
      } catch (err) {
        console.log(`Failed to get token owner: ${err.message}`);
      }
    } else {
      console.log(`Skip (no token minted in this session)`);
    }

    // Fetch Metadata from IPFS
    console.log('Fetch Metadata from IPFS');
    if (metadataCID) {
      try {
        const url = `https://${process.env.GATEWAY_URL}/ipfs/${metadataCID}`;
        const response = await fetch(url);
        const metadata = await response.json();
        console.log(`Metadata fetched from IPFS`);
        console.log(`   Degree File CID: ${metadata.degreeFileCID}`);
        console.log(`   University: ${metadata.universityName}`);
        console.log(`   Degree: ${metadata.degreeName}`);
        console.log(`   Field: ${metadata.fieldOfStudy}`);
      } catch (err) {
        console.log(`Failed to fetch metadata: ${err.message}`);
      }
    } else {
      console.log(`Skip (no metadata uploaded in this session)`);
    }

  } catch (error) {
    console.error('\nFATAL ERROR:', error.message);
    console.error(error.stack);
  }
}

testBlockchainService().catch(console.error);
