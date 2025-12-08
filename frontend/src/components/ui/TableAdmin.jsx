function TableSchool({ type, data, ...props }) {
    const borderClass1 = "py-2 px-5";
    const titleClass = "py-2 px-4 bg-blue-100 sticky top-0 z-20";
    let tableBody;


    if (!data || data.length === 0) {
        tableBody = (
            <tr>
                <td colSpan="2" className="p-4 bg-blue-50">
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
                <td className={borderClass1}>{k["Trường"]}</td>
                <td className={borderClass1}>{k["Thu hồi"]}
                    <div className="w-full h-full flex justify-center items-center">
                        <button
                            //onClick={() => handleRevoke(k)}
                            className="flex justify-center items-center w-10 h-10 rounded-full hover:bg-red-100 duration-200 hover:scale-110 focus:outline-none"
                        >
                            <img
                                src="/imgButton/remove.png"
                                className="w-7 h-7 object-contain select-none pointer-events-none"
                            />
                        </button>
                    </div>
                </td>
            </tr>
        ));
    }

    return (
        <div className="max-h-[360px] overflow-y-auto rounded-xl">
            <table className="table-fixed border-transparent text-center">
                <thead>
                    <tr>
                        <th className={titleClass}>Trường</th>
                        <th className={`${titleClass} w-28`}>Thu hồi</th>
                    </tr>
                </thead>
                <tbody>{tableBody}</tbody>
            </table>
        </div>
    );
}

export default TableSchool;
