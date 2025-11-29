import SearchBar from "@/components/ui/searchbar";
import Button from "@/components/ui/button";
import PageTitle from "@/components/ui/PageTitle";
import Table from "@/components/ui/table";
import ImgGrid from "@/components/ui/imgGrid";
import { useEffect, useState } from "react";
import PdfRenderer from "@/components/ui/PdfRenderer";

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

const tempFiles = [
    {
        src: "/Frieren.pdf",
        alt: "Diploma 1",
    },
    {
        src: "/1.pdf",
        alt: "Diploma 2",
    },
    {
        src: "/Frieren.pdf",
        alt: "Diploma 1",
    },
    {
        src: "/Frieren.pdf",
        alt: "Diploma 1",
    },
    {
        src: "/Frieren.pdf",
        alt: "Diploma 1",
    },
    {
        src: "/Frieren.pdf",
        alt: "Diploma 1",
    },
    {
        src: "/Frieren.pdf",
        alt: "Diploma 1",
    },
];

export default function StudentPage() {
    const [data, setData] = useState([]);
    const [files, setImgFiles] = useState([]);

    const fetchData = (studentWalletUrl) => {
        // const result = fetchWithUrl(
        //     `https://api.example.com/search?query=${dataFilter}`
        // );
        setData(tempData);
        setImgFiles(tempFiles);
    };
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            <div className="flex flex-col justify-center items-center">
                <PageTitle>Văn bằng của tôi</PageTitle>
                <Table data={data} />
            </div>
            <div className="p-8"></div>

            <div className="flex flex-row justify-center items-center">
                <ImgGrid files={files} />
            </div>
        </>
    );
}
