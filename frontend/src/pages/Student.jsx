import SearchBar from "@/components/ui/searchbar";
import Button from "@/components/ui/button";
import PageTitle from "@/components/ui/PageTitle";
import Table from "@/components/ui/table";
import ImgGrid from "@/components/ui/imgGrid";
import { useEffect, useState } from "react";
import { useBlockchain } from "@/context/BlockchainContext";
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`;

export default function StudentPage() {
    const [data, setData] = useState([]);
    const [allData, setAllData] = useState([]);
    const [files, setImgFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [filterText, setFilterText] = useState("");

    const { blockchainService } = useBlockchain();
    const blockchain = useBlockchain();

    const fetchMyDegrees = async () => {
        try {
            setLoading(true);
            setErrorMsg("");

            // Fetch degrees from backend API using connected wallet address
            const response = await fetch(`http://localhost:3000/api/student/${blockchain.userAddress}`);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || "Failed to fetch degrees");
            }

            const degrees = result.data;

            if (!degrees || degrees.length === 0) {
                setData([]);
                setImgFiles([]);
                return;
            }

            // Use metadataJson from backend response
            const tableData = degrees.map((degree, index) => {
                const metadata = degree.metadataJson || {};
                return {
                    STT: index + 1,
                    "Số hiệu văn bằng": metadata.certificateNumber || "",
                    "Họ và tên": metadata.studentName || "",
                    "Ngày sinh": metadata.dateOfBirth || "",
                    "Năm TN": metadata.graduationYear || "",
                    "Ngành ĐT": degree.fieldOfStudy || metadata.fieldOfStudy || "",
                    Trường: degree.universityName || metadata.universityName || "",
                    "Loại bằng": degree.degreeName || metadata.degreeName || "",
                    "Ngày cấp": new Date(
                        degree.issuedAt
                    ).toLocaleDateString("vi-VN"),
                    "Hiệu lực": degree.revoked ? "Đã thu hồi" : "Còn hiệu lực",
                };
            });

            setAllData(tableData);
            setData(tableData);

            // Get PDF files from metadataJson
            const pdfFiles = degrees.map((degree) => {
                const fileCID = degree.metadataJson?.degreeFileCID;
                if (!fileCID) return null;
                return {
                    src: `https://${
                        import.meta.env.VITE_GATEWAY_URL
                    }/ipfs/${fileCID}`,
                    alt: `${degree.universityName} - ${degree.degreeName}`,
                };
            });

            setImgFiles(pdfFiles.filter((f) => f !== null));
        } catch (error) {
            setErrorMsg(`Error: ${error.message}`);
            console.error("Failed to fetch degrees:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!blockchain.isWalletConnected) return;
        fetchMyDegrees();
    }, [blockchain.isWalletConnected]);

    const handleFilterChange = (value) => {
        setFilterText(value);
    };

    const handleSearchClick = () => {
        if (!filterText.trim()) {
            setData(allData);
            return;
        }

        const filtered = allData.filter((item) => {
            const searchLower = filterText.toLowerCase();
            return (
                item["Số hiệu văn bằng"]?.toLowerCase().includes(searchLower) ||
                item["Họ và tên"]?.toLowerCase().includes(searchLower) ||
                item["Trường"]?.toLowerCase().includes(searchLower) ||
                item["Ngành ĐT"]?.toLowerCase().includes(searchLower)
            );
        });

        setData(filtered);
    };

    return (
        <>
            <div className="flex flex-col justify-center items-center">
                <PageTitle>Văn bằng của tôi</PageTitle>

                {!blockchain.isWalletConnected && (
                    <Button
                        type="type3"
                        onClick={() => blockchain.connect()}
                        className="mb-4"
                    >
                        Kết nối ví
                    </Button>
                )}

                {blockchain.isWalletConnected && (
                    <p className="text-sm text-gray-600 mb-4">
                        {blockchain.userAddress?.slice(0, 6)}...
                        {blockchain.userAddress?.slice(-4)}
                    </p>
                )}

                {blockchain.isWalletConnected && (
                    <>
                        <SearchBar onChange={handleFilterChange} />
                        <Button
                            className="font-semibold"
                            type="type3"
                            onClick={handleSearchClick}
                        >
                            Tra cứu
                        </Button>
                    </>
                )}

                {errorMsg && (
                    <div className="text-red-600 mb-4 text-sm">{errorMsg}</div>
                )}

                {loading && <p className="text-gray-600">Đang tải văn bằng...</p>}

                {data.length > 0 ? (
                    <Table data={data} />
                ) : (
                    !loading &&
                    blockchain.isWalletConnected && (
                        <p className="text-gray-500">Không tìm thấy văn bằng</p>
                    )
                )}
            </div>
            <div className="p-8"></div>

            {files.length > 0 && (
                <div className="flex flex-row justify-center items-center">
                    <ImgGrid files={files} />
                </div>
            )}
        </>
    );
}
