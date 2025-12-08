import { useState, useEffect } from "react";
import { Wallet, LogOut, CheckCircle } from "lucide-react";

export default function WalletConnect({ onClose, onConnect }) {
    const [account, setAccount] = useState(null);
    const [showWalletMenu, setShowWalletMenu] = useState(false);
    const [walletType, setWalletType] = useState(null);

    useEffect(() => {
        checkIfWalletIsConnected();
    }, []);

    const checkIfWalletIsConnected = async () => {
        if (window.ethereum) {
            const accounts = await window.ethereum.request({
                method: "eth_accounts",
            });
            if (accounts.length > 0) {
                const connectedAccount = accounts[0];

                setAccount(connectedAccount);
                onConnect(connectedAccount);
                setWalletType("MetaMask");
            }
        }
    };

    const connectMetaMask = async () => {
        try {
            const accounts = await window.ethereum.request({
                method: "eth_requestAccounts",
            });
            setAccount(accounts[0]);
            onConnect(account);
            console.log("change account 2");

            setWalletType("MetaMask");
            setShowWalletMenu(false);
        } catch (err) {
            alert("Failed to connect MetaMask");
        }
    };

    const disconnect = () => {
        setAccount(null);
        setWalletType(null);
    };

    function formatAddress(addr) {
        // console.log("addr = ", addr);
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    }

    return (
        <div className="bg-linear-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 rounded-2xl">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-md w-full border border-white/20 shadow-2xl relative">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/70 hover:text-white"
                >
                    ✕
                </button>

                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-purple-500 to-blue-500 rounded-full mb-4">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Web3 Wallet
                    </h1>
                    <p className="text-gray-300">
                        Connect your wallet to get started
                    </p>
                </div>

                {!account ? (
                    <div className="relative">
                        <button
                            onClick={() => setShowWalletMenu(!showWalletMenu)}
                            className="w-full bg-linear-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl"
                        >
                            Connect Wallet
                        </button>

                        {showWalletMenu && (
                            // <div className="absolute top-full mt-2 w-full bg-white rounded-xl">
                            <button
                                onClick={connectMetaMask}
                                className="w-full px-6 py-2 mt-2 text-left hover:bg-gray-200 transition-colors flex items-center space-x-3  border-gray-100 bg-white rounded-xl"
                            >
                                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                                    <Wallet className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        MetaMask
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        Connect to MetaMask
                                    </div>
                                </div>
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="bg-white/10 rounded-xl p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-300 text-sm">
                                    Connected with {walletType}
                                </span>
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            </div>
                            <div className="text-white font-mono">
                                {formatAddress(account)}
                            </div>
                        </div>

                        {/* <button
                            onClick={disconnect}
                            className="w-full bg-red-500 text-white py-3 rounded-xl"
                        >
                            <LogOut className="inline w-4 h-4 mr-2" />
                            Disconnect
                        </button> */}
                    </div>
                )}
            </div>
        </div>
    );
}
