import Footer from "./Footer";
import Navbar from "./Navbar";

function Layout({ children }: { children: React.ReactNode }){
    return(
        <>
            <Navbar></Navbar>
            <main>{children}</main>
            <Footer></Footer>
        </>
    )
}

export default Layout;