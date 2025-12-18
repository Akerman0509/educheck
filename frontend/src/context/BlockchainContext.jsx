import { createContext, useContext, useState, useEffect } from "react";
import BlockchainService from "@/services/BlockchainService";
import UniversityDegreesSBTABI from "@/contracts/UniversityDegreesSBT.json";

const BlockchainContext = createContext();

export function BlockchainProvider({ children }) {
    const [isInitialized, setIsInitialized] = useState(false);
    const [isWalletConnected, setIsWalletConnected] = useState(false);
    const [userAddress, setUserAddress] = useState(null);
    const [error, setError] = useState(null);
    const [isInitializing, setIsInitializing] = useState(true);
    const [universities, setUniversities] = useState([]);

    // Initialize blockchain service on mount
    useEffect(() => {
        const initializeBlockchain = async () => {
            try {
                const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
                if (!contractAddress) {
                    throw new Error(
                        "VITE_CONTRACT_ADDRESS not configured in .env.local"
                    );
                }

                await BlockchainService.initialize(
                    contractAddress,
                    UniversityDegreesSBTABI.abi
                );
                setIsInitialized(true);
                setError(null);
            } catch (err) {
                const errorMsg =
                    "Failed to initialize blockchain service: " +
                    (err.message || err);
                setError(errorMsg);
                console.error(errorMsg);
            } finally {
                setIsInitializing(false);
            }
        };

        initializeBlockchain();
    }, []);

    const connectWallet = async () => {
        try {
            setError(null);
            const address = await BlockchainService.connectWallet();
            setUserAddress(address);
            setIsWalletConnected(true);
            return address;
        } catch (err) {
            const errorMsg = err.message || "Failed to connect wallet";
            setError(errorMsg);
            throw err;
        }
    };

    const disconnectWallet = () => {
        setIsWalletConnected(false);
        setUserAddress(null);
    };

    return (
        <BlockchainContext.Provider
            value={{
                isInitialized,
                isWalletConnected,
                userAddress,
                error,
                isInitializing,
                connectWallet,
                disconnectWallet,
                blockchainService: BlockchainService,
                universities,    
                setUniversities,
            }}
        >
            {children}
        </BlockchainContext.Provider>
    );
}

export function useBlockchain() {
    const context = useContext(BlockchainContext);
    if (!context) {
        throw new Error("useBlockchain must be used within BlockchainProvider");
    }
    return context;
}
