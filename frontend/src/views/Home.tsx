import Carousel from "../components/Carousel";
import Product from "../components/Product";
import Layout from "../Layout/Layouts";
import Searched from "./Searched";

export default function Home(){
    return(
        <Layout>
            <Carousel></Carousel>
            <Product></Product>
        </Layout>
    )
}