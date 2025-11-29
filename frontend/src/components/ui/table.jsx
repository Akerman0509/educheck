function Table({ type, data, ...props }) {
    const borderClass1 = "p-2";
    const borderClass2 = "p-2 w-52 ";
    const titleClass = "py-2 px-4 bg-blue-100 sticky top-0 z-20";
    let tableBody;
    if (!data || data.length === 0) {
        tableBody = (
            <tr>
                <td colSpan="6" className="p-4 bg-blue-50">
                    Không có dữ liệu để hiển thị
                </td>
            </tr>
        );
    } else {
        tableBody = data.map((k, idx) => (
            <tr
                key={idx}
                className="odd:bg-white even:bg-gray-200  hover:bg-blue-50"
            >
                <td className={borderClass1}>{k["Số hiệu văn bằng"]}</td>
                <td className={borderClass2}>{k["Họ và tên"]}</td>
                <td className={borderClass1}>{k["Ngày sinh"]}</td>
                <td className={borderClass1}>{k["Năm TN"]}</td>
                <td className={borderClass2}>{k["Ngành ĐT"]}</td>
                <td className={borderClass1}>{k["Hiệu lực"]}</td>
            </tr>
        ));
    }

    return (
        <div className="max-h-[360px] overflow-y-auto rounded-xl">
            <table className="table-fixed border-transparent text-center">
                <thead>
                    <tr>
                        <th className={titleClass}>Số hiệu văn bằng</th>
                        <th className={titleClass}>Họ và tên</th>
                        <th className={titleClass}>Ngày sinh</th>
                        <th className={titleClass}>Năm TN</th>
                        <th className={titleClass}>Ngành ĐT</th>
                        <th className={titleClass}>Hiệu lực</th>
                    </tr>
                </thead>

                <tbody>{tableBody}</tbody>
            </table>
        </div>
    );
}

export default Table;
