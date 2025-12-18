
function Table({ type, data, ...props }) {
    const borderClass = "p-2";
    const titleClass = "py-2 px-4 bg-blue-100 sticky top-0 z-20";

    // Collect all unique keys from all rows
    const columns = data && data.length > 0
        ? Array.from(
            data.reduce((set, row) => {
                Object.keys(row).forEach(key => set.add(key));
                return set;
            }, new Set())
        )
        : [];

    let tableBody;
    if (!data || data.length === 0) {
        tableBody = (
            <tr>
                <td colSpan={columns.length || 1} className="p-4 bg-blue-50">
                    Không có dữ liệu để hiển thị
                </td>
            </tr>
        );
    } else {
        tableBody = data.map((row, idx) => (
            <tr
                key={idx}
                className="odd:bg-white even:bg-gray-200 hover:bg-blue-50"
            >
                {columns.map(col => (
                    <td key={col} className={borderClass}>{row[col]}</td>
                ))}
            </tr>
        ));
    }

    return (
        <div className="max-h-[360px] overflow-y-auto rounded-xl">
            <table className="table-fixed border-transparent text-center">
                <thead>
                    <tr>
                        {columns.map(col => (
                            <th key={col} className={titleClass}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>{tableBody}</tbody>
            </table>
        </div>
    );
}

export default Table;
