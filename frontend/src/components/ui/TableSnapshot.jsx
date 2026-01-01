import Button from "./button";

function TableSnapshot({ data, onRestore, loading, ...props }) {
    const borderClass1 = "py-2 px-5 text-sm";
    const titleClass = "py-2 px-4 bg-purple-100 sticky top-0 z-20 text-sm font-semibold";
    
    let tableBody;

    if (!data || data.length === 0) {
        tableBody = (
            <tr>
                <td colSpan="4" className="p-4 bg-purple-50">
                    Chưa có bản sao lưu nào
                </td>
            </tr>
        );
    } else {
        tableBody = data.map((k, idx) => (
            <tr
                key={k.snapshotId || idx}
                className="odd:bg-white even:bg-purple-50 hover:bg-purple-100"
            >
                <td className={borderClass1}>{k.snapshotId}</td>
                <td className={borderClass1}>{new Date(k.snapshotTimestamp).toLocaleString()}</td>
                <td className={borderClass1}>{k.totalDegrees}</td>
                <td className={borderClass1}>
                    <Button 
                        type="type3" 
                        size="small" 
                        className="py-1 px-3 text-xs"
                        onClick={() => onRestore(k.ipfsCid)}
                        disabled={loading}
                    >
                        Khôi phục
                    </Button>
                </td>
            </tr>
        ));
    }

    return (
        <div className="max-h-[360px] overflow-y-auto rounded-xl border border-purple-200 mt-6 w-full max-w-2xl">
            <h3 className="bg-purple-600 text-white p-2 text-center font-bold">Lịch sử Sao lưu (Snapshots)</h3>
            <table className="w-full border-collapse text-center">
                <thead>
                    <tr>
                        <th className={titleClass}>ID</th>
                        <th className={titleClass}>Thời gian</th>
                        <th className={titleClass}>Số lượng Bằng</th>
                        <th className={titleClass}>Hành động</th>
                    </tr>
                </thead>
                <tbody>{tableBody}</tbody>
            </table>
        </div>
    );
}

export default TableSnapshot;
