import Button from "@/components/ui/button";
import WalletButton from "./ui/WalletButton";
import { NavLink, useNavigate } from "react-router-dom";

import { useBlockchain } from "@/context/BlockchainContext";

const logo = (
    <div className="h-full flex items-center justify-between">
        <img src="/img/logo1.png" className="h-36 object-contain" />
    </div>
);

function AppTopbar() {
    const blockchain = useBlockchain();

    const guardNavigation = (e) => {
        if (!blockchain.isWalletConnected) {
            e.preventDefault(); // 🔑 URL does NOT change
            window.alert("Please connect your wallet first.");
        }
    };
    return (
        <div className="w-full">
            <div className="w-full h-24 p-4  bg-topbarBg flex items-center">
                <div className=" z-10 h-full ">{logo}</div>

                <div className="flex space-x-4 justify-center flex-1">
                    <NavLink to="/">
                        {({ isActive }) => (
                            <Button type={isActive ? "type2" : "type1"}>
                                Trang chủ
                            </Button>
                        )}
                    </NavLink>
                    {/* protected */}
                    <NavLink to="/School" onClick={guardNavigation}>
                        {({ isActive }) => (
                            <Button type={isActive ? "type2" : "type1"}>
                                Trường học
                            </Button>
                        )}
                    </NavLink>
                    {/* protected */}
                    <NavLink to="/Student" onClick={guardNavigation}>
                        {({ isActive }) => (
                            <Button type={isActive ? "type2" : "type1"}>
                                Sinh viên
                            </Button>
                        )}
                    </NavLink>
                </div>
                <div className="flex items-center">
                    <WalletButton />
                </div>
            </div>
            <div className="w-full h-1.5 bg-topbarBorder"></div>
        </div>
    );
}

export { AppTopbar };
