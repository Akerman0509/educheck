const { handleDegreeIssued, handleDegreeRevoked, handleStateSnapshot } = require("../../src/services/indexer.service");
const Degree = require("../../src/models/Degree.schema");
const Snapshot = require("../../src/models/StateSnapshot.schema");

// Mock dependencies
jest.mock("ethers");
jest.mock("@pinata/sdk", () => {
    return jest.fn().mockImplementation(() => ({
        pinJSONToIPFS: jest.fn().mockResolvedValue({ IpfsHash: "QmMockSnapshotHash" })
    }));
});
jest.mock("../../src/models/Degree.schema");
jest.mock("../../src/models/StateSnapshot.schema");
jest.mock("../../src/models/SyncStatus.schema");

// Mock fetch for IPFS metadata
global.fetch = jest.fn(() =>
    Promise.resolve({
        json: () => Promise.resolve({ 
            universityName: "Test University", 
            degreeName: "B.Sc.", 
            fieldOfStudy: "Computer Science" 
        }),
    })
);

describe("Indexer Service Unit Tests", () => {
    
    // Setup & Teardown
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.RPC_URL = "http://localhost:8545";
        process.env.CONTRACT_ADDRESS = "0x123";
    });

    // Test 1: Degree Issued
    test("handleDegreeIssued should index new degree correctly", async () => {
        const mockContract = {
            tokenURI: jest.fn().mockResolvedValue("ipfs://QmMockHash")
        };
        
        // Inject mock contract into the module scope if possible, 
        // or just rely on the fact that the handler uses the global `contract` variable 
        // which we can't easily mock without dependency injection.
        // 
        // WORKAROUND: In a real unit test, we should pass the contract as a dependency.
        // For this simple script, we'll assume the service uses a singleton connection 
        // that we might need to mock via `ethers` or rewrite the service to be more testable.
        //
        // However, seeing `indexer.service.js`, `contract` is a module-level variable. 
        // `ethers.Contract` is instantiated in `startIndexer`.
        // The handlers use that `contract` variable.
        // This makes unit testing the handlers hard because `contract` is undefined until `startIndexer` runs.
        //
        // FIXED APPROACH: We need to modify the service to allow injecting the contract or 
        // we mock `ethers.Contract` so when `startIndexer` is called (or we simulate it), 
        // it sets the internal `contract` variable.
        //
        // Let's try to set the internal `contract` by calling `startIndexer` with mocks BUT `startIndexer` 
        // also connects to provider.
        
        // Simpler approach for this specific code structure:
        // We will mock `ethers.Contract` to return our mock object so when we "start" it, it's set.
        const mockEthersContract = {
            on: jest.fn(),
            tokenURI: jest.fn().mockResolvedValue("ipfs://QmMockHash")
        };
        require("ethers").Contract.mockImplementation(() => mockEthersContract);
        
        // We need to initialize the service to set the `contract` variable
        const { startIndexer } = require("../../src/services/indexer.service");
        await startIndexer();
        
        // Now call the handler
        const event = {
            log: {
                blockNumber: 123,
                transactionHash: "0xabc"
            }
        };

        await handleDegreeIssued(1, "0xStudent", "0xIssuer", event);

        expect(Degree.findOneAndUpdate).toHaveBeenCalledWith(
            { tokenId: 1 },
            expect.objectContaining({
                tokenId: 1,
                universityName: "Test University"
            }),
            expect.objectContaining({ upsert: true })
        );
    });

    // Test 2: Degree Revoked
    test("handleDegreeRevoked should mark degree as revoked", async () => {
        await handleDegreeRevoked(1, "0xStudent", "0xMinistry", 1234567890, {});

        expect(Degree.findOneAndUpdate).toHaveBeenCalledWith(
            { tokenId: 1 },
            expect.objectContaining({
                revoked: true,
                revokerAddress: "0xministry"
            })
        );
    });

    // Test 3: State Snapshot
    test("handleStateSnapshot should upload to IPFS and save to DB", async () => {
        // Mock Degree.find to return some degrees
        Degree.find.mockResolvedValue([
            { tokenId: 1, universityName: "Uni A" },
            { tokenId: 2, universityName: "Uni B" }
        ]);

        await handleStateSnapshot(1, 2, 1234567890, {});

        // Check if Degree.find was called
        expect(Degree.find).toHaveBeenCalledWith({ revoked: false });

        // Check if created in DB
        expect(Snapshot.create).toHaveBeenCalledWith(
            expect.objectContaining({
                snapshotId: 1,
                totalDegrees: 2,
                ipfsCid: "QmMockSnapshotHash"
            })
        );
    });
});
