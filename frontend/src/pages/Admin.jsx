import PageTitle from "@/components/ui/PageTitle";
import TableAdmin from "@/components/ui/TableAdmin";
import { useState } from "react";
import Button from "@/components/ui/button";
import InputField from "@/components/ui/inputField";
import { useBlockchain } from "@/context/BlockchainContext";

export default function AdminPage() {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({
        universityName: "",
        studentWalletUrl: "",
    });
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const { 
        blockchainService, 
        isWalletConnected, 
        userAddress,
        universities,     
        setUniversities  
    } = useBlockchain();

    const blockchain = useBlockchain();
    const handleInputChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const assignUniversity = async () => {
        try {
            setLoading(true);
            setErrorMsg("");
            setSuccessMsg("");

            if (!blockchain.isWalletConnected) {
                window.alert("Please connect your wallet first.");
                return;
            }

            const nameToSave = formData.universityName;
            const addressToSave = formData.studentWalletUrl.trim();

            // Validate
            if (!addressToSave.startsWith("0x") || addressToSave.length !== 42) {
                throw new Error("Invalid Ethereum address format.");
            }
            if (!nameToSave) {
                throw new Error("Tên trường không được để trống.");
            }

            // Call blockchain service to assign university
            await blockchainService.assignUniversity(addressToSave, nameToSave);

            setUniversities((prev) => [
                ...prev,
                {
                    id: prev.length + 1,
                    "Trường": nameToSave, 
                    universityName: nameToSave,
                    address: addressToSave,
                    status: "Được cấp quyền",
                    timestamp: new Date().toLocaleString(),
                },
            ]);

            setSuccessMsg(`Đã cấp quyền thành công cho: ${nameToSave}`);
            setFormData({ universityName: "", studentWalletUrl: "" });

        } catch (error) {
            setErrorMsg(`Lỗi: ${error.message}`);
            console.error("Assignment failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col justify-center items-center">
                <PageTitle>Admin</PageTitle>

                {blockchain.isWalletConnected && (
                    <p className="text-sm text-gray-600 mb-4">
                        Connected: {blockchain.userAddress?.slice(0, 6)}...
                        {blockchain.userAddress?.slice(-4)}
                    </p>
                )}

                {errorMsg && (
                    <div className="text-red-600 mb-4 text-sm">{errorMsg}</div>
                )}
                {successMsg && (
                    <div className="text-green-600 mb-4 text-sm">
                        {successMsg}
                    </div>
                )}

                <InputField
                    placeholder="Tên trường"
                    type="text"
                    value={formData.universityName || ""}
                    onChange={(val) => handleInputChange("universityName", val)}
                />

                <InputField
                    placeholder="Địa chỉ ví của trường (0x...)"
                    type="text"
                    value={formData.studentWalletUrl || ""}
                    onChange={(val) => handleInputChange("studentWalletUrl", val)}
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
                <TableAdmin data={universities} />
            </div>
            <div className="p-8"></div>
        </>
    );
}
