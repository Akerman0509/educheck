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

// text - topbarBorder;
function Table({ type, ...props }) {
    const borderClass = "border-2 p-2";
    const titleClass = "border-2 p-2 ";

    return (
        <table className="table-auto ">
            <thead className="bg-blue-100">
                <tr>
                    <th className={titleClass}>Số hiệu văn bằng</th>
                    <th className={titleClass}>Họ và tên</th>
                    <th className={titleClass}>Ngày sinh</th>
                    <th className={titleClass}>Năm TN</th>
                    <th className={titleClass}>Ngành ĐT</th>
                    <th className={titleClass}>Hiệu lực</th>
                </tr>
            </thead>
            <tbody>
                {tempData.map((k, idx) => (
                    <tr
                        key={idx}
                        className="odd:bg-white even:bg-gray-100 hover:bg-blue-50"
                    >
                        <td className={borderClass}>{k["Số hiệu văn bằng"]}</td>
                        <td className={borderClass}>{k["Họ và tên"]}</td>
                        <td className={borderClass}>{k["Ngày sinh"]}</td>
                        <td className={borderClass}>{k["Năm TN"]}</td>
                        <td className={borderClass}>{k["Ngành ĐT"]}</td>
                        <td className={borderClass}>{k["Hiệu lực"]}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

export default Table;
