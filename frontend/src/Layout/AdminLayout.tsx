import Sidenav from "./Sidenav";

export default function AdminLayout({ children }: { children: React.ReactNode }){
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidenav />
            <main className="flex-1 p-4 sm:ml-64">
                <div className="mt-12 py-2 px-4">
                    {children}
                </div>
            </main>
        </div>
    );
}
