import PageTitle from "@/components/ui/PageTitle";
import TableSchool from "@/components/ui/tableScchool";
import { useEffect, useState } from "react";
import Button from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SearchBar from "@/components/ui/searchbar";
import { useBlockchain } from "@/context/BlockchainContext";

export default function StudentPage() {
    const [data, setData] = useState([]);
    const [allData, setAllData] = useState([]);
    const [filterText, setFilterText] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const navigate = useNavigate();
    const { blockchainService, userAddress, isWalletConnected } = useBlockchain();

    const fetchData = async () => {
        if (!isWalletConnected || !userAddress) {
            setErrorMsg("Vui lòng kết nối ví");
            return;
        }

        try {
            setLoading(true);
            setErrorMsg("");
            
            const response = await fetch(
                `http://localhost:3000/api/school/degrees/${userAddress}`
            );
            
            if (!response.ok) {
                throw new Error("Failed to fetch degrees");
            }
            
            const result = await response.json();
            
            if (result.success && result.data) {
                // Transform data to include metadataJson fields
                const transformedData = result.data.map(degree => ({
                    tokenId: degree.tokenId,
                    certificateNumber: degree.metadataJson?.certificateNumber || "N/A",
                    studentName: degree.metadataJson?.studentName || "N/A",
                    dateOfBirth: degree.metadataJson?.dateOfBirth || "N/A",
                    graduationYear: degree.metadataJson?.graduationYear || "N/A",
                    fieldOfStudy: degree.fieldOfStudy || "N/A",
                    studentAddress: degree.studentAddress,
                    transactionHash: degree.transactionHash
                }));
                
                setAllData(transformedData);
                setData(transformedData);
            }
        } catch (error) {
            console.error("Error fetching degrees:", error);
            setErrorMsg("Lỗi khi tải dữ liệu văn bằng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [userAddress, isWalletConnected]);

    const handleFilterChange = (value) => {
        setFilterText(value);

        const filtered = allData.filter((item) =>
            item.certificateNumber.toLowerCase().includes(value.toLowerCase()) ||
            item.studentName.toLowerCase().includes(value.toLowerCase())
        );

        setData(filtered);
    };

    const handleRevoke = async (degree) => {
        if (!window.confirm(`Bạn có chắc muốn thu hồi văn bằng #${degree.tokenId}?`)) {
            return;
        }

        try {
            setLoading(true);
            setErrorMsg("");

            // Step 1: Revoke on blockchain
            console.log("Revoking degree on blockchain...", degree.tokenId);
            const blockchainResult = await blockchainService.revokeDegree(degree.tokenId);
            console.log("Blockchain revocation successful:", blockchainResult);

            // Step 2: Delete from backend database
            console.log("Deleting degree from database...");
            const response = await fetch(
                `http://localhost:3000/api/school/degree/${degree.tokenId}`,
                {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ tokenId: degree.tokenId })
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to delete from database");
            }

            alert(`Thu hồi văn bằng thành công!\nTx Hash: ${blockchainResult.transactionHash?.slice(0, 20)}...`);
            
            // Refresh data
            await fetchData();
        } catch (error) {
            console.error("Error revoking degree:", error);
            setErrorMsg(`Lỗi khi thu hồi văn bằng: ${error.message}`);
            alert(`Lỗi: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {errorMsg && (
                <div className="fixed top-20 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {errorMsg}
                </div>
            )}
            {loading && (
                <div className="fixed top-20 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                    Đang xử lý...
                </div>
            )}
            <div className="absolute top-30 right-4">
                <Button
                    type="type2"
                    onClick={() => navigate("/School/AddPage")}
                    className="px-5 py-3 flex items-center gap-3"
                >
                    <img src="/imgButton/Addbutton.png" className="w-4 h-4" />
                    <span className="text-sm font-medium">Thêm văn bằng</span>
                </Button>
            </div>
            <div className="flex flex-col justify-center items-center">
                <PageTitle>Danh sách văn bằng</PageTitle>
                <SearchBar onChange={handleFilterChange} />
            </div>
            <div className="p-4"></div>
            <TableSchool data={data} onRevoke={handleRevoke} />
        </>
    );
}
