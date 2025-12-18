import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/button";
import PageTitle from "@/components/ui/PageTitle";
import InputField from "@/components/ui/inputField";
import UploadBox from "@/components/ui/UploadBox";
import { formatAndValidateDate } from "@/utils/dateFormat";
import { useBlockchain } from "@/context/BlockchainContext";
import IpfsService from "@/services/IpfsService";

export default function SchoolPage() {
    const [filePDF, setFilePDF] = useState(null);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const blockchain = useBlockchain();

    const [formData, setFormData] = useState({
        studentAddress: "",
        soHieu: "",
        hoTen: "",
        ngaySinh: "",
        namTN: "",
        nganhDT: "",
    });

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const issueDegree = async () => {
        try {
            setLoading(true);
            setErrorMsg("");
            setSuccessMsg("");

            // Validation
            if (!filePDF) throw new Error("PDF file is required");
            if (!formData.studentAddress)
                throw new Error("Student wallet address is required");
            if (!formData.hoTen) throw new Error("Student name is required");
            if (!formData.nganhDT)
                throw new Error("Field of study is required");

            // Validate address format
            if (
                !formData.studentAddress.startsWith("0x") ||
                formData.studentAddress.length !== 42
            ) {
                throw new Error("Invalid Ethereum address format");
            }

            // Connect wallet if needed
            if (!blockchain.isWalletConnected) {
                await blockchain.connect();
            }

            // Step 1: Upload PDF to IPFS
            console.log("Uploading degree PDF to IPFS...");
            const fileUploadResult = await IpfsService.uploadDegreeFile(
                filePDF
            );
            const degreeFileCID = fileUploadResult.cid;
            console.log("PDF uploaded with CID:", degreeFileCID);

            // Step 2: Create metadata object
            const metadata = {
                studentName: formData.hoTen,
                certificateNumber: formData.soHieu,
                dateOfBirth: formData.ngaySinh,
                graduationYear: formData.namTN,
                fieldOfStudy: formData.nganhDT,
                degreeFileCID: degreeFileCID,
                issuedAt: new Date().toISOString(),
            };

            // Step 3: Upload metadata to IPFS
            console.log("Uploading degree metadata to IPFS...");
            const metadataUploadResult = await IpfsService.uploadDegreeMetadata(
                metadata
            );
            const metadataURI = metadataUploadResult.cid;
            console.log("Metadata uploaded with CID:", metadataURI);

            // Step 4: Mint degree on blockchain
            const response = await fetch(
                "http://localhost:3000/api/school/mint",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...formData,
                        metadataURI,
                        degreeFileCID,
                        universityName: "KHTN",
                        degreeName: "Bachelor",
                    }),
                }
            );

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Server error");
            }

            const degreeResult = result.data;

            setSuccessMsg(
                `Phát hành thành công!\nToken ID: ${
                    degreeResult.tokenId
                }\nTx Hash: ${degreeResult.transactionHash?.slice(0, 20)}...`
            );

            // Reset form
            setFormData({
                studentAddress: "",
                soHieu: "",
                hoTen: "",
                ngaySinh: "",
                namTN: "",
                nganhDT: "",
            });
            setFilePDF(null);
        } catch (error) {
            setErrorMsg(`Error: ${error.message}`);
            console.error("Degree issuance failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full flex flex-col justify-center items-center">
            <div className="absolute top-30 left-4">
                <Button
                    type="type2"
                    onClick={() => navigate("/School")}
                    className="flex items-center gap-3 px-4 h-6"
                >
                    <img src="/imgButton/ArrowBack.png" className="w-5 h-4" />
                </Button>
            </div>

            <PageTitle>Phát hành văn bằng</PageTitle>

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
                <div className="text-green-600 mb-4 text-sm whitespace-pre-wrap">
                    {successMsg}
                </div>
            )}

            <div className="flex flex-row gap-10 mt-5">
                {/* FORM */}
                <div className="flex flex-col gap-3">
                    <InputField
                        placeholder="Địa chỉ ví học sinh (0x...)"
                        type="text"
                        value={formData.studentAddress}
                        onChange={(value) =>
                            handleInputChange("studentAddress", value)
                        }
                    />
                    <InputField
                        placeholder="Số hiệu văn bằng"
                        type="text"
                        value={formData.soHieu}
                        onChange={(value) => handleInputChange("soHieu", value)}
                    />
                    <InputField
                        placeholder="Họ và tên"
                        type="text"
                        value={formData.hoTen}
                        onChange={(value) => handleInputChange("hoTen", value)}
                    />
                    <InputField
                        placeholder="Ngày sinh (dd/mm/yyyy)"
                        type="text"
                        value={formData.ngaySinh}
                        onChange={(value) => {
                            const newValue = formatAndValidateDate(value);
                            handleInputChange("ngaySinh", newValue);
                        }}
                    />
                    <InputField
                        placeholder="Năm TN"
                        type="number"
                        value={formData.namTN}
                        onChange={(value) => handleInputChange("namTN", value)}
                    />
                    <InputField
                        placeholder="Ngành ĐT"
                        type="text"
                        value={formData.nganhDT}
                        onChange={(value) =>
                            handleInputChange("nganhDT", value)
                        }
                    />
                </div>

                {/* UPLOAD */}
                <div className="flex flex-col">
                    <UploadBox onChange={setFilePDF} />
                    {filePDF && (
                        <p className="text-sm text-green-600 mt-2">
                            ✓ {filePDF.name}
                        </p>
                    )}
                </div>
            </div>

            <div className="flex flex-row gap-10 mt-5">
                <Button
                    className="font-semibold mt-3"
                    type="type3"
                    onClick={issueDegree}
                    disabled={loading}
                >
                    {loading ? "Processing..." : "Phát hành"}
                </Button>
            </div>
        </div>
    );
}
