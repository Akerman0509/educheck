import PageTitle from "@/components/ui/PageTitle";
import TableAdmin from "@/components/ui/TableAdmin";
import { useEffect, useState } from "react";
import Button from "@/components/ui/button";
import InputField from "@/components/ui/inputField";
import { useWallet } from "@/hooks/useWallet";
import { useBlockchain } from "@/context/BlockchainContext";

export default function AdminPage() {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({
        studentWalletUrl: "",
    });
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const wallet = useWallet();
    const { blockchainService } = useBlockchain();

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const assignUniversity = async () => {
        try {
            setLoading(true);
            setErrorMsg("");
            setSuccessMsg("");

            // Connect wallet if not connected
            if (!wallet.isConnected) {
                await wallet.connect();
            }

            const universityAddress = formData.studentWalletUrl.trim();
            
            // Validate address format
            if (!universityAddress.startsWith('0x') || universityAddress.length !== 42) {
                throw new Error('Invalid Ethereum address format. Must start with 0x and be 42 characters long');
            }

            // Call assignUniversity on blockchain
            const tx = await blockchainService.assignUniversity(universityAddress);
            
            setData(prev => [...prev, { 
                "Địa chỉ": universityAddress,
                "Trạng thái": "Được cấp quyền",
                "Thời gian": new Date().toLocaleString()
            }]);
            
            setSuccessMsg(`Successfully assigned university: ${universityAddress}`);
            setFormData({ studentWalletUrl: "" });
        } catch (error) {
            setErrorMsg(`Error: ${error.message}`);
            console.error('Assignment failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col justify-center items-center">
                <PageTitle>Admin</PageTitle>
                
                {wallet.isConnected && (
                    <p className="text-sm text-gray-600 mb-4">
                        Connected: {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                    </p>
                )}

                {errorMsg && (
                    <div className="text-red-600 mb-4 text-sm">{errorMsg}</div>
                )}
                {successMsg && (
                    <div className="text-green-600 mb-4 text-sm">{successMsg}</div>
                )}

                <InputField
                    placeholder="Địa chỉ ví của trường (0x...)"
                    type="text"
                    value={formData.studentWalletUrl}
                    onChange={(value) => handleInputChange("studentWalletUrl", value)}
                />
                <Button
                    className="font-semibold mt-4"
                    type="type3"
                    onClick={assignUniversity}
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Cấp quyền"}
                </Button>
                <div className="p-4"></div>
                <TableAdmin data={data} />
            </div>
            <div className="p-8"></div>
        </>
    );
}
