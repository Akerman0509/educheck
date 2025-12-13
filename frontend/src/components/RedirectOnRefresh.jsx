import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useBlockchain } from "@/context/BlockchainContext";

function RedirectOnRefresh() {
    const blockchain = useBlockchain();
    const location = useLocation();

    if (!blockchain.isWalletConnected) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default RedirectOnRefresh;
