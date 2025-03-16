import Product from "../components/Product";
import Layout from "../Layout/Layouts";
import Searched from "../components/Searched";

export default function Home(){
    return(
        <Layout>
            <Product></Product>
            <Searched></Searched>
        </Layout>
    )
}