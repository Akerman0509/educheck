import SearchBar from "@/components/ui/searchbar";
import Button from "@/components/ui/button";
import PageTitle from "@/components/ui/PageTitle";
import Table from "@/components/ui/table";
import ImgGrid from "@/components/ui/imgGrid";
import { useEffect, useState } from "react";
import PdfRenderer from "@/components/ui/PdfRenderer";
import { useWallet } from "@/hooks/useWallet";
import { useBlockchain } from "@/context/BlockchainContext";

export default function StudentPage() {
    const [data, setData] = useState([]);
    const [files, setImgFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const wallet = useWallet();
    const { blockchainService } = useBlockchain();

    const fetchMyDegrees = async () => {
        try {
            setLoading(true);
            setErrorMsg("");

            // Connect wallet if needed
            if (!wallet.isConnected) {
                await wallet.connect();
            }

            // Fetch degrees from blockchain
            const degrees = await blockchainService.getMyDegrees();

            if (!degrees || degrees.length === 0) {
                setData([]);
                setImgFiles([]);
                return;
            }

            // Fetch metadata for each degree and merge fields
            const tableData = await Promise.all(
                degrees.map(async (degree, index) => {
                    let metadata = {};
                    try {
                        metadata = await blockchainService.fetchMetadataFromURI(degree.metadataURI);
                    } catch (err) {
                        console.error("Failed to fetch metadata:", err);
                    }
                    return {
                        "STT": index + 1,
                        "Số hiệu văn bằng": metadata.certificateNumber || '',
                        "Họ và tên": metadata.studentName || '',
                        "Ngày sinh": metadata.dateOfBirth || '',
                        "Năm TN": metadata.graduationYear || '',
                        "Ngành ĐT": degree.fieldOfStudy,
                        "Trường": degree.universityName,
                        "Loại bằng": degree.degreeName,
                        "Ngày cấp": new Date(degree.issuedAt).toLocaleDateString('vi-VN'),
                        "Hiệu lực": "Còn hiệu lực",
                    };
                })
            );

            setData(tableData);

            // Fetch PDF files from IPFS
            const pdfFiles = await Promise.all(
                degrees.map(async (degree) => {
                    try {
                        const metadata = await blockchainService.fetchMetadataFromURI(degree.metadataURI);
                        const fileCID = metadata.degreeFileCID;
                        return {
                            src: `https://${import.meta.env.VITE_GATEWAY_URL}/ipfs/${fileCID}`,
                            alt: `${degree.universityName} - ${degree.degreeName}`,
                        };
                    } catch (err) {
                        console.error("Failed to fetch metadata:", err);
                        return null;
                    }
                })
            );

            setImgFiles(pdfFiles.filter(f => f !== null));

        } catch (error) {
            setErrorMsg(`Error: ${error.message}`);
            console.error("Failed to fetch degrees:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (wallet.isConnected) {
            fetchMyDegrees();
        }
    }, [wallet.isConnected]);

    return (
        <>
            <div className="flex flex-col justify-center items-center">
                <PageTitle>Văn bằng của tôi</PageTitle>

                {!wallet.isConnected && (
                    <Button
                        type="type3"
                        onClick={() => wallet.connect()}
                        className="mb-4"
                    >
                        Connect Wallet
                    </Button>
                )}

                {wallet.isConnected && (
                    <p className="text-sm text-gray-600 mb-4">
                        {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                    </p>
                )}

                {errorMsg && (
                    <div className="text-red-600 mb-4 text-sm">{errorMsg}</div>
                )}

                {loading && <p className="text-gray-600">Loading degrees...</p>}

                {data.length > 0 ? (
                    <Table data={data} />
                ) : (
                    !loading && wallet.isConnected && <p className="text-gray-500">No degrees found</p>
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
