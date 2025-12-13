import PageTitle from "@/components/ui/PageTitle";
import TableSchool from "@/components/ui/tableScchool";
import { useEffect, useState } from "react";
import Button from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import SearchBar from "@/components/ui/searchbar";

const tempData = [
    {
        "Số hiệu văn bằng": "123456",
        "Họ và tên": "Nguyễn Văn A",
        "Ngày sinh": "01/01/1990",
        "Năm TN": "2012",
        "Ngành ĐT": "Công nghệ thông tin",
    },
    {
        "Số hiệu văn bằng": "789",
        "Họ và tên": "Nguyễn Văn A",
        "Ngày sinh": "01/01/1990",
        "Năm TN": "2012",
        "Ngành ĐT": "Công nghệ thông tin",
    },
];

export default function StudentPage() {
    const [data, setData] = useState([]);
    const [filterText, setFilterText] = useState("");

    const navigate = useNavigate();
    const fetchData = (studentWalletUrl) => {
        // const result = fetchWithUrl(
        //     `https://api.example.com/search?query=${dataFilter}`
        // );
        setData(tempData);
    };
    useEffect(() => {
        fetchData();
    }, []);

    const handleFilterChange = (value) => {
        setFilterText(value);

        const filtered = tempData.filter((item) =>
            item["Số hiệu văn bằng"].toLowerCase().includes(value.toLowerCase())
        );

        setData(filtered);
    };

    return (
        <>
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
            <TableSchool data={data} />
        </>
    );
}
