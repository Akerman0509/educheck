// import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
// import { AppSidebar } from "@/components/app-sidebar"

import { AppTopbar } from "@/components/app-topbar";

export default function Layout({ children }) {
    return (
        <div className="flex flex-col min-h-screen">
            <AppTopbar />

            <main className="flex-1 flex flex-col justify-center items-center">
                {children}
            </main>

            <footer className="w-full h-10" />
        </div>
    );
}
