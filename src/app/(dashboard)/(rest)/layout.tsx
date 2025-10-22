import AppHeader from "@/components/app-header"
import AppSidebar from "@/components/app-sidebar"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"


interface Props {
    children: React.ReactNode
}

const Layout = ({ children }: Props) => {
    return (
        <>
        <AppHeader />
            <main className="flex-1">
                {children}
            </main>
        </>
    )
}

export default Layout
