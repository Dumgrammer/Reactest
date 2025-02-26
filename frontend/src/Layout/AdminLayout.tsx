import Footer from "./Footer";
import Sidenav from "./Sidenav";

export default function AdminLayout({ children }: { children: React.ReactNode }){
    return (
        <div className="flex">
            <Sidenav />

            <main className="flex-1 p-4 sm:ml-64">
                <div className="mt-4 p-4">
                    {children}
                </div>
            </main>
        </div>
    );
}
