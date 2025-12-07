import { useState } from "react";
import WalletConnect from "./WalletConnect";
import { CheckCircle, Wallet } from "lucide-react";

function WalletConnectModal({ onClose, onConnect }) {
    return (
        <div
            className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
            onClick={onClose}
        >
            {/* stop click bubbling */}
            <div onClick={(e) => e.stopPropagation()}>
                <WalletConnect onClose={onClose} onConnect={onConnect} />
            </div>
        </div>
    );
}

export default function WalletButton() {
    const [open, setOpen] = useState(false);
    const [account, setAccount] = useState(null);
    const connected = !!account;
    console.log("connected = ", { connected });
    console.log("acc = ", { account });
    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className={`flex items-center rounded-md font-sans text-xl font-medium  active:scale-95 transition-all duration-150 p-2 text-white 
            ${
                connected
                    ? "bg-green-600  hover:bg-green-700"
                    : "bg-topbarBorder  hover:bg-blue-700 "
            }
            `}
            >
                {connected ? (
                    <>
                        <CheckCircle className="w-7 h-7 m-2" />
                        <div>Connected</div>
                    </>
                ) : (
                    <>
                        <Wallet className="w-7 h-7 m-2" />
                        Login
                    </>
                )}
            </button>

            {open && (
                <WalletConnectModal
                    onClose={() => setOpen(false)}
                    onConnect={(account) => setAccount(account)}
                />
            )}
        </>
    );
}
