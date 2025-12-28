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
    const { blockchainService } = useBlockchain();
    const [uniName, setUniName] = useState("Đang tải...");
    const blockchain = useBlockchain();

    const [formData, setFormData] = useState({
        studentAddress: "",
        certificateNumber: "",
        studentName: "",
        dateOfBirth: "",
        graduationYear: "",
        fieldOfStudy: "",
        degreeName: "",
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
            if (!formData.studentAddress) throw new Error("Student wallet address is required");
            if (!formData.certificateNumber) throw new Error("Certificate number is required");
            if (!formData.studentName) throw new Error("Student name is required");
            if (!formData.dateOfBirth) throw new Error("Date of birth is required");
            if (!formData.graduationYear) throw new Error("Graduation year is required");
            if (!formData.fieldOfStudy) throw new Error("Field of study is required");
            if (!formData.degreeName) throw new Error("Degree name is required");

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
            const uniName = await blockchainService.getUniversityName(blockchain.userAddress);
            setUniName(uniName);
            // Step 2: Create metadata object
            const metadata = {
                studentName: formData.studentName,
                certificateNumber: formData.certificateNumber,
                dateOfBirth: formData.dateOfBirth,
                graduationYear: formData.graduationYear,
                fieldOfStudy: formData.fieldOfStudy,
                degreeFileCID: degreeFileCID,
                issuedAt: new Date().toISOString(),
                universityName: uniName,
                degreeName: formData.degreeName,
            };

            // Step 3: Upload metadata to IPFS
            console.log("Uploading degree metadata to IPFS...");
            const metadataUploadResult = await IpfsService.uploadDegreeMetadata(
                metadata
            );
            const metadataURI = metadataUploadResult.cid;
            console.log("Metadata uploaded with CID:", metadataURI);

            // Step 4: Mint degree on blockchain with MetaMask
            console.log("Minting degree on blockchain...");
            const blockchainResult = await blockchainService.mintDegree(
                formData.studentAddress,
                uniName,
                formData.degreeName,
                formData.fieldOfStudy,
                metadataURI
            );

            console.log("Blockchain minting successful:", blockchainResult);

            // Step 5: Save degree to backend database
            console.log("Saving degree to database...");
            const response = await fetch(
                "http://localhost:3000/api/school/degree",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        tokenId: blockchainResult.tokenId,
                        studentAddress: formData.studentAddress,
                        universityName: uniName,
                        studentName: formData.studentName,
                        certificateNumber: formData.certificateNumber,
                        dateOfBirth: formData.dateOfBirth,
                        graduationYear: formData.graduationYear,
                        fieldOfStudy: formData.fieldOfStudy,
                        degreeName: formData.degreeName,
                        ipfsHash: metadataURI,
                        degreeFileCID: degreeFileCID,
                        transactionHash: blockchainResult.transactionHash,
                        issuer: blockchainResult.issuer,
                        blockNumber: blockchainResult.blockNumber,
                        issuedAt: new Date().toISOString(),
                    }),
                }
            );
            
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Failed to save to database");
            }

            setSuccessMsg(
                `Phát hành thành công!\nToken ID: ${
                    blockchainResult.tokenId
                }\nTx Hash: ${blockchainResult.transactionHash?.slice(0, 20)}...`
            );

            // Reset form
            setFormData({
                studentAddress: "",
                certificateNumber: "",
                studentName: "",
                dateOfBirth: "",
                graduationYear: "",
                degreeName: "",
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
                        value={formData.certificateNumber}
                        onChange={(value) => handleInputChange("certificateNumber", value)}
                    />
                    <InputField
                        placeholder="Họ và tên"
                        type="text"
                        value={formData.studentName}
                        onChange={(value) => handleInputChange("studentName", value)}
                    />
                    <InputField
                        placeholder="Ngày sinh (dd/mm/yyyy)"
                        type="text"
                        value={formData.dateOfBirth}
                        onChange={(value) => {
                            const newValue = formatAndValidateDate(value);
                            handleInputChange("dateOfBirth", newValue);
                        }}
                    />
                    <InputField
                        placeholder="Năm TN"
                        type="number"
                        value={formData.graduationYear}
                        onChange={(value) => handleInputChange("graduationYear", value)}
                    />
                    <InputField
                        placeholder="Ngành ĐT"
                        type="text"
                        value={formData.fieldOfStudy}
                        onChange={(value) =>
                            handleInputChange("fieldOfStudy", value)
                        }
                    />
                    <InputField
                        placeholder="Loại bằng"
                        type="text"
                        value={formData.degreeName}
                        onChange={(value) =>
                            handleInputChange("degreeName", value)
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
