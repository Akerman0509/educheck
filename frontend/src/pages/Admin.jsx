import PageTitle from "@/components/ui/PageTitle";
import TableAdmin from "@/components/ui/TableAdmin";
import TableSnapshot from "@/components/ui/TableSnapshot";
import { useState, useEffect } from "react";
import Button from "@/components/ui/button";
import InputField from "@/components/ui/inputField";
import { useBlockchain } from "@/context/BlockchainContext";
import systemService from "@/services/SystemService";

export default function AdminPage() {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({
        universityName: "",
        studentWalletUrl: "",
    });
    const [loading, setLoading] = useState(false);
    const [snapshotLoading, setSnapshotLoading] = useState(false);
    const [snapshots, setSnapshots] = useState([]);
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

    useEffect(() => {
        fetchSnapshots();
    }, []);

    const fetchSnapshots = async () => {
        try {
            const list = await systemService.getSnapshots();
            setSnapshots(list);
        } catch (error) {
            console.error("Failed to fetch snapshots:", error);
        }
    };

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

    const handleCreateSnapshot = async () => {
        try {
            setSnapshotLoading(true);
            setErrorMsg("");
            setSuccessMsg("");

            if (!blockchain.isWalletConnected) {
                window.alert("Please connect your wallet first.");
                return;
            }

            await blockchainService.createSnapshot();
            setSuccessMsg("Đã gửi yêu cầu tạo bản sao lưu lên Blockchain. Vui lòng chờ vài giây để hệ thống xử lý.");
            
            // Poll for new snapshots after a short delay
            setTimeout(fetchSnapshots, 5000);
            setTimeout(fetchSnapshots, 10000);

        } catch (error) {
            setErrorMsg(`Lỗi tạo bản sao lưu: ${error.message}`);
        } finally {
            setSnapshotLoading(false);
        }
    };

    const handleRestore = async (ipfsCid) => {
        if (!window.confirm("Bạn có chắc chắn muốn khôi phục dữ liệu từ bản sao lưu này? Dữ liệu hiện tại trong hệ thống có thể bị thay đổi.")) {
            return;
        }

        try {
            setSnapshotLoading(true);
            setErrorMsg("");
            setSuccessMsg("");

            const result = await systemService.restoreSnapshot(ipfsCid);
            setSuccessMsg(`Khôi phục thành công! Đã cập nhật ${result.count} bản ghi.`);
            
        } catch (error) {
            setErrorMsg(`Lỗi khôi phục: ${error.message}`);
        } finally {
            setSnapshotLoading(false);
        }
    };

    return (
        <>
            <div className="flex flex-col justify-center items-center px-4 max-w-4xl mx-auto">
                <PageTitle>Admin</PageTitle>

                {blockchain.isWalletConnected && (
                    <p className="text-sm text-gray-600 mb-4">
                        Connected: {blockchain.userAddress?.slice(0, 6)}...
                        {blockchain.userAddress?.slice(-4)}
                    </p>
                )}

                {errorMsg && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg mb-4 text-sm w-full text-center">
                        {errorMsg}
                    </div>
                )}
                {successMsg && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-2 rounded-lg mb-4 text-sm w-full text-center">
                        {successMsg}
                    </div>
                )}

                <div className="flex flex-col gap-8 w-full">
                    {/* Left Side: Assign University */}
                    <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-6 text-blue-700">Cấp quyền Trường học</h2>
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
                            className="font-semibold mt-4 w-full"
                            type="type3"
                            onClick={assignUniversity}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Cấp quyền"}
                        </Button>
                        <div className="p-4"></div>
                        <TableAdmin data={universities} />
                    </div>

                    {/* Right Side: Snapshots */}
                    <div className="flex flex-col items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold mb-4 text-purple-700">Quản trị Hệ thống</h2>
                        <p className="text-xs text-gray-500 mb-6 text-center">
                            Tạo bản sao lưu dữ liệu hiện tại lên IPFS và Blockchain để đảm bảo tính toàn vẹn.
                        </p>
                        
                        <Button
                            className="font-semibold w-full bg-purple-600 hover:bg-purple-700 border-none"
                            type="type3"
                            onClick={handleCreateSnapshot}
                            disabled={snapshotLoading}
                        >
                            {snapshotLoading ? "Đang xử lý..." : "📸 Tạo Bản Sao Lưu"}
                        </Button>

                        <TableSnapshot 
                            data={snapshots} 
                            onRestore={handleRestore}
                            loading={snapshotLoading}
                        />
                    </div>
                </div>
            </div>
            <div className="p-8"></div>
        </>
    );
}
