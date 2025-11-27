// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
// import { AppSidebar } from "@/components/app-sidebar"

import { AppTopbar } from "@/components/app-topbar";

export default function Layout({ children }) {
    return (
        <div className="flex flex-col h-screen">
            <AppTopbar />
            {children}
        </div>
    );
}
