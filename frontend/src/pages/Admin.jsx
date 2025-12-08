import PageTitle from "@/components/ui/PageTitle";
import TableAdmin from "@/components/ui/TableAdmin";
import { useEffect, useState } from "react";
import Button from "@/components/ui/button";
import InputField from "@/components/ui/inputField";


export default function AdminPage() {
    const [data, setData] = useState([]);
    const [formData, setFormData] = useState({
        studentWalletUrl: "",
    });
    const fetchData = () => {
        // add
        if (!formData.studentWalletUrl.trim()) return;
        const newEntry = { "Trường": formData.studentWalletUrl };
        setData(prev => [...prev, newEntry]);
        setFormData({ studentWalletUrl: "" });
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };
    useEffect(() => {
        fetchData();
    }, []);

    return (
        <>
            <div className="absolute top-30 right-4">
            </div>
            <div className="flex flex-col justify-center items-center">
                <PageTitle>Admin</PageTitle>
                <InputField
                    placeholder="Địa chỉ ví của trường"
                    type="text"
                    value={formData.studentWalletUrl}
                    onChange={(value) => handleInputChange("studentWalletUrl", value)}
                />
                <Button
                    className="font-semibold mt-4"
                    type="type3"
                    onClick={() => fetchData()}
                >
                    Cấp quyền
                </Button>
                <div className="p-4"></div>
                <TableAdmin data={data} />
            </div>
            <div className="p-8"></div>
        </>
    );
}
