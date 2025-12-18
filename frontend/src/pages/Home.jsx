import SearchBar from "@/components/ui/searchbar";
import Button from "@/components/ui/button";
import PageTitle from "@/components/ui/PageTitle";
import Table from "@/components/ui/table";
import { useBlockchain } from "@/context/BlockchainContext";

import { useState } from "react";

const tempData = [
    {
        "Số hiệu văn bằng": "123456",
        "Họ và tên": "Nguyễn Văn A",
        "Ngày sinh": "01/01/1990",
        "Năm TN": "2012",
        "Ngành ĐT": "Công nghệ thông tin",
        "Hiệu lực": "Còn hiệu lực",
    },
    {
        "Số hiệu văn bằng": "123456",
        "Họ và tên": "Nguyễn Văn A",
        "Ngày sinh": "01/01/1990",
        "Năm TN": "2012",
        "Ngành ĐT": "Công nghệ thông tin",
        "Hiệu lực": "Còn hiệu lực",
    },
];

function fetchWithUrl(url) {
    return tempData;
}

export default function Home() {
    const [showTable, setShowTable] = useState(false);
    const [data, setData] = useState([]);
    const [dataFilter, setDataFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // const handleSearch = (dataFilter) => {
    //     // const result = fetchWithUrl(
    //     //     `https://api.example.com/search?query=${dataFilter}`
    //     // );
    //     setData(tempData);
    //     setShowTable(true);
    // };
    const handleFilterChange = (value) => {
        setDataFilter(value);
    };
        const handleSearch = async (query) => {
        setError("");
        setShowTable(false);
        const q = (query && query.trim()) || (blockchain.isWalletConnected ? blockchain.userAddress : "");
    if (!q) {
      setError("Please enter an ID or wallet address (or connect your wallet).");
      return;
    }

    setLoading(true);
    try {
      
        const url = `/api/${encodeURIComponent(q)}`;
        const res = await fetch(url);
        const body = await res.json();
        if (!res.ok || !body.success) throw new Error(body.message || "Server error");
        // Map backend degrees -> table rows expected by your Table component:
        const rows = (Array.isArray(body.data) ? body.data : [body.data]).map(d => ({
            "Số hiệu văn bằng": d.metadataJson?.certificateNumber ?? "",
            "Họ và tên": d.metadataJson?.studentName ?? "",
            "Ngày sinh": d.metadataJson?.dateOfBirth ?? "",
            "Năm TN": d.metadataJson?.graduationYear ?? "",
            "Trường ĐH": d.metadataJson?.universityName ?? d.universityName ?? "",
            "Ngành ĐT": d.metadataJson?.fieldOfStudy ?? d.fieldOfStudy ?? "",
            "Cấp bằng ngày": d.metadataJson ? new Date(d.metadataJson.issuedAt).toLocaleDateString() : "",
            "Hiệu lực": d.revoked ? "Đã thu hồi" : "Còn hiệu lực",
}));
      setData(rows);
      setShowTable(true);
    } catch (err) {
      setError(err.message || "Failed to fetch degrees");
    } finally {
      setLoading(false);
    }
  };

    const blockchain = useBlockchain();

    // const a = "blockchain connected status: " + blockchain.isWalletConnected;
    return (
        <div className="flex flex-col justify-center items-center">
            <PageTitle>Tra cứu văn bằng</PageTitle>
            {/* <p>{a}</p> */}
            <SearchBar onChange={handleFilterChange} />
            <Button
                className="font-semibold"
                type="type3"
                onClick={() => handleSearch(dataFilter)}
            >
                Tra cứu
            </Button>
            <div className="p-4"></div>
            {showTable && <Table data={data} />}
        </div>
    );
}
