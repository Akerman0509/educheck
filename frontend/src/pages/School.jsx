import { useState } from "react";
import Button from "@/components/ui/button";
import PageTitle from "@/components/ui/PageTitle";
import InputField from "@/components/ui/inputField";
import UploadBox from "@/components/ui/UploadBox";

export default function SchoolPage() {
  const [filePDF, setFilePDF] = useState(null);


    const [formData, setFormData] = useState({
        soHieu: "",
        hoTen: "",
        ngaySinh: "",
        namTN: "",
        nganhDT: "",
    });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

    return (
        <div className="w-full flex flex-col justify-center items-center ">
            <PageTitle>Phát hành văn bằng</PageTitle>
            <div className="flex flex-row gap-10 mt-5">
                {/* FORM */}
                <div className="flex flex-col gap-3">
                    <InputField
                        placeholder="Số hiệu văn bằng"
                        type="number"
                        onChange={(value) => handleInputChange("soHieu", value)}
                    />
                    <InputField
                        placeholder="Họ và tên"
                        type="text"
                        onChange={(value) => handleInputChange("hoTen", value)}
                    />
                    <InputField
                        placeholder="Ngày sinh"
                        type="date"
                        onChange={(value) =>
                            handleInputChange("ngaySinh", value)
                        }
                    />
                    <InputField
                        placeholder="Năm TN"
                        type="number"
                        onChange={(value) => handleInputChange("namTN", value)}
                    />
                    <InputField
                        placeholder="Ngành ĐT"
                        type="text"
                        onChange={(value) =>
                            handleInputChange("nganhDT", value)
                        }
                    />
                </div>

        {/* UPLOAD */}
        <div className="flex flex-col">
          <UploadBox onChange={setFilePDF} />
        </div>
      </div>

      <div className="flex flex-row gap-10 mt-5">
        <Button
          className="font-semibold mt-3"
          type="type3"
          //onClick={() => {}}
          onClick={() => console.log({ ...formData, filePDF })}
        >
          Phát hành
        </Button>
      </div>
    </div>
  );
}
