import { useBlockchain } from '@/context/BlockchainContext';

export function useWallet() {
  const blockchain = useBlockchain();

  const connect = async () => {
    if (blockchain.isWalletConnected) {
      return blockchain.userAddress;
    }
    return await blockchain.connectWallet();
  };

  return {
    address: blockchain.userAddress,
    isConnected: blockchain.isWalletConnected,
    connect,
    disconnect: blockchain.disconnectWallet,
    error: blockchain.error,
    isInitializing: blockchain.isInitializing,
    isInitialized: blockchain.isInitialized,
  };
}
