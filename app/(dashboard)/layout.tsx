interface DashboardLayoutProps {
    children: React.ReactNode
}

import { Sidebar } from "./_components/sidebar"
import OrgSidebar from "./_components/org-sidebar"
import Navbar from "./_components/navbar"

const DashboardLayout = ({
    children
}: DashboardLayoutProps) => {
    return (
        <main className="h-full">
            <Sidebar />
            <div className="pl-0 lg:pl-[60px] h-full">
                <div className="flex gap-x-0 lg:gap-x-3 h-full">
                    <OrgSidebar />
                    <div className="h-full flex-1 w-full">
                        <Navbar />
                        {children}
                    </div>
                </div>
            </div>
        </main>
    )
}

export default DashboardLayout