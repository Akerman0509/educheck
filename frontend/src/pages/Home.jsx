import SearchBar from "@/components/ui/searchbar";
import Button from "@/components/ui/button";
import PageTitle from "@/components/ui/PageTitle";
import Table from "@/components/ui/table";

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

    const handleSearch = (dataFilter) => {
        // const result = fetchWithUrl(
        //     `https://api.example.com/search?query=${dataFilter}`
        // );
        setData(tempData);
        setShowTable(true);
    };
    const handleFilterChange = (value) => {
        setDataFilter(value);
    };

    return (
        <div className="flex flex-col justify-center items-center">
            <PageTitle>Tra cứu văn bằng</PageTitle>
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
